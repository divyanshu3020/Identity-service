# 🛠️ Useful Commands Reference

Here are some helpful commands you can use when working with the Identity Service:

## Docker Commands

### Start the Service
```bash
# Start the database and service in the background
docker-compose up -d

# Start and force a rebuild of the image (useful if you changed code)
docker-compose up -d --build
```

### Check Status & Logs
```bash
# See which containers are running
docker-compose ps

# View all logs continuously
docker-compose logs -f

# View logs for the identity service only
docker logs identity-service-identity-service-1 -f

# View logs for the database only
docker logs identity-service-identity-postgres-1 -f
```

### Stop the Service
```bash
# Stop the containers without removing them
docker-compose stop

# Stop and remove the containers, networks, and volumes (Fresh start)
docker-compose down -v
```

## Useful Shell Commands (Troubleshooting)

### Fix Line Endings (Windows -> Linux)
If you are developing on Windows and the Docker container fails to start with a `/usr/local/bin/docker-entrypoint.sh: exec: ./start.sh: not found` error, it means your line endings are wrong. Run this to fix `start.sh`:
```bash
bun -e "const fs = require('fs'); fs.writeFileSync('start.sh', fs.readFileSync('start.sh', 'utf8').replace(/\r\n/g, '\n'));"
```

## API Testing (cURL)

### Health Check
```bash
curl http://localhost:4000/health
```

### Send OTP
```bash
curl -X POST http://localhost:4000/api/auth/start \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:4000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "1234567890", "otp": "123456", "email": "user@example.com"}'
```
