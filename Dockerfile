# docker run -e PORT=4000 -e NODE_ENV=production -e SMTP_HOST=smtp.example.com your-image
# syntax=docker/dockerfile:1

ARG BUN_VERSION=alpine
FROM oven/bun:${BUN_VERSION} AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package.json tsconfig.json ./

# Copy application sources
COPY index.ts ./
COPY src ./src

# Install ALL dependencies (including devDependencies needed for the build step)
RUN bun install --ignore-scripts

# Build the service into an optimized output
RUN bun build ./index.ts --target=bun --outdir=./dist

# Runtime stage
FROM oven/bun:${BUN_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy application manifest and the compiled dist folder
COPY package.json ./
COPY --from=builder /app/dist ./dist

# Install ONLY production dependencies at runtime
RUN bun install --production --ignore-scripts

EXPOSE 4000

CMD ["bun", "./dist/index.js"]