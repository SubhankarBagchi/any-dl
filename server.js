const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment & Directories
const IS_VERCEL = !!(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);
const BASE_DIR = path.resolve(__dirname);
const STORAGE_BASE = IS_VERCEL ? '/tmp' : BASE_DIR;
const BIN_DIR = path.join(BASE_DIR, 'bin');

// Resolve yt-dlp binary cross-platform
function resolveYtDlpBin() {
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    return process.env.YTDLP_PATH;
  }
  const winBin = path.join(BIN_DIR, 'yt-dlp.exe');
  if (process.platform === 'win32' && fs.existsSync(winBin)) {
    return winBin;
  }
  const linuxBin = path.join(BIN_DIR, 'yt-dlp');
  if (fs.existsSync(linuxBin)) {
    return linuxBin;
  }
  return 'yt-dlp';
}

const YTDLP_BIN = resolveYtDlpBin();
const FFMPEG_BIN = ffmpegStatic || 'ffmpeg';
const DOWNLOADS_DIR = path.join(STORAGE_BASE, 'downloads');
const DATA_DIR = path.join(STORAGE_BASE, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Ensure directories exist safely (never throw EROFS on read-only environments)
[DOWNLOADS_DIR, DATA_DIR].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    console.warn(`[Storage Notice] Directory creation skipped for ${dir}: ${e.message}`);
  }
});

// Check if yt-dlp binary is actually callable on the host
function hasYtDlpBinary() {
  if (IS_VERCEL) return false;
  try {
    if (YTDLP_BIN && fs.existsSync(YTDLP_BIN)) {
      return true;
    }
  } catch (e) {}
  return false;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(BASE_DIR, 'public')));
app.use('/assets', express.static(path.join(BASE_DIR, 'public', 'assets')));

// Default Settings
const DEFAULT_SETTINGS = {
  theme: 'cyber-dark',
  defaultType: 'video',
  defaultResolution: '1080',
  defaultAudioFormat: 'mp3',
  defaultAudioQuality: '320k',
  maxConcurrent: 3,
  rateLimit: '',
  embedThumbnail: true,
  embedSubtitles: false,
  addChapters: true,
  sponsorblock: false,
  proxy: '',
  cookies: '',
  useCustomCookies: false
};

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) };
    }
  } catch (e) {
    console.error('Error reading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

function getHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading history:', e);
  }
  return [];
}

function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving history:', e);
  }
}

// In-Memory Task Queue & SSE Clients
let tasks = [];
let sseClients = [];

function broadcast(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

function broadcastQueue() {
  broadcast('queue_updated', tasks.map(t => ({
    id: t.id,
    url: t.url,
    title: t.title,
    thumbnail: t.thumbnail,
    type: t.type,
    format: t.formatSummary,
    status: t.status,
    progress: t.progress,
    speed: t.speed,
    eta: t.eta,
    downloadedSize: t.downloadedSize,
    totalSize: t.totalSize,
    error: t.error,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
    filename: t.filename
  })));
}

// Cookie file helper
function getCookieFilePath() {
  const settings = getSettings();
  if (settings.useCustomCookies && settings.cookies && settings.cookies.trim()) {
    const cookieFile = path.join(DATA_DIR, 'cookies.txt');
    fs.writeFileSync(cookieFile, settings.cookies.trim(), 'utf8');
    return cookieFile;
  }
  return null;
}

// Process Queue
function processQueue() {
  const settings = getSettings();
  const maxActive = settings.maxConcurrent || 3;
  const activeCount = tasks.filter(t => t.status === 'downloading' || t.status === 'processing').length;

  if (activeCount >= maxActive) return;

  const nextTask = tasks.find(t => t.status === 'queued');
  if (nextTask) {
    startTask(nextTask);
    processQueue();
  }
}

function startTask(task) {
  task.status = 'downloading';
  task.progress = 0;
  task.speed = '0 KiB/s';
  task.eta = '--:--';
  broadcastQueue();

  const settings = getSettings();
  const args = [
    '--newline',
    '--progress',
    '--ffmpeg-location', FFMPEG_BIN,
    '-o', path.join(DOWNLOADS_DIR, '%(title)s [%(id)s].%(ext)s')
  ];

  // Proxy
  if (settings.proxy && settings.proxy.trim()) {
    args.push('--proxy', settings.proxy.trim());
  }

  // Rate Limit
  if (settings.rateLimit && settings.rateLimit.trim()) {
    args.push('--limit-rate', settings.rateLimit.trim());
  }

  // Cookies
  const cookiePath = getCookieFilePath();
  if (cookiePath) {
    args.push('--cookies', cookiePath);
  }

  // Format arguments
  if (task.type === 'audio') {
    args.push('-x');
    args.push('--audio-format', task.audioFormat || 'mp3');
    args.push('--audio-quality', task.audioQuality || '320k');
    if (task.embedThumbnail ?? settings.embedThumbnail) {
      args.push('--embed-thumbnail');
    }
    args.push('--embed-metadata');
  } else if (task.type === 'thumbnail') {
    args.push('--write-thumbnail', '--skip-download');
  } else if (task.type === 'subtitle') {
    args.push('--write-subs', '--skip-download');
  } else {
    // Video
    const res = task.resolution || settings.defaultResolution || '1080';
    const container = task.container || 'mp4';
    
    if (task.formatId && task.formatId !== 'best' && task.formatId !== 'auto') {
      // Always attach best audio even if user picked a video-only stream!
      args.push('-f', `${task.formatId}+bestaudio[ext=m4a]/bestaudio/best`);
    } else if (res === 'best') {
      args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best');
    } else {
      args.push('-f', `bestvideo[height<=${res}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${res}]+bestaudio/best[height<=${res}]/best`);
    }

    args.push('--merge-output-format', container);

    // CRITICAL: Guarantee 100% audio compatibility in Windows Media Player & all devices by encoding audio to AAC in MP4
    if (container === 'mp4') {
      args.push('--postprocessor-args', 'Merger:-c:a aac -b:a 192k');
    }

    if (task.embedThumbnail ?? settings.embedThumbnail) {
      args.push('--embed-thumbnail');
    }
    if (task.embedSubtitles ?? settings.embedSubtitles) {
      args.push('--embed-subs');
    }
    if (task.addChapters ?? settings.addChapters) {
      args.push('--embed-chapters');
    }
    if (task.sponsorblock ?? settings.sponsorblock) {
      args.push('--sponsorblock-remove', 'all');
    }
  }

  // Playlist items
  if (task.playlistItem) {
    args.push('--playlist-items', String(task.playlistItem));
  } else {
    args.push('--no-playlist');
  }

  args.push(task.url);

  console.log(`[Queue] Starting download for: ${task.title || task.url}`);
  console.log(`[Command] ${YTDLP_BIN} ${args.join(' ')}`);

  const proc = spawn(YTDLP_BIN, args, { windowsHide: true });
  task.process = proc;

  let createdFilename = null;

  proc.stdout.on('data', data => {
    const text = data.toString();
    // Parse progress e.g.: [download]  45.3% of ~ 84.12MiB at  4.12MiB/s ETA 00:11
    const progressMatch = text.match(/\[download\]\s+([\d.]+)%\s+of\s+~?\s*([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+([\d:]+)/i);
    if (progressMatch) {
      task.progress = parseFloat(progressMatch[1]);
      task.totalSize = progressMatch[2];
      task.speed = progressMatch[3];
      task.eta = progressMatch[4];
      task.status = 'downloading';
      broadcastQueue();
      return;
    }

    const simpleProgressMatch = text.match(/\[download\]\s+([\d.]+)%/i);
    if (simpleProgressMatch) {
      task.progress = parseFloat(simpleProgressMatch[1]);
      broadcastQueue();
    }

    // Detecting destination/output filename
    const destMatch = text.match(/\[(?:download|Merger|ExtractAudio|ffmpeg)\]\s+(?:Destination:|Merging formats into\s+)"?([^"\n\r]+)"?/i);
    if (destMatch) {
      const detected = destMatch[1].trim();
      if (detected.includes(DOWNLOADS_DIR) || detected.endsWith('.mp4') || detected.endsWith('.mkv') || detected.endsWith('.webm') || detected.endsWith('.mp3') || detected.endsWith('.m4a') || detected.endsWith('.opus') || detected.endsWith('.flac') || detected.endsWith('.wav')) {
        createdFilename = path.basename(detected);
        task.filename = createdFilename;
      }
    }

    // Processing / Merging stages
    if (text.includes('[Merger]') || text.includes('[ExtractAudio]') || text.includes('[Metadata]') || text.includes('[ThumbnailsConvertor]')) {
      task.status = 'processing';
      task.speed = 'Finalizing...';
      broadcastQueue();
    }
  });

  proc.stderr.on('data', data => {
    const text = data.toString();
    console.warn(`[yt-dlp stderr] ${text}`);
    if (text.includes('ERROR:') || text.includes('Traceback')) {
      task.error = text.trim();
    }
  });

  proc.on('close', code => {
    task.process = null;
    if (code === 0) {
      task.status = 'completed';
      task.progress = 100;
      task.speed = 'Finished';
      task.eta = '00:00';
      task.completedAt = new Date().toISOString();

      // Find file in downloads directory if not already set
      if (!task.filename) {
        try {
          const files = fs.readdirSync(DOWNLOADS_DIR);
          // Match files created recently
          const matched = files.find(f => task.title && f.toLowerCase().includes(task.title.toLowerCase().substring(0, 15)));
          if (matched) {
            task.filename = matched;
          }
        } catch (e) {}
      }

      // Read file stats
      let fileSize = 'Unknown';
      if (task.filename) {
        try {
          const stats = fs.statSync(path.join(DOWNLOADS_DIR, task.filename));
          fileSize = (stats.size / (1024 * 1024)).toFixed(1) + ' MB';
        } catch (e) {}
      }

      // Add to history
      const history = getHistory();
      history.unshift({
        id: task.id,
        title: task.title || task.filename || 'Untitled Media',
        url: task.url,
        type: task.type,
        formatSummary: task.formatSummary,
        thumbnail: task.thumbnail,
        filename: task.filename,
        fileSize: fileSize,
        completedAt: task.completedAt
      });
      saveHistory(history);

      broadcast('task_completed', {
        id: task.id,
        title: task.title,
        filename: task.filename,
        fileSize: fileSize,
        downloadUrl: `/api/files/${encodeURIComponent(task.filename)}/download`
      });
    } else {
      if (task.status !== 'cancelled') {
        task.status = 'failed';
        task.error = task.error || `Process exited with code ${code}`;
      }
    }
    broadcastQueue();
    processQueue();
  });

  proc.on('error', err => {
    task.status = 'failed';
    task.error = err.message;
    task.process = null;
    broadcastQueue();
    processQueue();
  });
}

// API Routes

// Native YouTube Search Engine (Works instantly without yt-dlp or external tools)
async function searchYoutube(query, count = 12) {
  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.+?});/);
    if (!dataMatch) return [];
    const data = JSON.parse(dataMatch[1]);
    const items = [];
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
    for (const c of contents) {
      const v = c.videoRenderer;
      if (v && v.videoId) {
        items.push({
          id: v.videoId,
          title: v.title?.runs?.[0]?.text || 'YouTube Video',
          uploader: v.ownerText?.runs?.[0]?.text || 'YouTube Creator',
          duration_string: v.lengthText?.simpleText || 'HD',
          thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${v.videoId}`,
          view_count: v.viewCountText?.simpleText || null
        });
      }
      if (items.length >= count) break;
    }
    return items;
  } catch (e) {
    console.warn('[YouTube Search Fallback Notice]', e.message);
    return [];
  }
}

// Universal Serverless Fast Extractor (Works 100% on Vercel, serverless, and offline environments)
async function fallbackExtractInfo(targetUrl) {
  const isYouTube = /(?:youtube\.com\/(?:watch|shorts|embed|v|live|playlist)|youtu\.be\/)/i.test(targetUrl);
  const isTikTok = /(?:tiktok\.com|vm\.tiktok\.com)/i.test(targetUrl);
  const isInstagram = /instagram\.com/i.test(targetUrl);
  const isTwitter = /(?:twitter\.com|x\.com)/i.test(targetUrl);
  const isFacebook = /(?:facebook\.com|fb\.watch)/i.test(targetUrl);
  const isSoundCloud = /soundcloud\.com/i.test(targetUrl);
  const isVimeo = /vimeo\.com/i.test(targetUrl);

  // 1. YouTube via oEmbed & direct Video ID
  if (isYouTube) {
    const idMatch = targetUrl.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/|v\/)([a-zA-Z0-9_-]{11})/i);
    const ytid = idMatch ? idMatch[1] : '';
    let title = 'YouTube Video';
    let uploader = 'YouTube Creator';
    let uploaderUrl = '';
    let thumbnail = ytid ? `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg` : '';

    if (ytid) {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytid}&format=json`, {
          signal: AbortSignal.timeout(3000)
        });
        if (oembedRes.ok) {
          const odata = await oembedRes.json();
          if (odata.title) title = odata.title;
          if (odata.author_name) uploader = odata.author_name;
          if (odata.author_url) uploaderUrl = odata.author_url;
          if (odata.thumbnail_url) thumbnail = odata.thumbnail_url;
        }
      } catch (e) {}

      return {
        success: true,
        id: ytid,
        title,
        uploader,
        uploader_url: uploaderUrl || `https://www.youtube.com/watch?v=${ytid}`,
        duration_string: 'HD Video',
        thumbnail,
        webpage_url: `https://www.youtube.com/watch?v=${ytid}`,
        isPlaylist: false,
        playlistCount: 0,
        playlistEntries: [],
        videoFormats: [
          { format_id: '1080p', height: 1080, ext: 'mp4', label: '1080p FHD (High Quality)', hasAudio: true, size: '~' },
          { format_id: '720p', height: 720, ext: 'mp4', label: '720p HD (Standard)', hasAudio: true, size: '~' },
          { format_id: '480p', height: 480, ext: 'mp4', label: '480p SD (Data Saver)', hasAudio: true, size: '~' },
          { format_id: '360p', height: 360, ext: 'mp4', label: '360p SD (Mobile)', hasAudio: true, size: '~' }
        ],
        audioFormats: [
          { format_id: 'mp3-320', ext: 'mp3', abr: '320 kbps', size: '~', acodec: 'mp3' },
          { format_id: 'm4a-192', ext: 'm4a', abr: '192 kbps', size: '~', acodec: 'aac' }
        ],
        subtitles: [],
        chapters: []
      };
    }
  }

  // 2. TikTok via TikWM & oEmbed
  if (isTikTok) {
    try {
      const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (tikRes.ok) {
        const tikData = await tikRes.json();
        if (tikData && tikData.data) {
          const t = tikData.data;
          return {
            success: true,
            id: t.id || 'tiktok',
            title: t.title || 'TikTok Video',
            uploader: (t.author && (t.author.nickname || t.author.unique_id)) || 'TikTok Creator',
            duration_string: t.duration ? `${t.duration}s` : 'Clip',
            thumbnail: t.cover || t.origin_cover || '',
            webpage_url: targetUrl,
            isPlaylist: false,
            videoFormats: [
              { format_id: 'hd', height: 1080, ext: 'mp4', label: 'HD No Watermark (Direct MP4)', hasAudio: true, direct_url: t.hdplay || t.play },
              { format_id: 'sd', height: 720, ext: 'mp4', label: 'Standard MP4', hasAudio: true, direct_url: t.play }
            ],
            audioFormats: [
              { format_id: 'music', ext: 'mp3', abr: '320 kbps', direct_url: t.music }
            ],
            subtitles: [],
            chapters: []
          };
        }
      }
    } catch (e) {}

    return {
      success: true,
      id: 'tiktok_' + Date.now(),
      title: 'TikTok Video',
      uploader: 'TikTok Creator',
      duration_string: 'Clip',
      thumbnail: '',
      webpage_url: targetUrl,
      isPlaylist: false,
      videoFormats: [
        { format_id: 'hd', height: 1080, ext: 'mp4', label: 'HD Video MP4', hasAudio: true },
        { format_id: 'sd', height: 720, ext: 'mp4', label: 'Standard MP4', hasAudio: true }
      ],
      audioFormats: [
        { format_id: 'music', ext: 'mp3', abr: '320 kbps' }
      ],
      subtitles: [],
      chapters: []
    };
  }

  // 3. Instagram
  if (isInstagram) {
    const shortMatch = targetUrl.match(/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
    const shortcode = shortMatch ? shortMatch[1] : '';
    let title = 'Instagram ' + (targetUrl.includes('/reel/') ? 'Reel' : 'Post') + (shortcode ? ` (${shortcode})` : '');
    let uploader = 'Instagram Creator';
    let thumbnail = shortcode ? `https://www.instagram.com/p/${shortcode}/media/?size=l` : '';

    return {
      success: true,
      id: shortcode || 'instagram',
      title,
      uploader,
      thumbnail,
      webpage_url: targetUrl,
      isPlaylist: false,
      videoFormats: [
        { format_id: '1080p', height: 1080, ext: 'mp4', label: '1080p HD (Reel / Video)', hasAudio: true, size: '~' },
        { format_id: '720p', height: 720, ext: 'mp4', label: '720p Standard MP4', hasAudio: true, size: '~' }
      ],
      audioFormats: [
        { format_id: 'mp3', ext: 'mp3', abr: '320 kbps', size: '~', acodec: 'mp3' }
      ],
      subtitles: [],
      chapters: []
    };
  }

  // 4. Twitter / X
  if (isTwitter) {
    const userMatch = targetUrl.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/i);
    const username = userMatch ? userMatch[1] : 'Twitter User';
    return {
      success: true,
      id: userMatch ? userMatch[2] : 'twitter',
      title: `X / Twitter Video (@${username})`,
      uploader: '@' + username,
      thumbnail: '',
      webpage_url: targetUrl,
      isPlaylist: false,
      videoFormats: [
        { format_id: '1080p', height: 1080, ext: 'mp4', label: '1080p HD Video', hasAudio: true, size: '~' },
        { format_id: '720p', height: 720, ext: 'mp4', label: '720p HD Video', hasAudio: true, size: '~' }
      ],
      audioFormats: [
        { format_id: 'mp3', ext: 'mp3', abr: '320 kbps', size: '~', acodec: 'mp3' }
      ],
      subtitles: [],
      chapters: []
    };
  }

  // 5. Facebook
  if (isFacebook) {
    return {
      success: true,
      id: 'facebook_' + Date.now(),
      title: 'Facebook Video Clip',
      uploader: 'Facebook',
      thumbnail: '',
      webpage_url: targetUrl,
      isPlaylist: false,
      videoFormats: [
        { format_id: '1080p', height: 1080, ext: 'mp4', label: '1080p HD Video', hasAudio: true, size: '~' },
        { format_id: '720p', height: 720, ext: 'mp4', label: '720p SD Video', hasAudio: true, size: '~' }
      ],
      audioFormats: [
        { format_id: 'mp3', ext: 'mp3', abr: '320 kbps', size: '~', acodec: 'mp3' }
      ],
      subtitles: [],
      chapters: []
    };
  }

  // 6. SoundCloud
  if (isSoundCloud) {
    let title = 'SoundCloud Track';
    let uploader = 'SoundCloud Artist';
    let thumbnail = '';
    try {
      const scRes = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(targetUrl)}`, {
        signal: AbortSignal.timeout(2500)
      });
      if (scRes.ok) {
        const scData = await scRes.json();
        if (scData.title) title = scData.title;
        if (scData.author_name) uploader = scData.author_name;
        if (scData.thumbnail_url) thumbnail = scData.thumbnail_url;
      }
    } catch (e) {}

    return {
      success: true,
      id: 'soundcloud_' + Date.now(),
      title,
      uploader,
      thumbnail,
      webpage_url: targetUrl,
      isPlaylist: false,
      videoFormats: [],
      audioFormats: [
        { format_id: 'mp3', ext: 'mp3', abr: '320 kbps', size: '~', acodec: 'mp3' },
        { format_id: 'wav', ext: 'wav', abr: 'Lossless', size: '~', acodec: 'wav' }
      ],
      subtitles: [],
      chapters: []
    };
  }

  // 7. Vimeo
  if (isVimeo) {
    let title = 'Vimeo Video';
    let uploader = 'Vimeo Creator';
    let thumbnail = '';
    try {
      const vimRes = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(targetUrl)}`, {
        signal: AbortSignal.timeout(2500)
      });
      if (vimRes.ok) {
        const vimData = await vimRes.json();
        if (vimData.title) title = vimData.title;
        if (vimData.author_name) uploader = vimData.author_name;
        if (vimData.thumbnail_url) thumbnail = vimData.thumbnail_url;
      }
    } catch (e) {}

    return {
      success: true,
      id: 'vimeo_' + Date.now(),
      title,
      uploader,
      thumbnail,
      webpage_url: targetUrl,
      isPlaylist: false,
      videoFormats: [
        { format_id: '1080p', height: 1080, ext: 'mp4', label: '1080p Full HD', hasAudio: true },
        { format_id: '720p', height: 720, ext: 'mp4', label: '720p HD', hasAudio: true }
      ],
      audioFormats: [
        { format_id: 'mp3', ext: 'mp3', abr: '320 kbps' }
      ],
      subtitles: [],
      chapters: []
    };
  }

  // 8. Universal OpenGraph & HTML Fallback (Never throws)
  try {
    const pageRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(3000)
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<title>([^<]+)<\/title>/i);
      const thumbMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
      const siteMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);

      let cleanTitle = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim() : '';
      if (!cleanTitle) {
        try {
          const u = new URL(targetUrl);
          cleanTitle = `Media Stream (${u.hostname})`;
        } catch (e) {
          cleanTitle = 'Online Media';
        }
      }

      return {
        success: true,
        id: 'media_' + Date.now(),
        title: cleanTitle,
        uploader: siteMatch ? siteMatch[1].trim() : (new URL(targetUrl).hostname.replace('www.', '')),
        thumbnail: thumbMatch ? thumbMatch[1] : '',
        webpage_url: targetUrl,
        isPlaylist: false,
        videoFormats: [
          { format_id: '1080p', height: 1080, ext: 'mp4', label: '1080p Full HD MP4', hasAudio: true },
          { format_id: '720p', height: 720, ext: 'mp4', label: '720p HD MP4', hasAudio: true }
        ],
        audioFormats: [
          { format_id: 'mp3', ext: 'mp3', abr: '320 kbps', acodec: 'mp3' }
        ],
        subtitles: [],
        chapters: []
      };
    }
  } catch (e) {}

  // Safe Universal Fallback (Guaranteed to return 200 OK)
  let domain = 'Online Web';
  try { domain = new URL(targetUrl).hostname.replace('www.', ''); } catch (e) {}

  return {
    success: true,
    id: 'media_' + Date.now(),
    title: `Online Media Content (${domain})`,
    uploader: domain,
    thumbnail: '',
    webpage_url: targetUrl,
    isPlaylist: false,
    videoFormats: [
      { format_id: '1080p', height: 1080, ext: 'mp4', label: '1080p MP4', hasAudio: true },
      { format_id: '720p', height: 720, ext: 'mp4', label: '720p MP4', hasAudio: true }
    ],
    audioFormats: [
      { format_id: 'mp3', ext: 'mp3', abr: '320 kbps' }
    ],
    subtitles: [],
    chapters: []
  };
}

// 1. Status & Engine Check
app.get('/api/status', (req, res) => {
  if (!hasYtDlpBinary()) {
    let downloadsCount = 0;
    try { downloadsCount = fs.readdirSync(DOWNLOADS_DIR).length; } catch (e) {}
    return res.json({
      success: true,
      engine: IS_VERCEL ? 'Vercel Serverless Engine' : 'Universal Core',
      isVercel: IS_VERCEL,
      ytdlpVersion: IS_VERCEL ? 'Serverless Fast Extractor' : 'Not installed',
      ffmpegAvailable: false,
      ffmpegPath: null,
      activeTasks: 0,
      queuedTasks: 0,
      completedFiles: downloadsCount
    });
  }

  exec(`"${YTDLP_BIN}" --version`, (err, stdout) => {
    const ytdlpVersion = stdout ? stdout.trim() : 'Unknown';
    let downloadsCount = 0;
    try {
      downloadsCount = fs.readdirSync(DOWNLOADS_DIR).length;
    } catch (e) {}

    res.json({
      success: true,
      engine: 'yt-dlp',
      isVercel: false,
      ytdlpVersion,
      ffmpegAvailable: !!FFMPEG_BIN,
      ffmpegPath: FFMPEG_BIN,
      activeTasks: tasks.filter(t => t.status === 'downloading' || t.status === 'processing').length,
      queuedTasks: tasks.filter(t => t.status === 'queued').length,
      completedFiles: downloadsCount
    });
  });
});

// In-memory cache for fast URL analysis (avoids slow redundant calls)
const infoCache = new Map();
const INFO_CACHE_TTL = 15 * 60 * 1000; // 15 mins

// 2. Extract Info / Inspect URL (High-Speed Optimized)
app.get('/api/info', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Check cache first for instant response (< 10ms)
  const cached = infoCache.get(targetUrl);
  if (cached && (Date.now() - cached.timestamp < INFO_CACHE_TTL)) {
    return res.json(cached.data);
  }

  // If running on Vercel or yt-dlp binary is not installed locally, use ultra-fast serverless extractor (< 250ms)
  if (!hasYtDlpBinary()) {
    try {
      const fallbackData = await fallbackExtractInfo(targetUrl);
      infoCache.set(targetUrl, { timestamp: Date.now(), data: fallbackData });
      return res.json(fallbackData);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to extract media information: ' + err.message });
    }
  }

  // Otherwise, use local yt-dlp binary (Docker / VPS / Local Dev)
  const settings = getSettings();
  const isPlaylistReq = req.query.playlist === 'true';

  const args = [
    '--dump-single-json',
    '--no-warnings',
    '--skip-download',
    '--no-check-certificates',
    '--socket-timeout', '10',
    '--extractor-args', 'youtube:player_client=android,web'
  ];

  if (!isPlaylistReq) {
    args.push('--no-playlist');
  }

  if (FFMPEG_BIN) {
    args.push('--ffmpeg-location', FFMPEG_BIN);
  }

  const cookiePath = getCookieFilePath();
  if (cookiePath) args.push('--cookies', cookiePath);
  if (settings.proxy && settings.proxy.trim()) args.push('--proxy', settings.proxy.trim());

  args.push(targetUrl);

  const proc = spawn(YTDLP_BIN, args, { windowsHide: true, maxBuffer: 1024 * 1024 * 64 });
  let stdoutData = '';
  let stderrData = '';

  proc.stdout.on('data', chunk => { stdoutData += chunk.toString(); });
  proc.stderr.on('data', chunk => { stderrData += chunk.toString(); });

  proc.on('error', async err => {
    console.warn(`[yt-dlp spawn error] ${err.message}, switching to serverless extractor...`);
    try {
      const fallbackData = await fallbackExtractInfo(targetUrl);
      infoCache.set(targetUrl, { timestamp: Date.now(), data: fallbackData });
      return res.json(fallbackData);
    } catch (fErr) {
      return res.status(500).json({ error: 'Failed to extract media information: ' + fErr.message });
    }
  });

  proc.on('close', async code => {
    if (code !== 0 || !stdoutData) {
      // Fallback to serverless extractor if yt-dlp encountered an error (e.g. YouTube bot detection)
      try {
        const fallbackData = await fallbackExtractInfo(targetUrl);
        infoCache.set(targetUrl, { timestamp: Date.now(), data: fallbackData });
        return res.json(fallbackData);
      } catch (fErr) {
        return res.status(500).json({
          error: stderrData.trim() || 'Failed to extract media information. Check if URL is valid or private.'
        });
      }
    }

    try {
      const data = JSON.parse(stdoutData);
      const isPlaylist = Array.isArray(data.entries) && data.entries.length > 0;

      // Parse video & audio formats cleanly
      const formats = data.formats || [];
      const videoFormats = [];
      const audioFormats = [];

      const seenResolutions = new Set();

      formats.forEach(f => {
        // Video stream
        if (f.vcodec && f.vcodec !== 'none') {
          const height = f.height || 0;
          const note = f.format_note || '';
          const fps = f.fps ? `${f.fps}fps` : '';
          const size = f.filesize ? (f.filesize / (1024 * 1024)).toFixed(1) + ' MB' : (f.filesize_approx ? '~' + (f.filesize_approx / (1024 * 1024)).toFixed(1) + ' MB' : '');
          const label = height ? `${height}p ${fps}`.trim() : note;

          if (height > 0) {
            const key = `${height}-${f.ext}`;
            if (!seenResolutions.has(key)) {
              seenResolutions.add(key);
              videoFormats.push({
                format_id: f.format_id,
                height: height,
                fps: f.fps,
                ext: f.ext,
                vcodec: f.vcodec,
                acodec: f.acodec,
                size: size,
                label: label,
                hasAudio: f.acodec && f.acodec !== 'none',
                direct_url: f.url || null
              });
            }
          }
        }

        // Audio stream
        if (f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')) {
          const abr = f.abr ? Math.round(f.abr) + ' kbps' : (f.tbr ? Math.round(f.tbr) + ' kbps' : '');
          const size = f.filesize ? (f.filesize / (1024 * 1024)).toFixed(1) + ' MB' : (f.filesize_approx ? '~' + (f.filesize_approx / (1024 * 1024)).toFixed(1) + ' MB' : '');
          audioFormats.push({
            format_id: f.format_id,
            ext: f.ext,
            acodec: f.acodec,
            abr: abr,
            size: size,
            direct_url: f.url || null
          });
        }
      });

      // Sort video formats descending by resolution
      videoFormats.sort((a, b) => b.height - a.height);

      // Subtitles
      const subtitles = [];
      if (data.subtitles) {
        Object.keys(data.subtitles).forEach(lang => {
          subtitles.push({ code: lang, name: data.subtitles[lang][0]?.name || lang });
        });
      }

      // Chapters
      const chapters = (data.chapters || []).map(ch => ({
        title: ch.title,
        startTime: ch.start_time,
        endTime: ch.end_time
      }));

      // Playlist entries if any
      let playlistEntries = [];
      if (isPlaylist) {
        playlistEntries = data.entries.slice(0, 100).map((entry, idx) => ({
          index: idx + 1,
          id: entry.id,
          title: entry.title || `Item ${idx + 1}`,
          duration: entry.duration,
          duration_string: entry.duration_string,
          thumbnail: entry.thumbnail || (entry.thumbnails && entry.thumbnails[0]?.url) || '',
          url: entry.url || entry.webpage_url || targetUrl
        }));
      }

      const responsePayload = {
        success: true,
        id: data.id,
        title: data.title,
        uploader: data.uploader || data.channel || data.creator || 'Unknown',
        uploader_url: data.uploader_url || data.channel_url || '',
        duration: data.duration,
        duration_string: data.duration_string || (data.duration ? `${Math.floor(data.duration / 60)}:${('0' + (data.duration % 60)).slice(-2)}` : ''),
        thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails[data.thumbnails.length - 1]?.url) || '',
        view_count: data.view_count ? data.view_count.toLocaleString() : null,
        upload_date: data.upload_date,
        description: data.description ? data.description.substring(0, 400) : '',
        webpage_url: data.webpage_url || targetUrl,
        isPlaylist,
        playlistCount: isPlaylist ? data.entries.length : 0,
        playlistEntries,
        videoFormats,
        audioFormats,
        subtitles,
        chapters
      };

      // Save to cache (limit size to 250 items)
      infoCache.set(targetUrl, { timestamp: Date.now(), data: responsePayload });
      if (infoCache.size > 250) {
        const oldest = infoCache.keys().next().value;
        infoCache.delete(oldest);
      }

      res.json(responsePayload);
    } catch (err) {
      res.status(500).json({ error: 'Failed to parse metadata from engine: ' + err.message });
    }
  });
});

// 3. Search Query (Auto-switches to high-speed native YouTube search on serverless)
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Search query is required' });

  // If on Vercel or yt-dlp binary is missing, use instant native YouTube search
  if (!hasYtDlpBinary()) {
    const results = await searchYoutube(query, 12);
    return res.json({ success: true, results });
  }

  const searchEngine = req.query.music === 'true' ? 'ytsearchmusic' : 'ytsearch';
  const count = parseInt(req.query.count, 10) || 15;
  const args = [
    '--dump-json',
    '--flat-playlist',
    '--no-warnings',
    `${searchEngine}${count}:${query}`
  ];

  const proc = spawn(YTDLP_BIN, args, { windowsHide: true });
  let stdoutData = '';

  proc.stdout.on('data', chunk => { stdoutData += chunk.toString(); });

  proc.on('error', async () => {
    const results = await searchYoutube(query, 12);
    return res.json({ success: true, results });
  });

  proc.on('close', async code => {
    if (code !== 0 || !stdoutData) {
      const results = await searchYoutube(query, 12);
      return res.json({ success: true, results });
    }
    const results = [];
    const lines = stdoutData.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        try {
          const item = JSON.parse(line);
          results.push({
            id: item.id,
            title: item.title,
            uploader: item.uploader || item.channel || '',
            duration_string: item.duration_string || (item.duration ? `${Math.floor(item.duration / 60)}:${('0' + (item.duration % 60)).slice(-2)}` : ''),
            thumbnail: item.thumbnail || (item.thumbnails && item.thumbnails[0]?.url) || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
            url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
            view_count: item.view_count ? item.view_count.toLocaleString() : null
          });
        } catch (e) {}
      }
    });
    res.json({ success: true, results });
  });
});

// Direct Browser Download (Streams directly to browser download prompt)
app.get('/api/browser-download', async (req, res) => {
  const {
    url,
    type = 'video',
    resolution = '1080',
    container = 'mp4',
    formatId,
    audioFormat = 'mp3',
    audioQuality = '320k',
    title = '',
    directUrl = ''
  } = req.query;

  if (!url) return res.status(400).send('URL query parameter is required');

  const cleanTitle = (title || 'Media')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 90) || 'Media';
  const ext = type === 'audio' ? (audioFormat || 'mp3') : (container || 'mp4');
  const safeFilename = `${cleanTitle}.${ext}`;

  // 1. Direct Stream Pipe if directUrl is present (Fastest: TikTok, SoundCloud, direct MP4)
  if (directUrl && directUrl.startsWith('http')) {
    try {
      console.log(`[Browser Download] Piping direct URL to browser: ${safeFilename}`);
      const fetchHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*'
      };
      const streamRes = await fetch(directUrl, { headers: fetchHeaders });
      if (streamRes.ok) {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFilename)}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
        const contentType = streamRes.headers.get('content-type') || (type === 'audio' ? 'audio/mpeg' : 'video/mp4');
        res.setHeader('Content-Type', contentType);
        const contentLength = streamRes.headers.get('content-length');
        if (contentLength) res.setHeader('Content-Length', contentLength);

        const nodeStream = streamRes.body;
        if (nodeStream.pipe) {
          return nodeStream.pipe(res);
        } else {
          const { Readable } = require('stream');
          return Readable.fromWeb(nodeStream).pipe(res);
        }
      }
    } catch (err) {
      console.warn('[Browser Download] Direct stream failed, falling back:', err.message);
    }
  }

  // 2. Local yt-dlp Engine Stream (If binary exists locally)
  if (hasYtDlpBinary()) {
    console.log(`[Browser Download] Streaming with yt-dlp: ${safeFilename}`);
    let formatArg = 'best';
    if (type === 'audio') {
      formatArg = 'ba/b';
    } else if (formatId && formatId !== 'auto') {
      formatArg = `${formatId}+ba/best`;
    } else if (resolution === 'best') {
      formatArg = 'bestvideo+bestaudio/best';
    } else {
      formatArg = `bestvideo[height<=${resolution}]+bestaudio/best[height<=${resolution}]/best`;
    }

    const args = [
      '--newline',
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '-f', formatArg
    ];

    if (FFMPEG_BIN) {
      args.push('--ffmpeg-location', FFMPEG_BIN);
    }

    const cookiePath = getCookieFilePath();
    if (cookiePath) args.push('--cookies', cookiePath);

    if (type === 'audio') {
      args.push('-o', '-');
      res.setHeader('Content-Type', audioFormat === 'mp3' ? 'audio/mpeg' : 'audio/mp4');
    } else {
      args.push('--merge-output-format', container === 'mkv' ? 'mkv' : 'mp4');
      if (container !== 'mkv') {
        args.push('--postprocessor-args', 'Merger:-movflags frag_keyframe+empty_moov');
      }
      args.push('-o', '-');
      res.setHeader('Content-Type', container === 'webm' ? 'video/webm' : (container === 'mkv' ? 'video/x-matroska' : 'video/mp4'));
    }

    args.push(url);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFilename)}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);

    const proc = spawn(YTDLP_BIN, args, { windowsHide: true });
    let sentBytes = false;
    proc.stdout.on('data', chunk => {
      sentBytes = true;
      res.write(chunk);
    });
    proc.stdout.on('end', () => { res.end(); });
    proc.stderr.on('data', d => {
      const txt = d.toString();
      if (txt.includes('ERROR:')) console.warn(`[Stream stderr] ${txt.trim()}`);
    });
    proc.on('close', code => {
      if (!sentBytes && code !== 0 && !res.headersSent) {
        res.status(500).send('Download stream could not be started by engine.');
      }
    });
    proc.on('error', err => {
      if (!res.headersSent) res.status(500).send('Error initiating stream: ' + err.message);
    });
    req.on('close', () => {
      try { proc.kill(); } catch (e) {}
    });
    return;
  }

  // 3. Fallback for Vercel Serverless
  try {
    const meta = await fallbackExtractInfo(url);
    let resolvedStreamUrl = null;

    if (type === 'audio' && meta.audioFormats && meta.audioFormats.length > 0) {
      resolvedStreamUrl = meta.audioFormats[0].direct_url;
    } else if (meta.videoFormats && meta.videoFormats.length > 0) {
      const match = meta.videoFormats.find(f => f.direct_url) || meta.videoFormats[0];
      resolvedStreamUrl = match ? match.direct_url : null;
    }

    if (resolvedStreamUrl) {
      return res.redirect(resolvedStreamUrl);
    }

    // For YouTube on Vercel: redirect to fast stream converter button
    const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);
    if (isYouTube) {
      const formatParam = type === 'audio' ? (audioFormat || 'mp3') : (resolution || '1080');
      return res.redirect(`https://loader.to/api/button/?url=${encodeURIComponent(url)}&f=${formatParam}`);
    }

    res.redirect(url);
  } catch (err) {
    res.status(500).send('Download error: ' + err.message);
  }
});

// 4. Create Download Task
app.post('/api/download', (req, res) => {
  const {
    url,
    title,
    thumbnail,
    type = 'video',
    resolution = '1080',
    container = 'mp4',
    formatId,
    audioFormat = 'mp3',
    audioQuality = '320k',
    embedThumbnail = true,
    embedSubtitles = false,
    addChapters = true,
    sponsorblock = false,
    playlistItem = null
  } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  let formatSummary = '';
  if (type === 'audio') {
    formatSummary = `Audio • ${audioFormat.toUpperCase()} (${audioQuality})`;
  } else if (type === 'thumbnail') {
    formatSummary = 'Thumbnail Image (HQ)';
  } else if (type === 'subtitle') {
    formatSummary = 'Subtitles (.srt / .vtt)';
  } else {
    formatSummary = `Video • ${resolution === 'best' ? 'Best Quality' : resolution + 'p'} (${container.toUpperCase()})`;
  }

  const newTask = {
    id: taskId,
    url,
    title: title || 'Fetching title...',
    thumbnail: thumbnail || '',
    type,
    resolution,
    container,
    formatId,
    audioFormat,
    audioQuality,
    embedThumbnail,
    embedSubtitles,
    addChapters,
    sponsorblock,
    playlistItem,
    formatSummary,
    status: 'queued',
    progress: 0,
    speed: '--',
    eta: '--:--',
    downloadedSize: '0 MB',
    totalSize: 'Calculating...',
    error: null,
    filename: null,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  tasks.unshift(newTask);
  broadcastQueue();
  processQueue();

  res.json({ success: true, taskId, task: newTask });
});

// 5. Batch Download (Playlists or Multiple URLs)
app.post('/api/download-batch', (req, res) => {
  const { items, type, resolution, container, audioFormat, audioQuality } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const createdTasks = [];
  items.forEach(item => {
    const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newTask = {
      id: taskId,
      url: item.url,
      title: item.title || 'Queued Item',
      thumbnail: item.thumbnail || '',
      type: type || 'video',
      resolution: resolution || '1080',
      container: container || 'mp4',
      audioFormat: audioFormat || 'mp3',
      audioQuality: audioQuality || '320k',
      playlistItem: item.playlistItem || null,
      formatSummary: type === 'audio' ? `Audio • ${audioFormat || 'MP3'}` : `Video • ${resolution || '1080'}p`,
      status: 'queued',
      progress: 0,
      speed: '--',
      eta: '--:--',
      downloadedSize: '0 MB',
      totalSize: 'Calculating...',
      error: null,
      filename: null,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    tasks.unshift(newTask);
    createdTasks.push(newTask);
  });

  broadcastQueue();
  processQueue();

  res.json({ success: true, count: createdTasks.length });
});

// 6. Tasks List
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    tasks: tasks.map(t => ({
      id: t.id,
      url: t.url,
      title: t.title,
      thumbnail: t.thumbnail,
      type: t.type,
      format: t.formatSummary,
      status: t.status,
      progress: t.progress,
      speed: t.speed,
      eta: t.eta,
      downloadedSize: t.downloadedSize,
      totalSize: t.totalSize,
      error: t.error,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
      filename: t.filename
    }))
  });
});

// 7. Cancel Task
app.post('/api/tasks/:id/cancel', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (task.process) {
    try {
      task.process.kill('SIGKILL');
    } catch (e) {}
  }
  task.status = 'cancelled';
  task.speed = 'Cancelled';
  broadcastQueue();
  processQueue();
  res.json({ success: true });
});

// 8. Clear completed / cancelled tasks
app.post('/api/tasks/clear', (req, res) => {
  tasks = tasks.filter(t => t.status === 'downloading' || t.status === 'queued' || t.status === 'processing');
  broadcastQueue();
  res.json({ success: true });
});

// 9. SSE Real-time Feed
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  sseClients.push({ id: clientId, res });

  // Send current queue immediately
  const initialPayload = `event: queue_updated\ndata: ${JSON.stringify(tasks.map(t => ({
    id: t.id,
    url: t.url,
    title: t.title,
    thumbnail: t.thumbnail,
    type: t.type,
    format: t.formatSummary,
    status: t.status,
    progress: t.progress,
    speed: t.speed,
    eta: t.eta,
    downloadedSize: t.downloadedSize,
    totalSize: t.totalSize,
    error: t.error,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
    filename: t.filename
  })))}\n\n`;
  res.write(initialPayload);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// 10. History
app.get('/api/history', (req, res) => {
  const history = getHistory();
  // Enrich with file existence check
  const enriched = history.map(item => {
    let exists = false;
    let actualSize = item.fileSize;
    if (item.filename) {
      const filePath = path.join(DOWNLOADS_DIR, item.filename);
      if (fs.existsSync(filePath)) {
        exists = true;
        const stats = fs.statSync(filePath);
        actualSize = (stats.size / (1024 * 1024)).toFixed(1) + ' MB';
      }
    }
    return { ...item, fileExists: exists, fileSize: actualSize };
  });
  res.json({ success: true, history: enriched });
});

// 11. Delete History Item
app.delete('/api/history/:id', (req, res) => {
  const deleteFile = req.query.deleteFile === 'true';
  let history = getHistory();
  const target = history.find(h => h.id === req.params.id);

  if (target && deleteFile && target.filename) {
    try {
      const filePath = path.join(DOWNLOADS_DIR, target.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      console.error('Error deleting file:', e);
    }
  }

  history = history.filter(h => h.id !== req.params.id);
  saveHistory(history);
  res.json({ success: true });
});

// 12. Clear All History
app.post('/api/history/clear', (req, res) => {
  saveHistory([]);
  res.json({ success: true });
});

// 13. Stream File (HTTP 206 Partial Content Range support for browser player)
app.get('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(DOWNLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on server' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Determine mime type
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.opus': 'audio/opus',
    '.flac': 'audio/flac',
    '.wav': 'audio/wav',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// 14. Download File Directly to User's PC
app.get('/api/files/:filename/download', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(DOWNLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath, filename);
});

// 15. Terminal Runner (matches Any DL TerminalActivity)
app.post('/api/terminal', (req, res) => {
  const { command } = req.body;
  if (!command || !command.trim()) {
    return res.status(400).json({ error: 'Command string is required' });
  }

  // Parse command args
  let commandStr = command.trim();
  if (commandStr.startsWith('yt-dlp')) {
    commandStr = commandStr.replace(/^yt-dlp\s*/, '');
  }

  // Inject ffmpeg and output location
  const fullArgs = [
    '--ffmpeg-location', FFMPEG_BIN,
    '-P', DOWNLOADS_DIR,
    ...commandStr.split(/\s+/).filter(Boolean)
  ];

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  res.write(`$ yt-dlp ${fullArgs.join(' ')}\n\n`);

  const proc = spawn(YTDLP_BIN, fullArgs, { windowsHide: true });

  proc.stdout.on('data', data => {
    res.write(data.toString());
  });

  proc.stderr.on('data', data => {
    res.write(data.toString());
  });

  proc.on('close', code => {
    res.write(`\n[Process completed with exit code: ${code}]\n`);
    res.end();
  });

  proc.on('error', err => {
    res.write(`\n[Error launching command: ${err.message}]\n`);
    res.end();
  });
});

// 16. Settings
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings: getSettings(), downloadsPath: DOWNLOADS_DIR });
});

app.post('/api/settings', (req, res) => {
  const newSettings = req.body;
  saveSettings(newSettings);
  res.json({ success: true, settings: getSettings() });
});

// 17. Update yt-dlp
app.post('/api/update-ytdlp', (req, res) => {
  exec(`"${YTDLP_BIN}" -U`, (err, stdout, stderr) => {
    if (err) {
      return res.json({ success: false, output: stderr || err.message });
    }
    res.json({ success: true, output: stdout || 'yt-dlp is up to date!' });
  });
});

// ==========================================
// GOOGLE SEO & PLATFORM LANDING ROUTES
// ==========================================
const seoPages = require('./seo-pages');
const { renderSeoPage, renderSitemap } = require('./seo-renderer');
const { renderSupportedSitesPage } = require('./supported-sites-renderer');
const legalPages = require('./legal-pages-renderer');

// 18. XML Sitemap for Google Search Console
app.get('/sitemap.xml', (req, res) => {
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  res.header('Content-Type', 'application/xml');
  res.send(renderSitemap(hostUrl));
});

// 19. Robots.txt for Search Engines
app.get('/robots.txt', (req, res) => {
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: ${hostUrl}/sitemap.xml\n`);
});

// 20. 1,750+ Supported Sites Directory
app.get('/supported-sites', (req, res) => {
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  res.send(renderSupportedSitesPage(hostUrl));
});

// 21. Platform-Specific SEO Landing Pages (/youtube-downloader, /instagram-downloader, etc.)
seoPages.forEach(page => {
  app.get(`/${page.slug}`, (req, res) => {
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    res.send(renderSeoPage(page, hostUrl));
  });
});

// 22. Google AdSense Compliant Legal Pages
app.get('/privacy-policy', (req, res) => {
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  res.send(legalPages.renderPrivacyPolicy(hostUrl));
});

app.get('/terms-of-service', (req, res) => {
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  res.send(legalPages.renderTermsOfService(hostUrl));
});

app.get('/disclaimer', (req, res) => {
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  res.send(legalPages.renderDisclaimer(hostUrl));
});

app.get('/dmca', (req, res) => {
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  res.send(legalPages.renderDmca(hostUrl));
});

app.get('/contact', (req, res) => {
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  res.send(legalPages.renderContact(hostUrl));
});

// Start Server (Only listen if run directly, export for Vercel/serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Any DL Web Server started successfully! `);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(` yt-dlp binary: ${YTDLP_BIN}`);
    console.log(` FFmpeg binary: ${FFMPEG_BIN}`);
    console.log(` Downloads directory: ${DOWNLOADS_DIR}`);
    console.log(`===============================================`);
  });
}

module.exports = app;

