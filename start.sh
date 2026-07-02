#!/bin/sh

echo "Pushing database schema..."
bunx prisma db push --url "$DATABASE_URL"

echo "Generating Prisma client..."
bunx prisma generate

echo "Starting Identity Service..."
bun --watch ./index.ts