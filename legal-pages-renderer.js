// Legal Pages Renderer for Google AdSense Compliance
// Generates Privacy Policy, Terms of Service, Disclaimer, DMCA, and Contact Pages

function getHeaderNavHtml() {
  return `
    <nav class="header-nav-links">
      <a href="/" class="header-nav-link">Downloader</a>
      <a href="/youtube-downloader" class="header-nav-link">YouTube</a>
      <a href="/instagram-downloader" class="header-nav-link">Instagram</a>
      <a href="/tiktok-downloader" class="header-nav-link">TikTok</a>
      <a href="/privacy-policy" class="header-nav-link">Privacy</a>
      <a href="/contact" class="header-nav-link">Contact</a>
    </nav>
  `;
}

function getFooterHtml() {
  return `
    <footer class="app-footer">
      <div class="footer-grid">
        <!-- Col 1: Brand & About -->
        <div class="footer-col">
          <div class="footer-brand">
            <img src="/assets/logo.png" alt="Any DL Logo" class="footer-logo">
            <span class="footer-title">Any <span>DL</span></span>
          </div>
          <p class="footer-tagline">
            The high-speed, universal online video and audio converter. Download media in 4K UHD, 1080p 60fps, and studio 320kbps MP3 directly to your device without watermark.
          </p>
          <div class="footer-badges">
            <span class="f-badge">⚡ 100% Free</span>
            <span class="f-badge">🔒 Privacy First</span>
            <span class="f-badge">🚫 Zero Adware</span>
          </div>
        </div>

        <!-- Col 2: Supported Extractors -->
        <div class="footer-col">
          <h4 class="footer-heading">Popular Downloaders</h4>
          <ul class="footer-links">
            <li><a href="/youtube-downloader">YouTube Downloader</a></li>
            <li><a href="/youtube-shorts-downloader">YouTube Shorts to MP4</a></li>
            <li><a href="/instagram-downloader">Instagram Reels & Stories</a></li>
            <li><a href="/tiktok-downloader">TikTok Without Watermark</a></li>
            <li><a href="/soundcloud-downloader">SoundCloud to MP3</a></li>
            <li><a href="/facebook-downloader">Facebook Video Saver</a></li>
            <li><a href="/twitter-downloader">Twitter / X Clip Downloader</a></li>
          </ul>
        </div>

        <!-- Col 3: Legal & AdSense Compliance -->
        <div class="footer-col">
          <h4 class="footer-heading">Legal & Compliance</h4>
          <ul class="footer-links">
            <li><a href="/privacy-policy">Privacy Policy (GDPR / CCPA)</a></li>
            <li><a href="/terms-of-service">Terms of Service</a></li>
            <li><a href="/disclaimer">Disclaimer & Trademarks</a></li>
            <li><a href="/dmca">DMCA Copyright Policy</a></li>
            <li><a href="/contact">Contact & Support</a></li>
          </ul>
        </div>

        <!-- Col 4: Safe Usage Notice -->
        <div class="footer-col">
          <h4 class="footer-heading">Service Notice</h4>
          <p class="footer-notice-text">
            Any DL does not host, store, or archive any copyrighted videos, audio files, or media on its servers. All media is fetched directly from user-provided URLs and processed for personal, fair-use backup.
          </p>
          <div class="adsense-disclosure-text">
            <strong>Advertising Notice:</strong> Third party vendors, including Google, use cookies to serve ads based on user visits. You can opt out of personalized ads at <a href="https://www.aboutads.info" target="_blank" rel="noopener">aboutads.info</a>.
          </div>
        </div>
      </div>

      <!-- Footer Bottom Bar -->
      <div class="footer-bottom-bar">
        <p>© 2026 Any DL • Universal Online Media Platform. All rights reserved.</p>
        <div class="footer-bottom-links">
          <a href="/privacy-policy">Privacy</a> • 
          <a href="/terms-of-service">Terms</a> • 
          <a href="/disclaimer">Disclaimer</a> • 
          <a href="/dmca">DMCA</a> • 
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  `;
}

function renderLegalPageShell({ title, description, h1, subtitle, contentHtml, hostUrl, canonicalPath }) {
  const currentUrl = `${hostUrl}${canonicalPath}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Any DL</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${currentUrl}">
  <meta name="robots" content="index, follow">

  <link rel="icon" type="image/png" href="/assets/logo.png">

  <!-- Google Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/styles.css">
  
  <style>
    .legal-content-card {
      background: var(--bg-card);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-lg);
      padding: 36px 40px;
      margin-top: 28px;
      box-shadow: var(--shadow-card);
      line-height: 1.7;
      color: var(--text-muted);
    }
    .legal-content-card h2 {
      color: var(--text-main);
      font-size: 1.35rem;
      font-weight: 700;
      margin-top: 32px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .legal-content-card h2:first-of-type {
      margin-top: 0;
    }
    .legal-content-card p {
      margin-bottom: 16px;
      font-size: 0.95rem;
    }
    .legal-content-card ul {
      margin-bottom: 20px;
      padding-left: 24px;
    }
    .legal-content-card li {
      margin-bottom: 8px;
      font-size: 0.92rem;
    }
    .legal-content-card strong {
      color: var(--text-main);
    }
    .legal-content-card a {
      color: var(--accent-cyan);
      text-decoration: underline;
    }
    .legal-highlight-box {
      background: rgba(0, 229, 255, 0.05);
      border-left: 3px solid var(--accent-cyan);
      padding: 16px 20px;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      margin: 20px 0;
      color: var(--text-main);
      font-size: 0.92rem;
    }
  </style>
</head>
<body data-theme="cyber-dark">
  <div id="app" class="app-layout">
    
    <!-- Sidebar Navigation -->
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
          <div style="font-size:1.05rem; font-weight:700;">
            <a href="/" style="color:var(--text-muted); text-decoration:none;">Home</a> / <span style="color:var(--accent-cyan);">${title}</span>
          </div>
        </div>

        ${getHeaderNavHtml()}

        <div class="header-actions">
          <div class="quick-status-chip">
            <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Ultra-Fast Core</span>
          </div>
          <button class="theme-toggle-btn" onclick="toggleTheme()" title="Toggle Theme">
            <svg class="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
        </div>
      </header>

      <!-- Hero Header -->
      <div class="hero-card" style="margin-bottom: 24px;">
        <div class="hero-badge">
          <span class="badge-sparkle">✦</span>
          <span>Official Legal & Compliance Documentation</span>
        </div>
        <h1 class="hero-headline">${h1}</h1>
        <p class="hero-desc">${subtitle}</p>
      </div>

      <!-- Legal Document Body -->
      <article class="legal-content-card">
        ${contentHtml}
      </article>

      ${getFooterHtml()}
    </main>
  </div>

  <script>
    function toggleTheme() {
      const current = document.body.getAttribute('data-theme');
      const next = current === 'cyber-dark' ? 'clean-light' : 'cyber-dark';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('anydl-theme', next);
    }
    const savedTheme = localStorage.getItem('anydl-theme') || 'cyber-dark';
    document.body.setAttribute('data-theme', savedTheme);
  </script>
</body>
</html>`;
}

// 1. PRIVACY POLICY (Google AdSense, GDPR & CCPA Compliant)
function renderPrivacyPolicy(hostUrl = '') {
  const content = `
    <p><em>Last updated: September 28, 2026</em></p>

    <div class="legal-highlight-box">
      <strong>Summary:</strong> Any DL respects your privacy. We do not require registration, we do not log personal browsing activity, and we process media links strictly in real-time. This policy details our compliance with Google AdSense, GDPR, CCPA, and cookie policies.
    </div>

    <h2>1. Introduction</h2>
    <p>This Privacy Policy explains how <strong>Any DL</strong> ("we", "us", or "our") collects, uses, and safeguards information when you visit our website at <code>${hostUrl || 'https://any-dl.com'}</code> and use our web-based media conversion tools.</p>

    <h2>2. Google AdSense & Third-Party Advertising (Mandatory Disclosure)</h2>
    <p>We may display advertisements provided by <strong>Google AdSense</strong> and other third-party advertising networks to support the maintenance of this free tool.</p>
    <ul>
      <li><strong>DoubleClick DART Cookie:</strong> Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to users based on their visits to our site and other sites on the Internet.</li>
      <li><strong>User Opt-Out:</strong> Users may opt out of the use of the DART cookie for personalized advertising by visiting the <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Google Ad and Content Network Privacy Policy</a> or the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">Network Advertising Initiative Opt-Out Page</a>.</li>
      <li>Third-party ad servers or ad networks use technology in their respective advertisements and links that appear on Any DL, which are sent directly to your browser. They automatically receive your IP address when this occurs.</li>
    </ul>

    <h2>3. Cookies and Web Beacons</h2>
    <p>Like any other website, Any DL uses 'cookies'. These cookies are used to store information including visitors' preferences, such as selected dark/light theme, format preferences, and session state. No personal data is stored in these cookies.</p>

    <h2>4. Log Files and Media Processing</h2>
    <p>Any DL follows standard procedures for using log files. When you submit a URL for analysis, our server momentarily contacts the public API of the target platform to retrieve format streams. We do not permanently store downloaded files or search queries. All downloads are transient and routed directly to your browser.</p>

    <h2>5. GDPR Data Protection Rights (European Users)</h2>
    <p>Under the General Data Protection Regulation (GDPR), European users have the right to request access, rectification, erasure, restriction of processing, or objection to processing of any personal data. Because Any DL does not collect user accounts or identifying personal profiles, we do not store identifying profiles on our servers.</p>

    <h2>6. CCPA Privacy Rights (California Consumers)</h2>
    <p>Under the California Consumer Privacy Act (CCPA), California consumers have the right to request disclosure of personal data collected and request that a business not sell their personal data. <strong>Any DL does not sell personal information to any third parties.</strong></p>

    <h2>7. Children's Information</h2>
    <p>Any DL does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately.</p>

    <h2>8. Changes to This Privacy Policy</h2>
    <p>We may update our Privacy Policy from time to time. We advise you to review this page periodically for any changes. Continued use of the service constitutes acceptance of any updates.</p>

    <h2>9. Contact Us</h2>
    <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at <a href="/contact">our Contact Page</a> or via email at <code>privacy@any-dl.com</code>.</p>
  `;

  return renderLegalPageShell({
    title: 'Privacy Policy',
    description: 'Privacy Policy for Any DL. Transparent disclosure on cookies, Google AdSense, GDPR, CCPA, and data handling practices.',
    h1: 'Privacy Policy',
    subtitle: 'Transparent disclosures regarding cookies, Google AdSense, GDPR, and data protection.',
    contentHtml: content,
    hostUrl,
    canonicalPath: '/privacy-policy'
  });
}

// 2. TERMS OF SERVICE
function renderTermsOfService(hostUrl = '') {
  const content = `
    <p><em>Last updated: September 28, 2026</em></p>

    <div class="legal-highlight-box">
      <strong>Important:</strong> By accessing and using Any DL, you acknowledge that this tool is provided strictly for personal, non-commercial, fair-use purposes. You agree to respect the copyright and intellectual property rights of content creators.
    </div>

    <h2>1. Acceptance of Terms</h2>
    <p>By accessing or using the website Any DL, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

    <h2>2. Permitted Use & Fair Use</h2>
    <p>Any DL provides technical conversion and download utilities based on open-source media technologies. The service is intended solely for:</p>
    <ul>
      <li>Downloading public, non-copyrighted, creative commons, or royalty-free media.</li>
      <li>Creating private, personal backup copies of content that you own or have explicit authorization to download under fair use doctrine.</li>
      <li>Educational, commentary, and research purposes in accordance with Section 107 of the US Copyright Act.</li>
    </ul>

    <h2>3. Prohibited Conduct</h2>
    <p>You agree not to use Any DL to:</p>
    <ul>
      <li>Download, duplicate, or redistribute copyrighted content for commercial purposes without the owner's permission.</li>
      <li>Bypass digital rights management (DRM) or technical protection measures.</li>
      <li>Automate requests via scrapers, bots, or unauthorized API flooding that degrades service quality for other users.</li>
    </ul>

    <h2>4. Disclaimer of Warranties</h2>
    <p>The materials on Any DL are provided on an 'as is' basis. Any DL makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</p>

    <h2>5. Limitation of Liability</h2>
    <p>In no event shall Any DL or its contributors be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Any DL.</p>

    <h2>6. External Third-Party Links</h2>
    <p>Any DL may link to third-party websites or services. We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site.</p>
  `;

  return renderLegalPageShell({
    title: 'Terms of Service',
    description: 'Terms of Service for Any DL. Permitted use guidelines, acceptable use policies, and user obligations.',
    h1: 'Terms of Service',
    subtitle: 'Guidelines, acceptable use policies, and legal terms governing the use of Any DL.',
    contentHtml: content,
    hostUrl,
    canonicalPath: '/terms-of-service'
  });
}

// 3. DISCLAIMER & TRADEMARKS
function renderDisclaimer(hostUrl = '') {
  const content = `
    <p><em>Last updated: September 28, 2026</em></p>

    <div class="legal-highlight-box">
      <strong>Trademark Notice:</strong> YouTube, Instagram, TikTok, Facebook, Twitter, X, SoundCloud, Reddit, Pinterest, Twitch, Vimeo, and all other platform names are registered trademarks of their respective owners. Any DL is not affiliated with, sponsored by, or endorsed by any of these entities.
    </div>

    <h2>1. General Information</h2>
    <p>The information and software tools provided by Any DL are for general educational, personal, and archival purposes only. All information on the site is provided in good faith; however, we make no representation or warranty of any kind regarding accuracy, validity, reliability, or completeness.</p>

    <h2>2. No Hosting or Storage of Media</h2>
    <p><strong>Any DL does NOT host, upload, mirror, or store any video or audio files on our servers.</strong></p>
    <p>Any DL acts exclusively as a client-side interface that queries publicly accessible format manifests from the link you provide. All downloads are streamed in real time straight into your web browser's local storage.</p>

    <h2>3. Trademark Attribution</h2>
    <ul>
      <li><strong>YouTube™ and YouTube Shorts™</strong> are trademarks of Google LLC.</li>
      <li><strong>Instagram™ and Facebook™</strong> are trademarks of Meta Platforms, Inc.</li>
      <li><strong>TikTok™</strong> is a trademark of ByteDance Ltd.</li>
      <li><strong>X™ / Twitter™</strong> is a trademark of X Corp.</li>
      <li><strong>SoundCloud™</strong> is a trademark of SoundCloud Global Limited & Co. KG.</li>
      <li><strong>Twitch™</strong> is a trademark of Twitch Interactive, Inc. / Amazon.com, Inc.</li>
      <li><strong>Vimeo™</strong> is a trademark of Vimeo, Inc.</li>
    </ul>
    <p>References to these platforms are strictly for nominative identification of supported technical extractors.</p>

    <h2>4. Responsibility of the User</h2>
    <p>Users are solely responsible for ensuring that their use of Any DL complies with copyright law and the terms of service of the respective third-party platforms from which media is retrieved.</p>
  `;

  return renderLegalPageShell({
    title: 'Disclaimer & Trademarks',
    description: 'Legal disclaimer and trademark attribution for Any DL. Clarification on non-affiliation and fair use policies.',
    h1: 'Disclaimer & Trademarks',
    subtitle: 'Clarification regarding trademark ownership, non-affiliation, and service boundaries.',
    contentHtml: content,
    hostUrl,
    canonicalPath: '/disclaimer'
  });
}

// 4. DMCA POLICY
function renderDmca(hostUrl = '') {
  const content = `
    <p><em>Last updated: September 28, 2026</em></p>

    <div class="legal-highlight-box">
      <strong>Copyright Notice:</strong> Any DL respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (17 U.S.C. § 512).
    </div>

    <h2>1. Overview</h2>
    <p>Any DL operates as a search and protocol converter tool. Because Any DL does not host, store, or index user content on our web servers, copyright infringement complaints are generally best directed to the platform that hosts the source file (e.g. YouTube, TikTok, Meta).</p>

    <h2>2. Submitting a Notice of Infringement</h2>
    <p>If you are a copyright owner or an agent thereof and believe that any feature of Any DL infringes upon your copyright, you may submit a formal notification pursuant to the DMCA by providing our Designated Agent with the following written information:</p>
    <ul>
      <li>A physical or electronic signature of a person authorized to act on behalf of the owner of the copyright interest.</li>
      <li>A clear description of the copyrighted work that you claim has been infringed.</li>
      <li>Identification of the material or URL on Any DL that you claim is infringing.</li>
      <li>Your contact information including address, telephone number, and email address.</li>
      <li>A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
      <li>A statement made under penalty of perjury that the above information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
    </ul>

    <h2>3. Designated DMCA Agent Contact</h2>
    <p>Please submit all notices to:</p>
    <div style="background:var(--bg-input); padding:16px 20px; border-radius:var(--radius-sm); border:1px solid var(--border-glass); margin:16px 0; font-family:var(--font-mono); font-size:0.9rem;">
      Any DL Legal & DMCA Compliance Team<br>
      Email: dmca@any-dl.com<br>
      Response Window: 24-48 business hours
    </div>
  `;

  return renderLegalPageShell({
    title: 'DMCA Copyright Policy',
    description: 'DMCA Copyright Policy and notification procedures for Any DL under 17 U.S.C. § 512.',
    h1: 'DMCA Copyright Policy',
    subtitle: 'Procedures for submitting copyright notifications and inquiries.',
    contentHtml: content,
    hostUrl,
    canonicalPath: '/dmca'
  });
}

// 5. CONTACT US
function renderContact(hostUrl = '') {
  const content = `
    <p>Have questions, technical suggestions, or feedback about Any DL? We would love to hear from you!</p>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin: 28px 0;">
      <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:24px;">
        <div style="font-size:1.5rem; margin-bottom:8px;">📧</div>
        <h3 style="font-size:1.1rem; color:var(--text-main); margin-bottom:6px;">General Support</h3>
        <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:12px;">Questions about downloads, audio quality, and browser compatibility.</p>
        <a href="mailto:support@any-dl.com" style="color:var(--accent-cyan); font-weight:600; text-decoration:none;">support@any-dl.com</a>
      </div>

      <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:24px;">
        <div style="font-size:1.5rem; margin-bottom:8px;">⚖️</div>
        <h3 style="font-size:1.1rem; color:var(--text-main); margin-bottom:6px;">Legal & DMCA</h3>
        <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:12px;">For copyright notices, privacy inquiries, and terms questions.</p>
        <a href="mailto:dmca@any-dl.com" style="color:var(--accent-cyan); font-weight:600; text-decoration:none;">dmca@any-dl.com</a>
      </div>

      <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:24px;">
        <div style="font-size:1.5rem; margin-bottom:8px;">📢</div>
        <h3 style="font-size:1.1rem; color:var(--text-main); margin-bottom:6px;">Partnerships & Ads</h3>
        <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:12px;">For advertising network inquiries and media partnerships.</p>
        <a href="mailto:partners@any-dl.com" style="color:var(--accent-cyan); font-weight:600; text-decoration:none;">partners@any-dl.com</a>
      </div>
    </div>

    <h2>Frequently Asked Questions</h2>
    <p>Before emailing, check our quick troubleshooting guide:</p>
    <ul>
      <li><strong>Audio is silent:</strong> Ensure your video container is set to MP4. Our server automatically muxes high-grade AAC audio for 100% device compatibility.</li>
      <li><strong>Download did not start:</strong> Modern browsers require you to allow download prompts. Look for the download indicator in your browser address bar.</li>
      <li><strong>Missing platform:</strong> Any DL supports over 1,750+ websites. Try pasting the link directly into the search bar.</li>
    </ul>
  `;

  return renderLegalPageShell({
    title: 'Contact Us',
    description: 'Get in touch with the Any DL team for support, feature inquiries, legal, or partnership discussions.',
    h1: 'Contact Us',
    subtitle: 'We are here to help. Reach out with feedback, inquiries, or support requests.',
    contentHtml: content,
    hostUrl,
    canonicalPath: '/contact'
  });
}

module.exports = {
  renderPrivacyPolicy,
  renderTermsOfService,
  renderDisclaimer,
  renderDmca,
  renderContact,
  getHeaderNavHtml,
  getFooterHtml
};
