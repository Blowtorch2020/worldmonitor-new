# World Monitor - multi-stage build (Node builder + Nginx runtime)
# Self-hosted build for monitor.torchwater.org

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time args (defaults for self-hosted)
ARG VITE_VARIANT=full
ARG VITE_API_BASE_URL=
ARG VITE_HIDE_DOWNLOAD_APP=true
ARG VITE_MAP_INTERACTION_MODE=3d
ENV VITE_VARIANT=$VITE_VARIANT \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_HIDE_DOWNLOAD_APP=$VITE_HIDE_DOWNLOAD_APP \
    VITE_MAP_INTERACTION_MODE=$VITE_MAP_INTERACTION_MODE

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (ci for reproducible builds)
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build:full

# Stage 2: Runtime
FROM nginx:alpine

# Remove default static content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA: try files, fallback to index.html
RUN echo 'server { \
    listen 3002; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]
