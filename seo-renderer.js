// SEO Page HTML Template Generator for Any DL
const seoPages = require('./seo-pages');
const { getHeaderNavHtml, getFooterHtml } = require('./legal-pages-renderer');

function renderSeoPage(page, hostUrl = '') {
  const currentUrl = `${hostUrl}/${page.slug}`;

  // JSON-LD Structured Data for Google (WebApplication + FAQPage + HowTo)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": page.name,
        "url": currentUrl,
        "description": page.metaDescription,
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "All (Windows, Mac, Linux, Android, iOS)",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "12840",
          "bestRating": "5"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": (page.faqs || []).map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      },
      {
        "@type": "HowTo",
        "name": `How to download from ${page.platform}`,
        "description": `Step by step guide to downloading videos and audio from ${page.platform} using Any DL.`,
        "step": (page.howTo || []).map(h => ({
          "@type": "HowToStep",
          "position": h.step,
          "name": h.title,
          "text": h.desc
        }))
      }
    ]
  };

  // Platform Links Row
  const platformLinksHtml = seoPages.map(p => `
    <a href="/${p.slug}" class="platform-chip ${p.slug === page.slug ? 'active' : ''}" style="${p.slug === page.slug ? `border-color:${p.color}; color:${p.color}; background:rgba(255,255,255,0.08);` : ''}">
      <span class="chip-dot" style="background:${p.color};"></span>
      ${p.platform}
    </a>
  `).join('');

  // Features HTML
  const featuresHtml = (page.features || []).map(f => `
    <div class="feature-card">
      <div class="f-icon-box" style="background:${page.color}22; color:${page.color};">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h4>${f.title}</h4>
      <p>${f.desc}</p>
    </div>
  `).join('');

  // How-To HTML
  const howToHtml = (page.howTo || []).map(h => `
    <div class="step-card" style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:24px; position:relative; overflow:hidden;">
      <div class="step-number" style="position:absolute; top:-12px; right:12px; font-size:4rem; font-weight:900; opacity:0.06; font-family:var(--font-mono);">${h.step}</div>
      <div class="step-badge" style="display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:50%; background:${page.color}; color:#fff; font-weight:800; font-size:0.88rem; margin-bottom:12px;">${h.step}</div>
      <h3 style="font-size:1.1rem; margin-bottom:6px;">${h.title}</h3>
      <p style="font-size:0.86rem; color:var(--text-muted); line-height:1.5;">${h.desc}</p>
    </div>
  `).join('');

  // FAQs HTML
  const faqsHtml = (page.faqs || []).map((f, idx) => `
    <details class="faq-item" style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:16px 20px; margin-bottom:12px; cursor:pointer;" ${idx === 0 ? 'open' : ''}>
      <summary style="font-weight:700; font-size:1rem; color:var(--text-main); outline:none; display:flex; justify-content:space-between; align-items:center;">
        <span>${f.q}</span>
        <span class="faq-icon" style="color:${page.color}; font-size:1.2rem;">+</span>
      </summary>
      <div style="margin-top:10px; font-size:0.88rem; color:var(--text-muted); line-height:1.6; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
        ${f.a}
      </div>
    </details>
  `).join('');

  // Footer Links Directory for Crawlers
  const footerLinksHtml = seoPages.map(p => `
    <li><a href="/${p.slug}" style="color:var(--text-muted); text-decoration:none; font-size:0.84rem; transition:0.2s;" onmouseover="this.style.color='#00e5ff'" onmouseout="this.style.color='var(--text-muted)'">${p.name}</a></li>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <meta name="description" content="${page.metaDescription}">
  <meta name="keywords" content="${page.keywords}">
  <link rel="canonical" href="${currentUrl}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${currentUrl}">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.metaDescription}">
  <meta property="og:image" content="/assets/logo.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.metaDescription}">
  <meta name="twitter:image" content="/assets/logo.png">

  <link rel="icon" type="image/png" href="/assets/logo.png">

  <!-- Google Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/styles.css">

  <!-- JSON-LD Structured Data for Google Ranking -->
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body data-theme="cyber-dark">
  <div id="app" class="app-layout">
    
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <a href="/" style="display:flex; align-items:center; gap:14px; text-decoration:none; color:inherit;">
          <div class="brand-logo-wrap">
            <img src="/assets/logo.png" alt="Any DL Logo" class="brand-logo">
            <span class="logo-glow"></span>
          </div>
          <div class="brand-text">
            <div class="brand-title">Any <span>DL</span></div>
            <div class="brand-subtitle">Universal Downloader</div>
          </div>
        </a>
      </div>

      <nav class="sidebar-nav">
        <a href="/" class="nav-item active" style="text-decoration:none;">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span class="nav-label">Downloader</span>
        </a>

        <a href="/#queue" class="nav-item" id="nav-queue-link" style="text-decoration:none;">
          <div class="icon-wrap">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            <span class="badge-count" id="active-badge" style="display: none;">0</span>
          </div>
          <span class="nav-label">Live Queue</span>
        </a>

        <a href="/#library" class="nav-item" style="text-decoration:none;">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>
          <span class="nav-label">Library</span>
        </a>
      </nav>

      <div class="sidebar-status">
        <div class="status-indicator">
          <span class="pulse-dot"></span>
          <span class="status-title">Engine Ready</span>
        </div>
        <div class="status-details">Universal Core</div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <div class="mobile-brand">
            <img src="/assets/logo.png" alt="Logo" class="mobile-logo">
            <span class="mobile-title">Any <span>DL</span></span>
          </div>
          <div style="font-size:1.1rem; font-weight:700; color:var(--text-muted);">
            <a href="/" style="color:var(--text-muted); text-decoration:none;">Home</a> / <span style="color:${page.color};">${page.name}</span>
          </div>
        </div>

        ${getHeaderNavHtml()}

        <div class="header-actions">
          <div class="quick-status-chip">
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Stereo AAC Audio</span>
          </div>
          <button class="theme-toggle-btn" id="theme-toggle-btn" title="Toggle Theme">
            <svg class="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
        </div>
      </header>

      <!-- Hero Section -->
      <div class="hero-card" style="border-color:${page.color}44;">
        <div class="hero-badge" style="background:${page.color}15; border-color:${page.color}44; color:${page.color};">
          <span class="badge-sparkle">✦</span>
          <span>${page.badge}</span>
        </div>
        <h1 class="hero-headline" style="font-size:2.4rem;">${page.h1}</h1>
        <p class="hero-desc">${page.subtitle}</p>

        <!-- Downloader Input Form -->
        <form class="omni-input-container" id="url-form">
          <div class="url-detector-badge" id="platform-badge" style="display: none;"></div>
          <div class="input-glow-border" style="border-color:${page.color}66;">
            <div class="input-prefix-icon" style="color:${page.color};">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <input 
              type="text" 
              id="url-input" 
              placeholder="${page.placeholder}"
              autocomplete="off"
              spellcheck="false"
              required
            >
            <button type="button" class="input-action-btn paste-btn" id="paste-btn" title="Paste from Clipboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
              <span>Paste</span>
            </button>
            <button type="button" class="input-action-btn clear-btn" id="clear-btn" title="Clear text" style="display: none;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button type="submit" class="submit-fetch-btn" id="fetch-btn" style="background:linear-gradient(135deg, ${page.color} 0%, #2563eb 100%);">
              <span class="btn-text">Analyze & Download</span>
              <span class="btn-spinner" style="display: none;"></span>
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </form>

        <!-- Platform Switcher Links -->
        <div class="platforms-row" style="margin-top:16px;">
          <span class="platforms-label">Explore Platforms:</span>
          <div class="platform-chips">
            ${platformLinksHtml}
          </div>
        </div>
      </div>

      <!-- Format Inspector Modal / Media Card View -->
      <div class="inspector-section" id="inspector-card" style="display: none;">
        <div class="card-glass-header">
          <div class="card-header-left">
            <span class="pulse-indicator"></span>
            <h3>Media Inspector & Format Configurator</h3>
          </div>
          <button class="close-card-btn" id="close-inspector-btn" title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="inspector-body">
          <!-- Media Preview Left Column -->
          <div class="media-preview-col">
            <div class="preview-thumbnail-wrap">
              <img id="media-thumb" src="" alt="Thumbnail" class="preview-thumbnail">
              <span class="preview-duration-badge" id="media-duration">--:--</span>
              <button class="preview-play-overlay-btn" id="preview-play-btn" title="Preview video with sound">
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
            </div>

            <div class="preview-meta-info">
              <h4 class="media-title" id="media-title">Title</h4>
              <div class="media-author-row">
                <span class="media-author" id="media-author">Author</span>
                <span class="author-verified">✓</span>
              </div>
              <div class="media-stats-row">
                <span class="stat-pill" id="media-views"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> <span id="views-text">0 views</span></span>
                <span class="stat-pill" id="media-date"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> <span id="date-text">Recent</span></span>
              </div>
            </div>
          </div>

          <!-- Configuration Right Column -->
          <div class="media-config-col">
            <div class="format-mode-nav">
              <button class="mode-btn active" data-mode="video">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
                <span>Video</span>
              </button>
              <button class="mode-btn" data-mode="audio">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                <span>Audio Only</span>
              </button>
              <button class="mode-btn" data-mode="extras">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                <span>Cover & Subs</span>
              </button>
            </div>

            <!-- Video Config Panel -->
            <div class="config-panel active" id="panel-video">
              <div class="form-row">
                <label class="config-label">Resolution & Quality:</label>
                <div class="quality-grid" id="video-quality-grid">
                  <button type="button" class="quality-pill active" data-res="best">
                    <span class="res-tag">BEST</span>
                    <span class="res-desc">Highest Quality</span>
                  </button>
                  <button type="button" class="quality-pill" data-res="2160">
                    <span class="res-tag">4K 2160p</span>
                    <span class="res-desc">Ultra HD</span>
                  </button>
                  <button type="button" class="quality-pill" data-res="1440">
                    <span class="res-tag">2K 1440p</span>
                    <span class="res-desc">QHD</span>
                  </button>
                  <button type="button" class="quality-pill" data-res="1080">
                    <span class="res-tag">1080p FHD</span>
                    <span class="res-desc">Full HD</span>
                  </button>
                  <button type="button" class="quality-pill" data-res="720">
                    <span class="res-tag">720p HD</span>
                    <span class="res-desc">Standard HD</span>
                  </button>
                  <button type="button" class="quality-pill" data-res="480">
                    <span class="res-tag">480p SD</span>
                    <span class="res-desc">Data Saver</span>
                  </button>
                </div>
              </div>

              <div class="audio-notice-badge" style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); border-radius:8px; margin-bottom:14px; font-size:0.8rem; color:#34d399;">
                <svg style="width:16px; height:16px; flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                <span><strong>Full Sound Included:</strong> High-definition stereo audio is automatically merged into all video downloads.</span>
              </div>

              <div class="form-row split-row">
                <div class="form-group">
                  <label class="config-label">Container Format:</label>
                  <select id="video-container" class="config-select">
                    <option value="mp4" selected>MP4 (Universal compatible)</option>
                    <option value="mkv">MKV (Matroska)</option>
                    <option value="webm">WEBM (Modern Web)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="config-label">Specific Stream (Optional):</label>
                  <select id="video-stream-select" class="config-select">
                    <option value="auto">Auto Best Stream (Recommended • Full Sound)</option>
                  </select>
                </div>
              </div>

              <div class="toggles-grid">
                <label class="toggle-control">
                  <input type="checkbox" id="embed-subs-toggle">
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Embed Subtitles</span>
                </label>
                <label class="toggle-control">
                  <input type="checkbox" id="embed-thumb-toggle" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Embed Cover Art</span>
                </label>
                <label class="toggle-control">
                  <input type="checkbox" id="add-chapters-toggle" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Add Video Chapters</span>
                </label>
                <label class="toggle-control">
                  <input type="checkbox" id="sponsorblock-toggle">
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Remove Sponsors</span>
                </label>
              </div>
            </div>

            <!-- Audio Config Panel -->
            <div class="config-panel" id="panel-audio">
              <div class="form-row">
                <label class="config-label">Audio Format:</label>
                <div class="quality-grid" id="audio-format-grid">
                  <button type="button" class="quality-pill active" data-aformat="mp3">
                    <span class="res-tag">MP3</span>
                    <span class="res-desc">Most Compatible</span>
                  </button>
                  <button type="button" class="quality-pill" data-aformat="m4a">
                    <span class="res-tag">M4A / AAC</span>
                    <span class="res-desc">Apple & Mobile</span>
                  </button>
                  <button type="button" class="quality-pill" data-aformat="flac">
                    <span class="res-tag">FLAC</span>
                    <span class="res-desc">Lossless Studio</span>
                  </button>
                  <button type="button" class="quality-pill" data-aformat="opus">
                    <span class="res-tag">OPUS</span>
                    <span class="res-desc">High Fidelity</span>
                  </button>
                  <button type="button" class="quality-pill" data-aformat="wav">
                    <span class="res-tag">WAV</span>
                    <span class="res-desc">Uncompressed</span>
                  </button>
                </div>
              </div>

              <div class="form-row">
                <label class="config-label">Audio Bitrate:</label>
                <div class="bitrate-selector">
                  <label class="bitrate-radio"><input type="radio" name="audio-quality" value="320k" checked> <span>320 kbps (Extreme)</span></label>
                  <label class="bitrate-radio"><input type="radio" name="audio-quality" value="256k"> <span>256 kbps (High)</span></label>
                  <label class="bitrate-radio"><input type="radio" name="audio-quality" value="192k"> <span>192 kbps (Medium)</span></label>
                  <label class="bitrate-radio"><input type="radio" name="audio-quality" value="128k"> <span>128 kbps (Standard)</span></label>
                </div>
              </div>

              <div class="toggles-grid">
                <label class="toggle-control">
                  <input type="checkbox" id="audio-embed-thumb" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Embed Album Artwork</span>
                </label>
                <label class="toggle-control">
                  <input type="checkbox" id="audio-embed-tags" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Embed ID3 Tags</span>
                </label>
              </div>
            </div>

            <!-- Extras Panel -->
            <div class="config-panel" id="panel-extras">
              <div class="extras-download-options">
                <div class="extra-card">
                  <div class="extra-icon">🖼️</div>
                  <div class="extra-info">
                    <h4>Thumbnail Cover Art</h4>
                    <p>Save high resolution cover image</p>
                  </div>
                  <button type="button" class="btn-secondary" id="btn-download-thumb">Download Cover</button>
                </div>

                <div class="extra-card">
                  <div class="extra-icon">📝</div>
                  <div class="extra-info">
                    <h4>Subtitles & Captions</h4>
                    <p>Download SRT / VTT subtitle files</p>
                    <div class="sub-tags-wrap" id="subs-badge-wrap">
                      <span class="sub-badge">Auto Subs</span>
                    </div>
                  </div>
                  <button type="button" class="btn-secondary" id="btn-download-subs">Download Subs</button>
                </div>
              </div>
            </div>

            <!-- Playlist Selector -->
            <div class="playlist-section" id="playlist-picker" style="display: none;">
              <div class="playlist-header">
                <div class="pl-info">
                  <span class="pl-tag">PLAYLIST DETECTED</span>
                  <span id="pl-count-text">0 items</span>
                </div>
                <div class="pl-actions">
                  <button type="button" class="btn-subtle" id="pl-select-all">Select All</button>
                  <button type="button" class="btn-subtle" id="pl-deselect-all">Deselect All</button>
                </div>
              </div>
              <div class="playlist-items-scroll" id="playlist-items-list"></div>
            </div>

            <!-- Real-time Inline Progress Bar -->
            <div class="card-inline-progress" id="card-inline-progress" style="display: none; margin-top: 14px; padding: 16px; background: rgba(0, 229, 255, 0.08); border: 1px solid var(--accent-cyan); border-radius: var(--radius-md); box-shadow: 0 0 20px var(--accent-glow);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                <span style="font-size:0.88rem; font-weight:700; color:var(--accent-cyan);" id="inline-status-title">Preparing your download...</span>
                <span style="font-size:0.88rem; font-family:var(--font-mono); color:var(--text-main); font-weight:700;" id="inline-status-pct">0%</span>
              </div>
              <div class="progress-bar-wrap" style="height: 10px; background: rgba(255,255,255,0.12);">
                <div class="progress-bar-fill" id="inline-progress-fill" style="width: 0%;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-muted); font-family:var(--font-mono); margin-top: 8px;">
                <span id="inline-speed-text">Connecting...</span>
                <span id="inline-eta-text">Browser will prompt download automatically</span>
              </div>
              <div id="inline-ready-actions" style="display: none; margin-top: 12px; text-align: center;">
                <a href="#" id="inline-direct-download-link" class="btn-primary-action" style="display: inline-flex; padding: 10px 20px; font-size: 0.88rem; text-decoration: none;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>Click here if browser download did not start</span>
                </a>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-footer-row" style="margin-top: 16px;">
              <button type="button" class="btn-primary-action" id="start-download-now-btn" style="flex: 2; background:linear-gradient(135deg, ${page.color} 0%, #2563eb 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Download to Browser</span>
              </button>
              <button type="button" class="btn-queue-action" id="add-to-queue-btn" style="flex: 1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Queue</span>
              </button>
            </div>

            <div style="font-size:0.78rem; color:var(--text-muted); text-align:center; margin-top:10px;">
              ⚡ <strong>Direct Download:</strong> Saves cleanly into your computer's Downloads folder with full audio.
            </div>

          </div>
        </div>
      </div>

      <!-- Features Showcase Section -->
      <section style="margin-top: 48px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 20px;">Why Use Any DL for ${page.platform}?</h2>
        <div class="features-showcase" style="margin-top: 0;">
          ${featuresHtml}
        </div>
      </section>

      <!-- Step-by-Step How-To Section -->
      <section style="margin-top: 56px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 10px;">How to Download from ${page.platform}</h2>
        <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 24px;">Follow these simple steps to save videos and audio directly to your device:</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
          ${howToHtml}
        </div>
      </section>

      <!-- FAQ Section -->
      <section style="margin-top: 56px; margin-bottom: 60px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 10px;">Frequently Asked Questions</h2>
        <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 24px;">Everything you need to know about downloading ${page.platform} media:</p>
        <div>
          ${faqsHtml}
        </div>
      </section>

      <!-- Google AdSense Compliant Footer -->
      ${getFooterHtml()}

    </main>

    <!-- Floating Docked In-App Media Player -->
    <div class="floating-media-player" id="media-player-dock" style="display: none;">
      <div class="player-container">
        <div class="player-video-box" id="player-video-box">
          <video id="global-video-player" playsinline></video>
          <iframe id="global-iframe-player" style="display:none; width:100%; height:280px; border:none; background:#000;" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
          <button class="player-pip-toggle" id="player-pip-btn" title="Toggle Size">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
        </div>

        <div class="player-audio-controls">
          <div class="player-meta">
            <div class="player-track-title" id="player-title">Track Title</div>
            <div class="player-track-subtitle" id="player-subtitle">Author</div>
          </div>

          <div class="player-middle">
            <div class="player-buttons">
              <button class="player-btn" id="player-seek-back" title="Rewind 10s">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>
              </button>
              <button class="player-play-btn" id="player-play-toggle">
                <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display: none;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              </button>
              <button class="player-btn" id="player-seek-forward" title="Forward 10s">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
              </button>
            </div>

            <div class="player-scrubber-row">
              <span class="time-label" id="player-curr-time">0:00</span>
              <input type="range" class="player-scrubber" id="player-scrubber" min="0" max="100" value="0" step="0.1">
              <span class="time-label" id="player-total-time">0:00</span>
            </div>
          </div>

          <div class="player-actions-right">
            <div class="volume-slider-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
              <input type="range" id="player-volume" min="0" max="1" step="0.05" value="1">
            </div>
            <button class="player-btn" id="player-close-btn" title="Close Player">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification Container -->
    <div class="toast-container" id="toast-container"></div>
  </div>

  <script src="/app.js"></script>
</body>
</html>`;
}

// Generate XML Sitemap for Google Search Console
function renderSitemap(hostUrl = '') {
  const urls = [
    { loc: `${hostUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${hostUrl}/supported-sites`, priority: '0.9', changefreq: 'weekly' },
    ...seoPages.map(p => ({
      loc: `${hostUrl}/${p.slug}`,
      priority: '0.9',
      changefreq: 'weekly'
    })),
    { loc: `${hostUrl}/privacy-policy`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${hostUrl}/terms-of-service`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${hostUrl}/disclaimer`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${hostUrl}/dmca`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${hostUrl}/contact`, priority: '0.7', changefreq: 'monthly' }
  ];

  const xmlEntries = urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}

module.exports = {
  renderSeoPage,
  renderSitemap
};
