#!/bin/bash
set -e

echo "🔌 Pushing database schema..."
# When standalone, you will run prisma directly here, e.g.:
# bunx prisma db push
# For now, if you haven't moved prisma, this command might fail in standalone mode
bunx prisma db push || echo "Prisma not found in standalone mode yet"

echo "🚀 Starting Identity Service..."
bun run dev
