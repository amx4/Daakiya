# 1. Base Image: Use a specific Node.js version for consistency
FROM node:20-alpine AS base

# 2. Set Working Directory
WORKDIR /app

# 3. Install pnpm for efficient package management
RUN npm install -g pnpm

# 4. Dependencies Stage: Install dependencies first to leverage Docker layer caching
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 5. Build Stage: Copy source code and build the application
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 6. Runner Stage: Create the final, small production image
FROM base AS runner
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy standalone output from the builder stage
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port Next.js runs on
EXPOSE 3000

# The command to start the application
CMD ["node", "server.js"]
