# Use official Node.js 18 image
FROM node:18-slim AS base

# Install yt-dlp
RUN apt-get update && \
    apt-get install -y wget ffmpeg && \
    wget -O /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Create symlink to yt-dlp in /app (if needed)
RUN ln -s /usr/local/bin/yt-dlp /app/yt-dlp

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Expose port (default for Next.js)
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production

# Build Next.js app
RUN npm run build

# Start the app
CMD ["npm", "start"] 