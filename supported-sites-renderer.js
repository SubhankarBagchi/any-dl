// Supported Sites Page Generator for Google SEO & User Discovery
const seoPages = require('./seo-pages');
const fs = require('fs');
const path = require('path');

function getExtractors() {
  try {
    const file = path.join(__dirname, 'data', 'extractors.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function renderSupportedSitesPage(hostUrl = '') {
  const currentUrl = `${hostUrl}/supported-sites`;
  const extractors = getExtractors();

  // Popular sites cards
  const popularCardsHtml = seoPages.map(p => `
    <a href="/${p.slug}" class="popular-site-card" style="display:flex; align-items:center; gap:12px; padding:16px; background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); text-decoration:none; color:inherit; transition:0.2s;" onmouseover="this.style.borderColor='${p.color}'; this.style.transform='translateY(-3px)';" onmouseout="this.style.borderColor='var(--border-glass)'; this.style.transform='none';">
      <div style="width:10px; height:10px; border-radius:50%; background:${p.color};"></div>
      <div>
        <div style="font-weight:700; font-size:1rem; color:var(--text-main);">${p.name}</div>
        <div style="font-size:0.78rem; color:var(--text-muted);">${p.badge}</div>
      </div>
    </a>
  `).join('');

  // 1752 Extractors grid list
  const extractorsListHtml = extractors.map(name => `
    <div class="extractor-item" data-name="${name.toLowerCase()}" style="padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:var(--radius-sm); font-size:0.84rem; font-family:var(--font-mono); color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
      ${name}
    </div>
  `).join('');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Supported Sites Directory — 1,700+ Video & Audio Extractors | Any DL",
    "url": currentUrl,
    "description": "Complete list of 1,700+ supported video, audio, and social media sites you can download from using Any DL.",
    "publisher": {
      "@type": "Organization",
      "name": "Any DL"
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Supported Sites Directory — 1,700+ Websites & Video Extractors | Any DL</title>
  <meta name="description" content="Discover all 1,700+ supported platforms for Any DL. Download videos, music, reels, and stories from YouTube, TikTok, Instagram, Twitter, Facebook, SoundCloud, and 1,700+ websites.">
  <meta name="keywords" content="any dl supported sites, supported extractors, video download sites list, youtube, tiktok, instagram, soundcloud, 1000+ sites downloader">
  <link rel="canonical" href="${currentUrl}">
  <meta name="robots" content="index, follow">

  <link rel="icon" type="image/png" href="/assets/logo.png">

  <!-- Google Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/styles.css">

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
        <a href="/" class="nav-item" style="text-decoration:none;">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span class="nav-label">Downloader</span>
        </a>

        <a href="/#queue" class="nav-item" style="text-decoration:none;">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
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
        <div class="status-details">1,752 Extractors</div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <div class="mobile-brand">
            <img src="/assets/logo.png" alt="Logo" class="mobile-logo">
            <span class="mobile-title">Any <span>DL</span></span>
          </div>
          <div style="font-size:1.1rem; font-weight:700;">
            <a href="/" style="color:var(--text-muted); text-decoration:none;">Home</a> / <span style="color:var(--accent-cyan);">Supported Sites</span>
          </div>
        </div>
        <div class="header-actions">
          <div class="quick-status-chip">
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${extractors.length} Verified Sites</span>
          </div>
        </div>
      </header>

      <!-- Hero Directory -->
      <div class="hero-card" style="margin-bottom: 32px;">
        <div class="hero-badge">
          <span class="badge-sparkle">✦</span>
          <span>Comprehensive Web Extractors Directory</span>
        </div>
        <h1 class="hero-headline">1,750+ Supported Websites & Services</h1>
        <p class="hero-desc">Any DL can extract and download high definition video and audio from virtually any site on the internet.</p>

        <!-- Search Filter Input -->
        <div style="max-width: 540px; margin-top: 24px; position:relative;">
          <input 
            type="text" 
            id="extractor-search" 
            placeholder="Type website name to filter (e.g. youtube, vimeo, bandcamp)..." 
            style="width:100%; padding:14px 20px; background:var(--bg-input); border:2px solid var(--border-glass); border-radius:var(--radius-pill); color:var(--text-main); font-family:inherit; font-size:0.95rem; outline:none; transition:border-color 0.2s;"
            onfocus="this.style.borderColor='var(--accent-cyan)';"
            onblur="this.style.borderColor='var(--border-glass)';"
            oninput="handleSearchInput(this.value)"
          >
        </div>

        <!-- Dynamic Category Filter Bar -->
        <div class="category-filter-bar" id="category-filter-bar">
          <button class="cat-pill active" data-category="all" onclick="setCategory('all')">
            <span>All Sites</span>
            <span class="cat-count">${extractors.length}</span>
          </button>
          <button class="cat-pill" data-category="video" onclick="setCategory('video')">
            <span>🎬 Video & Movies</span>
          </button>
          <button class="cat-pill" data-category="music" onclick="setCategory('music')">
            <span>🎵 Music & Audio</span>
          </button>
          <button class="cat-pill" data-category="social" onclick="setCategory('social')">
            <span>📱 Social Media</span>
          </button>
          <button class="cat-pill" data-category="streams" onclick="setCategory('streams')">
            <span>🎮 Livestreams & Gaming</span>
          </button>
        </div>

        <!-- Alphabetical A-Z Jump Bar -->
        <div class="alpha-bar" id="alpha-bar">
          <button class="alpha-btn active" data-letter="all" onclick="setLetter('all')">ALL</button>
          <button class="alpha-btn" data-letter="#" onclick="setLetter('#')">#</button>
          ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(char => `
            <button class="alpha-btn" data-letter="${char}" onclick="setLetter('${char}')">${char}</button>
          `).join('')}
        </div>
      </div>

      <!-- Top Platforms Grid -->
      <section style="margin-bottom: 40px;">
        <h2 style="font-size:1.35rem; font-weight:800; margin-bottom:16px;">Top Downloaders</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:16px;">
          ${popularCardsHtml}
        </div>
      </section>

      <!-- All 1752 Extractors Directory -->
      <section>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <h2 style="font-size:1.35rem; font-weight:800;">
            Supported Extractors (<span id="visible-count" style="color:var(--accent-cyan);">${extractors.length}</span>)
          </h2>
          <div id="filter-indicator" style="font-size:0.84rem; color:var(--text-muted);">Showing all sites</div>
        </div>
        <div id="extractors-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:10px; max-height:800px; overflow-y:auto; padding-right:8px;">
          ${extractorsListHtml}
        </div>
      </section>

      <footer style="margin-top: 80px; padding-top: 36px; border-top: 1px solid var(--border-glass); text-align:center;">
        <p style="font-size: 0.85rem; color: var(--text-dim);">© 2026 Any DL • The Universal Media Downloader</p>
      </footer>
    </main>
  </div>

  <script>
    let currentCategory = 'all';
    let currentLetter = 'all';
    let currentSearch = '';

    const CATEGORY_MAP = {
      music: ['sound', 'bandcamp', 'mixcloud', 'audio', 'beatport', 'deezer', 'jamendo', 'podcast', 'music', 'track', 'song', 'fm', 'radio'],
      video: ['tube', 'video', 'tv', 'stream', 'movie', 'film', 'vimeo', 'dailymotion', 'rumble', 'bili', 'play', 'media', 'news', 'cinema'],
      social: ['insta', 'tiktok', 'twitter', 'facebook', 'reddit', 'pin', 'tumblr', 'snap', 'vk', 'weibo', 'social', 'thread'],
      streams: ['twitch', 'kick', 'trovo', 'gaming', 'game', 'live', 'afreeca', 'steam', 'huya', 'douyu']
    };

    function handleSearchInput(val) {
      currentSearch = val.toLowerCase().trim();
      applyFilters();
    }

    function setCategory(cat) {
      currentCategory = cat;
      document.querySelectorAll('#category-filter-bar .cat-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === cat);
      });
      applyFilters();
    }

    function setLetter(ltr) {
      currentLetter = ltr;
      document.querySelectorAll('#alpha-bar .alpha-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.letter === ltr);
      });
      applyFilters();
    }

    function applyFilters() {
      const items = document.querySelectorAll('.extractor-item');
      let visible = 0;

      items.forEach(item => {
        const name = item.dataset.name;
        
        // 1. Search filter
        const matchSearch = !currentSearch || name.includes(currentSearch);

        // 2. Letter filter
        let matchLetter = true;
        if (currentLetter !== 'all') {
          if (currentLetter === '#') {
            matchLetter = /^[^a-zA-Z]/.test(name);
          } else {
            matchLetter = name.startsWith(currentLetter.toLowerCase());
          }
        }

        // 3. Category filter
        let matchCategory = true;
        if (currentCategory !== 'all') {
          const keywords = CATEGORY_MAP[currentCategory] || [];
          matchCategory = keywords.some(k => name.includes(k));
        }

        if (matchSearch && matchLetter && matchCategory) {
          item.style.display = 'block';
          visible++;
        } else {
          item.style.display = 'none';
        }
      });

      document.getElementById('visible-count').textContent = visible;
      
      const parts = [];
      if (currentCategory !== 'all') parts.push(currentCategory.toUpperCase());
      if (currentLetter !== 'all') parts.push('Letter ' + currentLetter);
      if (currentSearch) parts.push('Query "' + currentSearch + '"');
      document.getElementById('filter-indicator').textContent = parts.length 
        ? 'Filtered by: ' + parts.join(' • ') 
        : 'Showing all sites';
    }
  </script>
</body>
</html>`;
}

module.exports = {
  renderSupportedSitesPage
};
