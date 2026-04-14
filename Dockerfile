# Use Node.js 20 LTS as base image
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client
FROM deps AS prisma
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npx prisma generate

# Build application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma /app/prisma ./prisma/
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma/
COPY package.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# Set environment
ENV NODE_ENV=production

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]
