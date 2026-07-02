FROM oven/bun:latest

WORKDIR /app

# Copy the standalone service files
COPY . .

# Install dependencies (will fail if still referencing @repo/database without it being published)
RUN bun install

RUN chmod +x ./start.sh

EXPOSE 4000

CMD ["./start.sh"]