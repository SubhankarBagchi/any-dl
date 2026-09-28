/* ========================================================
   ANY DL — FRONTEND APPLICATION CONTROLLER
   ======================================================== */

// Global State
const state = {
  activeTab: 'home',
  currentMedia: null,
  selectedVideoRes: '1080',
  selectedAudioFormat: 'mp3',
  selectedAudioQuality: '320k',
  selectedVideoContainer: 'mp4',
  selectedStreamId: 'auto',
  tasks: [],
  history: [],
  settings: {},
  nowPlaying: null,
  sseSource: null,
  trackedBrowserTaskId: null
};

// DOM Elements Cache
const elements = {
  // Navigation
  navItems: document.querySelectorAll('.nav-item'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  pageTitle: document.getElementById('page-title'),
  activeBadge: document.getElementById('active-badge'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),

  // Downloader
  urlForm: document.getElementById('url-form'),
  urlInput: document.getElementById('url-input'),
  platformBadge: document.getElementById('platform-badge'),
  pasteBtn: document.getElementById('paste-btn'),
  clearBtn: document.getElementById('clear-btn'),
  fetchBtn: document.getElementById('fetch-btn'),
  inspectorCard: document.getElementById('inspector-card'),
  closeInspectorBtn: document.getElementById('close-inspector-btn'),

  // Inspector Elements
  mediaThumb: document.getElementById('media-thumb'),
  mediaDuration: document.getElementById('media-duration'),
  mediaTitle: document.getElementById('media-title'),
  mediaAuthor: document.getElementById('media-author'),
  viewsText: document.getElementById('views-text'),
  dateText: document.getElementById('date-text'),
  previewPlayBtn: document.getElementById('preview-play-btn'),
  modeBtns: document.querySelectorAll('.mode-btn'),
  configPanels: document.querySelectorAll('.config-panel'),
  videoQualityGrid: document.getElementById('video-quality-grid'),
  audioFormatGrid: document.getElementById('audio-format-grid'),
  videoContainer: document.getElementById('video-container'),
  videoStreamSelect: document.getElementById('video-stream-select'),
  embedSubsToggle: document.getElementById('embed-subs-toggle'),
  embedThumbToggle: document.getElementById('embed-thumb-toggle'),
  addChaptersToggle: document.getElementById('add-chapters-toggle'),
  sponsorblockToggle: document.getElementById('sponsorblock-toggle'),
  audioEmbedThumb: document.getElementById('audio-embed-thumb'),
  audioEmbedTags: document.getElementById('audio-embed-tags'),
  btnDownloadThumb: document.getElementById('btn-download-thumb'),
  btnDownloadSubs: document.getElementById('btn-download-subs'),
  playlistPicker: document.getElementById('playlist-picker'),
  playlistItemsList: document.getElementById('playlist-items-list'),
  plCountText: document.getElementById('pl-count-text'),
  plSelectAll: document.getElementById('pl-select-all'),
  plDeselectAll: document.getElementById('pl-deselect-all'),
  startDownloadNowBtn: document.getElementById('start-download-now-btn'),
  addToQueueBtn: document.getElementById('add-to-queue-btn'),

  // Inline Card Progress & Browser Download
  cardInlineProgress: document.getElementById('card-inline-progress'),
  inlineStatusTitle: document.getElementById('inline-status-title'),
  inlineStatusPct: document.getElementById('inline-status-pct'),
  inlineProgressFill: document.getElementById('inline-progress-fill'),
  inlineSpeedText: document.getElementById('inline-speed-text'),
  inlineEtaText: document.getElementById('inline-eta-text'),
  inlineReadyActions: document.getElementById('inline-ready-actions'),
  inlineDirectDownloadLink: document.getElementById('inline-direct-download-link'),

  // Search Results
  searchResultsSection: document.getElementById('search-results-section'),
  searchResultsGrid: document.getElementById('search-results-grid'),
  searchCountLabel: document.getElementById('search-count-label'),

  // Queue
  queueList: document.getElementById('queue-list'),
  queueEmpty: document.getElementById('queue-empty'),
  clearCompletedBtn: document.getElementById('clear-completed-btn'),

  // Library
  libraryGrid: document.getElementById('library-grid'),
  libraryEmpty: document.getElementById('library-empty'),
  clearHistoryBtn: document.getElementById('clear-history-btn'),
  libChips: document.querySelectorAll('.lib-chip'),

  // Terminal
  terminalForm: document.getElementById('terminal-form'),
  terminalInput: document.getElementById('terminal-input'),
  terminalOutput: document.getElementById('terminal-output'),
  terminalExecStatus: document.getElementById('terminal-exec-status'),
  clearTerminalBtn: document.getElementById('clear-terminal-btn'),
  presetChips: document.querySelectorAll('.preset-chip'),

  // Settings
  settingTheme: document.getElementById('setting-theme'),
  settingDefaultMode: document.getElementById('setting-default-mode'),
  settingDefaultRes: document.getElementById('setting-default-res'),
  settingMaxConcurrent: document.getElementById('setting-max-concurrent'),
  settingRateLimit: document.getElementById('setting-rate-limit'),
  settingProxy: document.getElementById('setting-proxy'),
  settingUseCookies: document.getElementById('setting-use-cookies'),
  settingCookiesText: document.getElementById('setting-cookies-text'),
  diagYtdlpVer: document.getElementById('diag-ytdlp-ver'),
  diagFfmpegPath: document.getElementById('diag-ffmpeg-path'),
  diagStorageDir: document.getElementById('diag-storage-dir'),
  checkUpdateBtn: document.getElementById('check-update-btn'),
  updateStatusMsg: document.getElementById('update-status-msg'),
  saveSettingsBtn: document.getElementById('save-settings-btn'),

  // Floating Player
  mediaPlayerDock: document.getElementById('media-player-dock'),
  globalVideoPlayer: document.getElementById('global-video-player'),
  playerVideoBox: document.getElementById('player-video-box'),
  playerTitle: document.getElementById('player-title'),
  playerSubtitle: document.getElementById('player-subtitle'),
  playerPlayToggle: document.getElementById('player-play-toggle'),
  playIcon: document.querySelector('.play-icon'),
  pauseIcon: document.querySelector('.pause-icon'),
  playerSeekBack: document.getElementById('player-seek-back'),
  playerSeekForward: document.getElementById('player-seek-forward'),
  playerScrubber: document.getElementById('player-scrubber'),
  playerCurrTime: document.getElementById('player-curr-time'),
  playerTotalTime: document.getElementById('player-total-time'),
  playerVolume: document.getElementById('player-volume'),
  playerCloseBtn: document.getElementById('player-close-btn'),
  playerPipBtn: document.getElementById('player-pip-btn'),

  // Toast
  toastContainer: document.getElementById('toast-container')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTheme();
  initDownloader();
  initSSE();
  initLibrary();
  initTerminal();
  initSettings();
  initPlayer();
  fetchStatus();
  fetchHistory();
});

// Toast System
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Navigation System
function initNavigation() {
  const titles = {
    home: 'Media Downloader',
    queue: 'Live Queue & Downloads',
    library: 'Downloaded Library',
    terminal: 'yt-dlp Terminal Console',
    settings: 'Settings & Diagnostic'
  };

  elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.tab;
      elements.navItems.forEach(i => i.classList.remove('active'));
      elements.tabPanels.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const panel = document.getElementById(`tab-${targetTab}`);
      if (panel) panel.classList.add('active');

      state.activeTab = targetTab;
      elements.pageTitle.textContent = titles[targetTab] || 'Media Downloader';

      if (targetTab === 'library') fetchHistory();
      if (targetTab === 'settings') loadSettingsToUI();
    });
  });
}

// Theme System
function initTheme() {
  const savedTheme = localStorage.getItem('anydl-theme') || 'cyber-dark';
  document.body.setAttribute('data-theme', savedTheme);
  if (elements.settingTheme) elements.settingTheme.value = savedTheme;

  elements.themeToggleBtn.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'cyber-dark' ? 'clean-light' : 'cyber-dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('anydl-theme', next);
    if (elements.settingTheme) elements.settingTheme.value = next;
    showToast(`Switched to ${next} theme`, 'info');
  });

  if (elements.settingTheme) {
    elements.settingTheme.addEventListener('change', e => {
      const val = e.target.value;
      document.body.setAttribute('data-theme', val);
      localStorage.setItem('anydl-theme', val);
    });
  }
}

// Server-Sent Events (SSE)
function initSSE() {
  if (state.sseSource) state.sseSource.close();

  state.sseSource = new EventSource('/api/events');

  state.sseSource.addEventListener('queue_updated', e => {
    try {
      const tasks = JSON.parse(e.data);
      state.tasks = tasks;
      renderQueue();
      updateActiveBadge();

      // Update inline progress if this task was triggered for browser download
      if (state.trackedBrowserTaskId) {
        const tracked = tasks.find(t => t.id === state.trackedBrowserTaskId);
        if (tracked && elements.cardInlineProgress) {
          elements.cardInlineProgress.style.display = 'block';
          const pct = Math.round(tracked.progress || 0);
          elements.inlineProgressFill.style.width = `${pct}%`;
          elements.inlineStatusPct.textContent = `${pct}%`;
          elements.inlineSpeedText.textContent = tracked.speed || 'Downloading...';
          elements.inlineEtaText.textContent = tracked.status === 'processing' 
            ? 'Finalizing video & audio...' 
            : (tracked.eta ? `ETA: ${tracked.eta}` : 'Preparing file for browser...');
          elements.inlineStatusTitle.textContent = tracked.status === 'processing'
            ? 'Merging Audio & Video...'
            : (tracked.status === 'downloading' ? 'Downloading Media...' : 'Preparing...');
        }
      }
    } catch (err) {
      console.error('Error parsing SSE queue:', err);
    }
  });

  state.sseSource.addEventListener('task_completed', e => {
    try {
      const data = JSON.parse(e.data);
      showToast(`Finished downloading: ${data.title || data.filename} (${data.fileSize})`, 'success');
      fetchHistory();

      // If this was a tracked browser download, AUTOMATICALLY trigger browser download!
      if (state.trackedBrowserTaskId && data.id === state.trackedBrowserTaskId) {
        if (elements.inlineProgressFill) elements.inlineProgressFill.style.width = '100%';
        if (elements.inlineStatusPct) elements.inlineStatusPct.textContent = '100%';
        if (elements.inlineStatusTitle) elements.inlineStatusTitle.textContent = 'Finished! Saving to your browser downloads...';
        if (elements.inlineSpeedText) elements.inlineSpeedText.textContent = 'Completed';
        if (elements.inlineEtaText) elements.inlineEtaText.textContent = data.fileSize || '';
        if (elements.inlineReadyActions) elements.inlineReadyActions.style.display = 'block';
        if (elements.inlineDirectDownloadLink) {
          elements.inlineDirectDownloadLink.href = data.downloadUrl || `/api/files/${encodeURIComponent(data.filename)}/download`;
          elements.inlineDirectDownloadLink.setAttribute('download', data.filename);
        }

        // TRIGGER NATIVE BROWSER DOWNLOAD PROMPT
        triggerBrowserDownload(data.filename);
      }
    } catch (err) {}
  });

  state.sseSource.onerror = () => {
    console.warn('SSE connection lost. Reconnecting in 3s...');
    setTimeout(initSSE, 3000);
  };
}

function updateActiveBadge() {
  const activeCount = state.tasks.filter(t => t.status === 'downloading' || t.status === 'processing' || t.status === 'queued').length;
  if (activeCount > 0) {
    elements.activeBadge.textContent = activeCount;
    elements.activeBadge.style.display = 'block';
  } else {
    elements.activeBadge.style.display = 'none';
  }
}

// Platform Signatures for Dynamic Detection
const PLATFORM_SIGNATURES = [
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    icon: '⚡',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    test: u => /(?:youtube\.com\/shorts\/|youtu\.be\/.*[?&]short)/i.test(u),
    actionText: '1080p MP4 Ready',
    defaultMode: 'video'
  },
  {
    id: 'youtube',
    name: 'YouTube Video',
    icon: '▶️',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    test: u => /(?:youtube\.com\/(?:watch|embed|v|playlist)|youtu\.be\/)/i.test(u),
    actionText: '4K / 1080p / MP3 Ready',
    defaultMode: 'video'
  },
  {
    id: 'instagram',
    name: 'Instagram Reel / Post',
    icon: '📸',
    color: '#e1306c',
    bg: 'rgba(225, 48, 108, 0.15)',
    test: u => /(?:instagram\.com\/(?:p|reel|tv|stories)\/)/i.test(u),
    actionText: 'High Quality MP4',
    defaultMode: 'video'
  },
  {
    id: 'tiktok',
    name: 'TikTok Video',
    icon: '🎵',
    color: '#00f2fe',
    bg: 'rgba(0, 242, 254, 0.15)',
    test: u => /(?:tiktok\.com\/|vm\.tiktok\.com\/)/i.test(u),
    actionText: 'Watermark-Free Video',
    defaultMode: 'video'
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud Music',
    icon: '☁️',
    color: '#ff5500',
    bg: 'rgba(255, 85, 0, 0.15)',
    test: u => /soundcloud\.com\//i.test(u),
    actionText: '320kbps Audio Ready',
    defaultMode: 'audio'
  },
  {
    id: 'twitter',
    name: 'X / Twitter Video',
    icon: '🐦',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    test: u => /(?:twitter\.com|x\.com)\/.*\/status/i.test(u),
    actionText: 'HD Video Clip',
    defaultMode: 'video'
  },
  {
    id: 'facebook',
    name: 'Facebook Video',
    icon: '📘',
    color: '#1877f2',
    bg: 'rgba(24, 119, 242, 0.15)',
    test: u => /(?:facebook\.com|fb\.watch)\//i.test(u),
    actionText: 'HD Video Stream',
    defaultMode: 'video'
  },
  {
    id: 'reddit',
    name: 'Reddit Media',
    icon: '🤖',
    color: '#ff4500',
    bg: 'rgba(255, 69, 0, 0.15)',
    test: u => /(?:reddit\.com\/r\/|v\.redd\.it\/)/i.test(u),
    actionText: 'Merged Video + Audio',
    defaultMode: 'video'
  },
  {
    id: 'pinterest',
    name: 'Pinterest Media',
    icon: '📌',
    color: '#e60023',
    bg: 'rgba(230, 0, 35, 0.15)',
    test: u => /(?:pinterest\.com\/pin\/|pin\.it\/)/i.test(u),
    actionText: 'HD Video / Image',
    defaultMode: 'video'
  },
  {
    id: 'twitch',
    name: 'Twitch Clip',
    icon: '👾',
    color: '#9146ff',
    bg: 'rgba(145, 70, 255, 0.15)',
    test: u => /(?:twitch\.tv\/|clips\.twitch\.tv\/)/i.test(u),
    actionText: '1080p60 Stream Clip',
    defaultMode: 'video'
  },
  {
    id: 'vimeo',
    name: 'Vimeo Video',
    icon: '🎬',
    color: '#1ab7ea',
    bg: 'rgba(26, 183, 234, 0.15)',
    test: u => /vimeo\.com\//i.test(u),
    actionText: 'Original 4K / HD Video',
    defaultMode: 'video'
  },
  {
    id: 'bandcamp',
    name: 'Bandcamp Track',
    icon: '🎧',
    color: '#629aa9',
    bg: 'rgba(98, 154, 169, 0.15)',
    test: u => /bandcamp\.com\//i.test(u),
    actionText: '320k Lossless Audio',
    defaultMode: 'audio'
  }
];

function checkPlatform(val) {
  if (!elements.platformBadge) return null;
  const trimmed = val ? val.trim() : '';
  if (!trimmed || !isUrl(trimmed)) {
    elements.platformBadge.style.display = 'none';
    elements.platformBadge.innerHTML = '';
    return null;
  }

  const detected = PLATFORM_SIGNATURES.find(p => p.test(trimmed));
  if (detected) {
    elements.platformBadge.style.display = 'inline-flex';
    elements.platformBadge.style.background = detected.bg;
    elements.platformBadge.style.borderColor = detected.color;
    elements.platformBadge.style.color = detected.color;
    elements.platformBadge.innerHTML = `
      <span class="badge-icon">${detected.icon}</span>
      <span class="badge-name">${detected.name}</span>
      <span class="badge-action">• ${detected.actionText}</span>
    `;

    // Smart auto-mode switch to Audio for music platforms
    if (detected.defaultMode === 'audio') {
      const audioModeBtn = document.querySelector('.mode-btn[data-mode="audio"]');
      if (audioModeBtn && !audioModeBtn.classList.contains('active')) {
        audioModeBtn.click();
      }
    }
    return detected;
  } else {
    elements.platformBadge.style.display = 'inline-flex';
    elements.platformBadge.style.background = 'rgba(0, 229, 255, 0.12)';
    elements.platformBadge.style.borderColor = 'var(--accent-cyan)';
    elements.platformBadge.style.color = 'var(--accent-cyan)';
    elements.platformBadge.innerHTML = `
      <span class="badge-icon">🌐</span>
      <span class="badge-name">Universal URL Detected</span>
      <span class="badge-action">• Multi-Format Ready</span>
    `;
    return null;
  }
}

// Downloader Section
function initDownloader() {
  // Input live detection & Clear button visibility
  elements.urlInput.addEventListener('input', () => {
    const val = elements.urlInput.value;
    elements.clearBtn.style.display = val ? 'flex' : 'none';
    checkPlatform(val);
  });

  elements.clearBtn.addEventListener('click', () => {
    elements.urlInput.value = '';
    elements.clearBtn.style.display = 'none';
    checkPlatform('');
    elements.urlInput.focus();
  });

  // Paste from clipboard
  elements.pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        elements.urlInput.value = text.trim();
        elements.clearBtn.style.display = 'flex';
        checkPlatform(text.trim());
        analyzeOrSearch(text.trim());
      }
    } catch (err) {
      showToast('Clipboard access was denied. Please paste manually.', 'error');
    }
  });

  // Drag & Drop onto form
  const dropZone = elements.urlForm;
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(evt => {
      dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
      });
    });
    dropZone.addEventListener('drop', e => {
      const text = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
      if (text) {
        elements.urlInput.value = text.trim();
        elements.clearBtn.style.display = 'flex';
        checkPlatform(text.trim());
        analyzeOrSearch(text.trim());
      }
    });
  }

  // Dynamic Rotating Placeholder
  const placeholders = [
    'Paste video/audio/playlist link or type keywords to search...',
    'Download in 4K UHD, 1080p 60fps, or 320kbps MP3...',
    'Paste links from YouTube, TikTok, Instagram, Twitter/X, SoundCloud...'
  ];
  let placeholderIdx = 0;
  setInterval(() => {
    if (document.activeElement !== elements.urlInput && !elements.urlInput.value) {
      placeholderIdx = (placeholderIdx + 1) % placeholders.length;
      elements.urlInput.setAttribute('placeholder', placeholders[placeholderIdx]);
    }
  }, 4500);

  // Global Keyboard Shortcuts (Escape to close inspector)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && elements.inspectorCard && elements.inspectorCard.style.display !== 'none') {
      elements.inspectorCard.style.display = 'none';
    }
  });

  // Form Submit
  elements.urlForm.addEventListener('submit', e => {
    e.preventDefault();
    const query = elements.urlInput.value.trim();
    if (query) analyzeOrSearch(query);
  });

  // Close inspector
  elements.closeInspectorBtn.addEventListener('click', () => {
    elements.inspectorCard.style.display = 'none';
  });

  // Mode buttons (Video / Audio / Extras)
  elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.modeBtns.forEach(b => b.classList.remove('active'));
      elements.configPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const mode = btn.dataset.mode;
      const targetPanel = document.getElementById(`panel-${mode}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Video quality pills
  elements.videoQualityGrid.addEventListener('click', e => {
    const pill = e.target.closest('.quality-pill');
    if (!pill) return;
    elements.videoQualityGrid.querySelectorAll('.quality-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.selectedVideoRes = pill.dataset.res;
  });

  // Audio format pills
  elements.audioFormatGrid.addEventListener('click', e => {
    const pill = e.target.closest('.quality-pill');
    if (!pill) return;
    elements.audioFormatGrid.querySelectorAll('.quality-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.selectedAudioFormat = pill.dataset.aformat;
  });

  // Audio quality radio
  document.querySelectorAll('input[name="audio-quality"]').forEach(r => {
    r.addEventListener('change', e => {
      state.selectedAudioQuality = e.target.value;
    });
  });

  // Container select
  elements.videoContainer.addEventListener('change', e => {
    state.selectedVideoContainer = e.target.value;
  });

  // Specific stream select
  elements.videoStreamSelect.addEventListener('change', e => {
    state.selectedStreamId = e.target.value;
  });

  // Download Thumb / Subs Only
  elements.btnDownloadThumb.addEventListener('click', () => {
    if (!state.currentMedia) return;
    if (state.currentMedia.thumbnail) {
      const a = document.createElement('a');
      a.href = state.currentMedia.thumbnail;
      a.setAttribute('download', `${(state.currentMedia.title || 'thumbnail').substring(0, 50)}.jpg`);
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 1000);
      showToast('Downloading thumbnail directly...', 'success');
    } else {
      downloadDirectToBrowser({ type: 'thumbnail' });
    }
  });

  elements.btnDownloadSubs.addEventListener('click', () => {
    if (!state.currentMedia) return;
    downloadDirectToBrowser({ type: 'subtitle' });
  });

  // Start Download Now Button (Direct to Browser)
  elements.startDownloadNowBtn.addEventListener('click', () => {
    handleStartDownload(false);
  });

  // Add to Queue Button (Background Queue)
  elements.addToQueueBtn.addEventListener('click', () => {
    handleStartDownload(true);
  });

  // Playlist Select All / Deselect All
  elements.plSelectAll.addEventListener('click', () => {
    elements.playlistItemsList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
  });
  elements.plDeselectAll.addEventListener('click', () => {
    elements.playlistItemsList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  });
}

// Check if string is URL
function isUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Analyze URL or Perform Search
async function analyzeOrSearch(query) {
  if (isUrl(query)) {
    await fetchMediaInfo(query);
  } else {
    await performSearch(query);
  }
}

// Fetch Media Metadata from URL
async function fetchMediaInfo(url) {
  setLoading(true);
  elements.searchResultsSection.style.display = 'none';

  try {
    const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
    const contentType = res.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Server returned error (${res.status}). Serverless function may be starting or timed out. Please retry.`);
    }

    if (!res.ok || data.error) {
      throw new Error(data.error || 'Failed to extract media information');
    }

    state.currentMedia = data;
    renderMediaInspector(data);
    showToast(`Media loaded: ${data.title}`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

// Perform Search
async function performSearch(query) {
  setLoading(true);
  elements.inspectorCard.style.display = 'none';

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const contentType = res.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      throw new Error(`Search unavailable (${res.status}). Please paste a direct video/music URL.`);
    }

    if (!res.ok || !data.results) {
      throw new Error('Search failed. Try with a direct URL.');
    }

    renderSearchResults(data.results);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  const btn = elements.fetchBtn;
  const btnText = btn.querySelector('.btn-text');
  const btnIcon = btn.querySelector('.btn-icon');
  const btnSpinner = btn.querySelector('.btn-spinner');

  if (isLoading) {
    btnText.textContent = 'Analyzing...';
    btnIcon.style.display = 'none';
    btnSpinner.style.display = 'block';
    btn.disabled = true;
  } else {
    btnText.textContent = 'Analyze & Download';
    btnIcon.style.display = 'block';
    btnSpinner.style.display = 'none';
    btn.disabled = false;
  }
}

// Render Media Inspector
function renderMediaInspector(data) {
  elements.mediaThumb.src = data.thumbnail || '/assets/logo.png';
  elements.mediaDuration.textContent = data.duration_string || '--:--';
  elements.mediaTitle.textContent = data.title;
  elements.mediaAuthor.textContent = data.uploader;
  elements.viewsText.textContent = data.view_count ? `${data.view_count} views` : 'N/A';
  elements.dateText.textContent = data.upload_date ? formatDate(data.upload_date) : 'Uploaded recently';

  // Preview Play button with sound
  elements.previewPlayBtn.onclick = () => {
    playInDock({
      title: data.title,
      uploader: data.uploader,
      streamUrl: data.webpage_url,
      youtubeId: data.id
    });
  };

  // Populate Specific Stream dropdown
  elements.videoStreamSelect.innerHTML = '<option value="auto">Auto Best Stream (Recommended • Full Sound)</option>';
  (data.videoFormats || []).forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.format_id;
    opt.textContent = `${f.label} (${f.ext.toUpperCase()}) ${f.size ? '• ' + f.size : ''} 🔊 (Audio Merged)`;
    elements.videoStreamSelect.appendChild(opt);
  });

  // Populate Subtitle tags
  const subWrap = document.getElementById('subs-badge-wrap');
  subWrap.innerHTML = '';
  if (data.subtitles && data.subtitles.length > 0) {
    data.subtitles.slice(0, 5).forEach(s => {
      const span = document.createElement('span');
      span.className = 'sub-badge';
      span.textContent = s.name || s.code;
      subWrap.appendChild(span);
    });
  } else {
    subWrap.innerHTML = '<span class="sub-badge">Auto Generated Subs</span>';
  }

  // Handle Playlists
  if (data.isPlaylist && data.playlistEntries && data.playlistEntries.length > 0) {
    elements.playlistPicker.style.display = 'block';
    elements.plCountText.textContent = `${data.playlistCount} items in playlist`;
    elements.playlistItemsList.innerHTML = '';

    data.playlistEntries.forEach(item => {
      const row = document.createElement('div');
      row.className = 'pl-item-row';
      row.innerHTML = `
        <input type="checkbox" checked data-index="${item.index}" data-url="${item.url}" data-title="${escapeHtml(item.title)}">
        <img src="${item.thumbnail || '/assets/logo.png'}" class="pl-thumb-mini" alt="thumb">
        <span class="pl-item-title">${escapeHtml(item.title)}</span>
        <span class="pl-item-dur">${item.duration_string || ''}</span>
      `;
      elements.playlistItemsList.appendChild(row);
    });
  } else {
    elements.playlistPicker.style.display = 'none';
  }

  elements.inspectorCard.style.display = 'block';
  elements.inspectorCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Render Search Results
function renderSearchResults(results) {
  elements.searchResultsGrid.innerHTML = '';
  elements.searchCountLabel.textContent = `${results.length} found`;

  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'search-card';
    card.innerHTML = `
      <div class="search-card-thumb-wrap">
        <img src="${item.thumbnail}" class="search-card-thumb" alt="Thumbnail" loading="lazy">
        <span class="preview-duration-badge">${item.duration_string || ''}</span>
      </div>
      <div class="search-card-body">
        <h4 class="search-card-title">${escapeHtml(item.title)}</h4>
        <div class="search-card-meta">
          <span>${escapeHtml(item.uploader)}</span>
          <span>${item.view_count ? item.view_count + ' views' : ''}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      elements.urlInput.value = item.url;
      elements.clearBtn.style.display = 'flex';
      fetchMediaInfo(item.url);
    });

    elements.searchResultsGrid.appendChild(card);
  });

  elements.searchResultsSection.style.display = 'block';
  elements.searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Start Download Trigger
function handleStartDownload(isBackgroundQueue = false) {
  if (!state.currentMedia) return;

  const activeModeBtn = document.querySelector('.mode-btn.active');
  const mode = activeModeBtn ? activeModeBtn.dataset.mode : 'video';

  // Check if playlist
  if (state.currentMedia.isPlaylist) {
    const checkedItems = Array.from(elements.playlistItemsList.querySelectorAll('input[type="checkbox"]:checked')).map(cb => ({
      playlistItem: cb.dataset.index,
      url: cb.dataset.url,
      title: cb.dataset.title
    }));

    if (checkedItems.length === 0) {
      showToast('Please select at least one item from the playlist.', 'error');
      return;
    }

    if (isBackgroundQueue) {
      batchQueueDownload(checkedItems, mode);
    } else {
      // Direct browser download for the first checked item, queue the rest
      showToast(`Starting browser download for: ${checkedItems[0].title}`, 'success');
      downloadDirectToBrowser({
        url: checkedItems[0].url,
        title: checkedItems[0].title,
        type: mode
      });
      if (checkedItems.length > 1) {
        batchQueueDownload(checkedItems.slice(1), mode);
      }
    }
  } else {
    if (!isBackgroundQueue) {
      // 100% DIRECT BROWSER DOWNLOAD: Instant & Serverless / Vercel compatible
      downloadDirectToBrowser({ type: mode });
    } else {
      queueDownload({ type: mode, isBackgroundQueue: true });
    }
  }
}

// High-Speed Direct Browser Native Download
function downloadDirectToBrowser(customOptions = {}) {
  const media = state.currentMedia;
  if (!media) return;

  const activeModeBtn = document.querySelector('.mode-btn.active');
  const mode = customOptions.type || (activeModeBtn ? activeModeBtn.dataset.mode : 'video');
  const res = customOptions.resolution || state.selectedVideoRes || '1080';
  const container = customOptions.container || state.selectedVideoContainer || 'mp4';
  const audioFormat = customOptions.audioFormat || state.selectedAudioFormat || 'mp3';
  const audioQuality = customOptions.audioQuality || state.selectedAudioQuality || '320k';
  const formatId = customOptions.formatId || (state.selectedStreamId !== 'auto' ? state.selectedStreamId : '');

  // Look for direct stream URL if available
  let directUrl = customOptions.directUrl || '';
  if (!directUrl && mode === 'video' && media.videoFormats) {
    const matched = media.videoFormats.find(f => (f.height == res || f.format_id == formatId) && f.direct_url);
    if (matched) directUrl = matched.direct_url;
  }
  if (!directUrl && mode === 'audio' && media.audioFormats) {
    const matched = media.audioFormats.find(f => f.direct_url);
    if (matched) directUrl = matched.direct_url;
  }

  const queryParams = new URLSearchParams({
    url: customOptions.url || media.webpage_url,
    title: customOptions.title || media.title || 'media',
    type: mode,
    resolution: res,
    container: container,
    audioFormat: audioFormat,
    audioQuality: audioQuality,
    formatId: formatId,
    directUrl: directUrl
  });

  const downloadUrl = `/api/browser-download?${queryParams.toString()}`;

  showToast(`🚀 Starting browser download: ${customOptions.title || media.title}`, 'success');

  // Inline progress feedback
  if (elements.cardInlineProgress) {
    elements.cardInlineProgress.style.display = 'block';
    elements.inlineProgressFill.style.width = '100%';
    elements.inlineStatusPct.textContent = 'Active';
    elements.inlineStatusTitle.textContent = 'Browser Download Initiated!';
    elements.inlineSpeedText.textContent = 'Check your browser downloads (Ctrl + J)';
    elements.inlineEtaText.textContent = `${mode.toUpperCase()} • ${mode === 'audio' ? audioFormat.toUpperCase() : res + 'p ' + container.toUpperCase()}`;
    if (elements.inlineReadyActions) {
      elements.inlineReadyActions.style.display = 'block';
      if (elements.inlineDirectDownloadLink) {
        elements.inlineDirectDownloadLink.href = downloadUrl;
        elements.inlineDirectDownloadLink.innerHTML = '<span>⬇ Click here if browser download did not start automatically</span>';
      }
    }
    elements.cardInlineProgress.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Record in History/Library
  const historyItem = {
    id: 'dl_' + Date.now(),
    title: customOptions.title || media.title || 'Downloaded Media',
    url: customOptions.url || media.webpage_url,
    type: mode,
    formatSummary: mode === 'audio' ? `Audio • ${audioFormat.toUpperCase()} (${audioQuality})` : `Video • ${res}p (${container.toUpperCase()})`,
    thumbnail: media.thumbnail || '',
    fileSize: 'Browser Download',
    completedAt: new Date().toISOString()
  };
  addLocalHistoryItem(historyItem);

  // Trigger Native Browser Download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${customOptions.title || media.title || 'media'}.${mode === 'audio' ? audioFormat : container}`);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 1000);
}

// Local history helpers for persistent library on Vercel
function getLocalHistory() {
  try {
    const raw = localStorage.getItem('anydl_local_history');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function addLocalHistoryItem(item) {
  try {
    const current = getLocalHistory();
    current.unshift(item);
    if (current.length > 50) current.pop();
    localStorage.setItem('anydl_local_history', JSON.stringify(current));
    state.history = current;
    renderLibrary();
  } catch (e) {}
}

// Trigger Browser Native Download Prompt
function triggerBrowserDownload(filename) {
  if (!filename) return;
  const downloadUrl = `/api/files/${encodeURIComponent(filename)}/download`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 1000);
  showToast(`Browser downloading: ${filename}`, 'success');
}

// Create Download Task
async function queueDownload(options = {}) {
  const media = state.currentMedia;
  if (!media) return;

  const type = options.type || 'video';
  const isBackgroundQueue = options.isBackgroundQueue || false;

  const payload = {
    url: media.webpage_url,
    title: media.title,
    thumbnail: media.thumbnail,
    type: type,
    resolution: state.selectedVideoRes,
    container: state.selectedVideoContainer,
    formatId: state.selectedStreamId !== 'auto' ? state.selectedStreamId : null,
    audioFormat: state.selectedAudioFormat,
    audioQuality: state.selectedAudioQuality,
    embedThumbnail: type === 'audio' ? elements.audioEmbedThumb.checked : elements.embedThumbToggle.checked,
    embedSubtitles: elements.embedSubsToggle.checked,
    addChapters: elements.addChaptersToggle.checked,
    sponsorblock: elements.sponsorblockToggle.checked
  };

  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const contentType = res.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      throw new Error(`Download service returned ${res.status}. Note: Vercel serverless has a 60s limit. For large 1080p/4K downloads, deploy via Docker on Render.`);
    }

    if (!res.ok) throw new Error(data.error || 'Failed to start download');

    if (!isBackgroundQueue) {
      // DIRECT BROWSER DOWNLOAD MODE:
      // Track this task ID, display the inline progress bar, and trigger the browser download when finished
      state.trackedBrowserTaskId = data.taskId;
      if (elements.cardInlineProgress) {
        elements.cardInlineProgress.style.display = 'block';
        elements.inlineProgressFill.style.width = '5%';
        elements.inlineStatusPct.textContent = '0%';
        elements.inlineStatusTitle.textContent = 'Downloading media for browser...';
        elements.inlineSpeedText.textContent = 'Connecting to source...';
        elements.inlineEtaText.textContent = 'Browser will download file once ready';
        if (elements.inlineReadyActions) elements.inlineReadyActions.style.display = 'none';
        elements.cardInlineProgress.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      showToast(`Preparing download for your browser: ${media.title}`, 'info');
    } else {
      // BACKGROUND QUEUE MODE:
      showToast(`Added to download queue: ${media.title}`, 'success');
      const queueNav = document.getElementById('nav-queue');
      if (queueNav) queueNav.click();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Batch Queue Download for Playlists
async function batchQueueDownload(items, mode) {
  try {
    const res = await fetch('/api/download-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        type: mode,
        resolution: state.selectedVideoRes,
        container: state.selectedVideoContainer,
        audioFormat: state.selectedAudioFormat,
        audioQuality: state.selectedAudioQuality
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Batch download failed');

    showToast(`Queued ${data.count} items from playlist!`, 'success');
    const queueNav = document.getElementById('nav-queue');
    if (queueNav) queueNav.click();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// TAB 2: LIVE QUEUE RENDERER
function renderQueue() {
  const container = elements.queueList;
  const tasks = state.tasks;

  if (!tasks || tasks.length === 0) {
    container.innerHTML = '';
    container.appendChild(elements.queueEmpty);
    return;
  }

  // Remove empty placeholder
  if (elements.queueEmpty.parentNode === container) {
    container.removeChild(elements.queueEmpty);
  }

  // Build task cards
  container.innerHTML = '';
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.status}`;
    card.id = `card-${task.id}`;

    const isRunning = task.status === 'downloading' || task.status === 'processing';
    const isCompleted = task.status === 'completed';

    card.innerHTML = `
      <div class="task-card-top">
        <img src="${task.thumbnail || '/assets/logo.png'}" class="task-thumb" alt="Thumb">
        <div class="task-meta">
          <div class="task-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</div>
          <div class="task-sub-row">
            <span class="task-badge ${task.status}">${task.status}</span>
            <span>${task.format || ''}</span>
          </div>
        </div>
        <div class="task-actions">
          ${isRunning ? `
            <button class="task-ctrl-btn" onclick="cancelTask('${task.id}')" title="Cancel Download">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          ` : ''}
          ${isCompleted && task.filename ? `
            <a href="/api/files/${encodeURIComponent(task.filename)}/download" class="task-ctrl-btn" title="Save to Device" download>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </a>
          ` : ''}
        </div>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width: ${task.progress || 0}%"></div>
      </div>

      <div class="task-stats-bar">
        <span>${task.status === 'processing' ? 'Finalizing audio & video...' : `${task.progress || 0}%`}</span>
        <span class="speed-metric">${task.speed || ''}</span>
        <span>${task.totalSize ? `${task.totalSize}` : ''} • ETA: ${task.eta || '--:--'}</span>
      </div>
      ${task.error ? `<div style="font-size:0.75rem; color:#ef4444; margin-top:4px;">Error: ${escapeHtml(task.error)}</div>` : ''}
    `;

    container.appendChild(card);
  });
}

// Cancel Task
window.cancelTask = async function(id) {
  try {
    await fetch(`/api/tasks/${id}/cancel`, { method: 'POST' });
    showToast('Download cancelled', 'info');
  } catch (err) {
    showToast('Failed to cancel task', 'error');
  }
};

// Clear Finished Tasks
elements.clearCompletedBtn.addEventListener('click', async () => {
  try {
    await fetch('/api/tasks/clear', { method: 'POST' });
    showToast('Cleared completed tasks from queue', 'info');
  } catch (err) {}
});

// TAB 3: MEDIA LIBRARY
async function fetchHistory() {
  const localItems = getLocalHistory();
  try {
    const res = await fetch('/api/history');
    const data = await res.json();
    if (data.success && Array.isArray(data.history)) {
      const merged = [...localItems];
      data.history.forEach(srvItem => {
        if (!merged.some(m => m.url === srvItem.url || m.title === srvItem.title)) {
          merged.push(srvItem);
        }
      });
      state.history = merged;
      renderLibrary();
      return;
    }
  } catch (err) {
    console.warn('Using local history fallback:', err.message);
  }
  state.history = localItems;
  renderLibrary();
}

function renderLibrary(filter = 'all') {
  const container = elements.libraryGrid;
  let items = state.history || [];

  if (filter === 'video') items = items.filter(i => i.type === 'video');
  if (filter === 'audio') items = items.filter(i => i.type === 'audio');

  if (items.length === 0) {
    container.innerHTML = '';
    container.appendChild(elements.libraryEmpty);
    return;
  }

  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'library-card';
    card.innerHTML = `
      <div class="library-thumb-wrap">
        <img src="${item.thumbnail || '/assets/logo.png'}" class="library-thumb" alt="Thumbnail">
        ${item.filename ? `
          <button class="library-play-btn" onclick="playLibraryFile('${escapeHtml(item.filename)}', '${escapeHtml(item.title)}')">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        ` : ''}
      </div>
      <div class="library-card-body">
        <h4 class="library-card-title">${escapeHtml(item.title)}</h4>
        <div class="library-meta-tags">
          <span>${item.formatSummary || (item.type === 'audio' ? 'Audio' : 'Video')}</span>
          <span>${item.fileSize || ''}</span>
        </div>
        <div class="library-actions-row">
          ${item.filename ? `
            <a href="/api/files/${encodeURIComponent(item.filename)}/download" class="btn-lib-action" download title="Save to Device">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Save to Device</span>
            </a>
          ` : ''}
          <button class="btn-lib-delete" onclick="deleteHistoryItem('${item.id}', true)" title="Delete File">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function initLibrary() {
  elements.libChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.libChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderLibrary(chip.dataset.filter);
    });
  });

  elements.clearHistoryBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear your download history?')) {
      try {
        await fetch('/api/history/clear', { method: 'POST' });
        state.history = [];
        renderLibrary();
        showToast('Download history cleared', 'info');
      } catch (err) {}
    }
  });
}

window.deleteHistoryItem = async function(id, deleteFile = false) {
  try {
    await fetch(`/api/history/${id}?deleteFile=${deleteFile}`, { method: 'DELETE' });
    state.history = state.history.filter(h => h.id !== id);
    renderLibrary();
    showToast('Item deleted', 'info');
  } catch (err) {
    showToast('Failed to delete item', 'error');
  }
};

window.playLibraryFile = function(filename, title) {
  playInDock({
    title: title || filename,
    uploader: 'Local Library File',
    streamUrl: `/api/files/${encodeURIComponent(filename)}`,
    isLiveUrl: false
  });
};

// TAB 4: TERMINAL (CLI Runner)
function initTerminal() {
  // Preset chips
  elements.presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.terminalInput.value = chip.dataset.cmd;
      elements.terminalInput.focus();
    });
  });

  elements.clearTerminalBtn.addEventListener('click', () => {
    elements.terminalOutput.innerHTML = '<div class="term-line info">Terminal cleared.</div>';
  });

  elements.terminalForm.addEventListener('submit', async e => {
    e.preventDefault();
    const cmd = elements.terminalInput.value.trim();
    if (!cmd) return;

    elements.terminalExecStatus.textContent = 'Running...';
    elements.terminalExecStatus.style.color = 'var(--accent-cyan)';

    const outputEl = elements.terminalOutput;
    outputEl.innerHTML += `\n<div class="term-line welcome">$ yt-dlp ${escapeHtml(cmd)}</div>`;
    outputEl.scrollTop = outputEl.scrollHeight;

    try {
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        outputEl.innerHTML += escapeHtml(text);
        outputEl.scrollTop = outputEl.scrollHeight;
      }
    } catch (err) {
      outputEl.innerHTML += `\n<div class="term-line error">Execution error: ${escapeHtml(err.message)}</div>`;
    } finally {
      elements.terminalExecStatus.textContent = 'Idle';
      elements.terminalExecStatus.style.color = 'var(--accent-green)';
    }
  });
}

// TAB 5: SETTINGS
async function initSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success) {
      state.settings = data.settings;
      if (data.downloadsPath) elements.diagStorageDir.textContent = data.downloadsPath;
      loadSettingsToUI();
    }
  } catch (err) {}

  elements.saveSettingsBtn.addEventListener('click', async () => {
    const newSettings = {
      theme: elements.settingTheme.value,
      defaultType: elements.settingDefaultMode.value,
      defaultResolution: elements.settingDefaultRes.value,
      maxConcurrent: parseInt(elements.settingMaxConcurrent.value, 10),
      rateLimit: elements.settingRateLimit.value.trim(),
      proxy: elements.settingProxy.value.trim(),
      useCustomCookies: elements.settingUseCookies.checked,
      cookies: elements.settingCookiesText.value
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        state.settings = data.settings;
        showToast('Settings saved successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  });

  // Check update yt-dlp
  elements.checkUpdateBtn.addEventListener('click', async () => {
    elements.updateStatusMsg.textContent = 'Checking and updating yt-dlp...';
    try {
      const res = await fetch('/api/update-ytdlp', { method: 'POST' });
      const data = await res.json();
      elements.updateStatusMsg.textContent = data.output || 'Finished check';
      fetchStatus();
    } catch (err) {
      elements.updateStatusMsg.textContent = 'Update check failed';
    }
  });
}

function loadSettingsToUI() {
  const s = state.settings || {};
  if (elements.settingTheme && s.theme) elements.settingTheme.value = s.theme;
  if (elements.settingDefaultMode && s.defaultType) elements.settingDefaultMode.value = s.defaultType;
  if (elements.settingDefaultRes && s.defaultResolution) elements.settingDefaultRes.value = s.defaultResolution;
  if (elements.settingMaxConcurrent && s.maxConcurrent) elements.settingMaxConcurrent.value = String(s.maxConcurrent);
  if (elements.settingRateLimit && s.rateLimit) elements.settingRateLimit.value = s.rateLimit;
  if (elements.settingProxy && s.proxy) elements.settingProxy.value = s.proxy;
  if (elements.settingUseCookies) elements.settingUseCookies.checked = !!s.useCustomCookies;
  if (elements.settingCookiesText && s.cookies) elements.settingCookiesText.value = s.cookies;
}

// Status & Diagnostics
async function fetchStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    if (data.success) {
      if (elements.diagYtdlpVer) elements.diagYtdlpVer.textContent = data.ytdlpVersion;
      if (elements.diagFfmpegPath) elements.diagFfmpegPath.textContent = data.ffmpegPath ? 'Installed (GPL Native)' : 'Not detected';
      const chip = document.getElementById('quick-engine-chip');
      if (chip) chip.innerHTML = `<svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Ultra-Fast Core</span>`;
      const engineDetails = document.getElementById('engine-details');
      if (engineDetails) engineDetails.textContent = 'Universal Core';
    }
  } catch (err) {}
}

// FLOATING IN-APP MEDIA PLAYER CONTROLLER
function initPlayer() {
  const video = elements.globalVideoPlayer;

  elements.playerPlayToggle.addEventListener('click', () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', () => {
    elements.playIcon.style.display = 'none';
    elements.pauseIcon.style.display = 'block';
  });

  video.addEventListener('pause', () => {
    elements.playIcon.style.display = 'block';
    elements.pauseIcon.style.display = 'none';
  });

  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const progress = (video.currentTime / video.duration) * 100;
    elements.playerScrubber.value = progress;
    elements.playerCurrTime.textContent = formatDuration(video.currentTime);
    elements.playerTotalTime.textContent = formatDuration(video.duration);
  });

  elements.playerScrubber.addEventListener('input', () => {
    if (!video.duration) return;
    const seekTime = (elements.playerScrubber.value / 100) * video.duration;
    video.currentTime = seekTime;
  });

  elements.playerSeekBack.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
  });

  elements.playerSeekForward.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  });

  elements.playerVolume.addEventListener('input', e => {
    video.volume = parseFloat(e.target.value);
  });

  elements.playerCloseBtn.addEventListener('click', () => {
    video.pause();
    video.src = '';
    const iframe = document.getElementById('global-iframe-player');
    if (iframe) {
      iframe.src = '';
      iframe.style.display = 'none';
    }
    elements.mediaPlayerDock.style.display = 'none';
  });

  elements.playerPipBtn.addEventListener('click', () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      video.requestPictureInPicture();
    }
  });
}

function playInDock({ title, uploader, streamUrl, youtubeId }) {
  const dock = elements.mediaPlayerDock;
  const video = elements.globalVideoPlayer;
  const iframe = document.getElementById('global-iframe-player');

  elements.playerTitle.textContent = title || 'Playing Media';
  elements.playerSubtitle.textContent = uploader || '';
  elements.playerVideoBox.classList.add('active');

  if (youtubeId) {
    video.style.display = 'none';
    video.pause();
    video.src = '';
    if (iframe) {
      iframe.style.display = 'block';
      iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1`;
    }
  } else {
    if (iframe) {
      iframe.style.display = 'none';
      iframe.src = '';
    }
    video.style.display = 'block';
    video.src = streamUrl;
    video.muted = false;
    video.volume = elements.playerVolume ? parseFloat(elements.playerVolume.value) : 1;
    video.play().catch(e => console.log('Autoplay prevented:', e));
  }

  dock.style.display = 'block';
}

// Utility Functions
function formatDuration(sec) {
  if (isNaN(sec)) return '0:00';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return dateStr || '';
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
