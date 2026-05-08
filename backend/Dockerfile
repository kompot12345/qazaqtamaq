# ── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy manifests + Prisma schema first for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all deps (devDeps needed for nest build + tsx)
RUN npm ci

# Generate Prisma client before compiling TypeScript
RUN npx prisma generate

# Copy source and compile
COPY . .
RUN npm run build

# ── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install only production deps and regenerate Prisma client for this platform
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Entrypoint runs migrations then starts the server
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
