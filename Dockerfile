FROM node:20-alpine

# Install system dependencies: python3, ffmpeg, curl
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl \
    ca-certificates

# Install latest yt-dlp globally
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p downloads data bin

# Expose default web server port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start Any DL Web Server
CMD ["node", "server.js"]
