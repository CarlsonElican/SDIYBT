# syntax=docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# App directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# ---- Build stage ----
FROM base AS build

# System deps for native builds (only if you need them)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential node-gyp pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Install deps (use only package files for better caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

# If you build assets (e.g., TypeScript/Vite), do it here:
# RUN npm run build

# ---- Runtime image ----
FROM base

# Copy app (and node_modules from build stage)
COPY --from=build /app /app

# Expose your port
EXPOSE 3000

# Start the server (adjust script as needed)
CMD ["npm", "run", "start"]
