#!/bin/bash
set -e

echo "🔌 Pushing database schema..."
bunx prisma db push

echo "🚀 Starting Identity Service..."
bun run dev
