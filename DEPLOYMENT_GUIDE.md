# Any DL Web Application — Deployment Guide

This guide covers the best ways to deploy the **Any DL** web application so you can access it from anywhere on mobile and desktop.

---

## ⚡ Method 1: Deploy with Docker (Recommended for any VPS or Cloud)

A pre-configured [`Dockerfile`](./Dockerfile) and [`docker-compose.yml`](./docker-compose.yml) are included. Docker automatically bundles Node.js, `ffmpeg`, and `yt-dlp`.

### Step 1: Install Docker on your server
If using an Ubuntu / Debian VPS:
```bash
curl -fsSL https://get.docker.com | sh
```

### Step 2: Start the application
Clone or upload the `webapp` folder to your server, then run:
```bash
docker compose up -d --build
```
Your app will be live on `http://YOUR_SERVER_IP:3000`!

---

## 🌐 Method 2: Deploy to Free Cloud Platforms (Render / Railway / Fly.io)

### A. Deploy to Render (Render.com)
1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New → Web Service**.
3. Connect your GitHub repository.
4. Select **Docker** as the Runtime environment (Render will automatically detect the included `Dockerfile`).
5. Choose your region and click **Create Web Service**.
6. Render will automatically build the container and provide you with a free HTTPS URL (e.g. `https://any-dl.onrender.com`).

### B. Deploy to Railway (Railway.app)
1. Go to [Railway.app](https://railway.app/).
2. Click **New Project → Deploy from GitHub repo**.
3. Select this repository.
4. Railway will automatically detect the `Dockerfile` and deploy the service.
5. In your project settings, click **Generate Domain** to get a public URL.

---

## 🖥️ Method 3: Direct VPS Deployment (Ubuntu / Debian Server with PM2)

If you have a Linux VPS (DigitalOcean, Linode, AWS EC2, Hetzner):

### Step 1: Install Node.js, FFmpeg, and Python
```bash
sudo apt update && sudo apt install -y curl ffmpeg python3 python3-pip

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install latest yt-dlp binary
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### Step 2: Setup Webapp
```bash
cd /var/www/any-dl/webapp
npm install --omit=dev
```

### Step 3: Run with PM2 (24/7 background process)
```bash
sudo npm install -g pm2
pm2 start server.js --name "any-dl"
pm2 save
pm2 startup
```

### Step 4: Setup Nginx Reverse Proxy with Free SSL (Let's Encrypt)
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Disable buffering for Server-Sent Events (Live download progress)
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
```
Obtain free SSL:
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 🏠 Method 4: Host from Home PC for Free with Cloudflare Tunnel

If you want to keep running the app on your computer but make it publicly accessible on your phone or to friends with a free custom HTTPS domain:

1. Install Cloudflare Tunnel (`cloudflared`):
   ```powershell
   winget install Cloudflare.cloudflared
   ```
2. Start an instant quick tunnel:
   ```powershell
   cloudflared tunnel --url http://localhost:3000
   ```
3. Cloudflare will output a public HTTPS link (e.g. `https://random-name.trycloudflare.com`) that routes directly to your local Any DL server securely without opening any router ports!
