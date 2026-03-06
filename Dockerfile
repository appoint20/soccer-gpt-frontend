# ── Stage 1: Build the Expo Web app ────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build args become env vars during the build step
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_SOCCER_API_KEY
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_SOCCER_API_KEY=$EXPO_PUBLIC_SOCCER_API_KEY

RUN npx expo export -p web

# ── Stage 2: Serve with nginx ─────────────────────────────────────────────────
FROM nginx:alpine

# Cloud Run injects PORT (default 8080). Replace nginx default port.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
