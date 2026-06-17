# Context is the monorepo root
FROM oven/bun:1 AS pruner

WORKDIR /app
COPY . .
# Prune the workspace to only include identity-service and its dependencies
RUN bunx turbo prune @repo/identity-service --docker

FROM oven/bun:1 AS builder

WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/divyanshu3020/parking"

# 1. Copy only the required package.jsons (extracted by turbo prune)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

# 2. Install dependencies (this leverages Docker cache if package.jsons haven't changed)
RUN bun install --frozen-lockfile

# 3. Copy the actual source code (extracted by turbo prune)
COPY --from=pruner /app/out/full/ .

# 4. Generate Prisma client and build service payload
RUN cd packages/database && bun run generate
RUN cd services/identity-service && bun run build

# Final lightweight stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy the monorepo node_modules (which includes installed prisma binaries)
COPY --from=builder /app/node_modules ./node_modules

# Copy the shared database package (contains the generated Prisma client)
COPY --from=builder /app/packages/database ./packages/database

# Copy the built service artifacts
COPY --from=builder /app/services/identity-service/package.json ./services/identity-service/package.json
COPY --from=builder /app/services/identity-service/dist ./services/identity-service/dist

WORKDIR /app/services/identity-service

# Expose standard port for fastify applications
EXPOSE 3000

# Start the built application
CMD ["bun", "run", "./dist/index.js"]