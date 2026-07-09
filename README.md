# Identity Service (Open-Source Email OTP Service)

A highly secure, incredibly fast, and lightweight Email OTP (One-Time Password) identity service. Built with Fastify, Bun, and Prisma, this service is designed to be easily integrated into any backend infrastructure as a plug-and-play microservice.

It handles the heavy lifting of:
- Sending OTP emails
- Tracking OTP expiration and maximum attempts (3 times)
- Protecting against brute-force and DDoS via strict Rate Limiting
- Emitting standard security headers using Helmet

*Note: API Key management and overall system authentication is assumed to be handled by your API Gateway (e.g., Nginx, Kong, AWS API Gateway).*

---

## 🚀 Getting Started (Plug-and-Play Setup)

This service is fully containerized and decoupled. You can spin it up instantly using Docker Compose.

### 1. Prerequisites
- **Docker & Docker Compose** installed on your machine.
- 💡 *Tip: Check out [commands.md](file:///e:/coding/parking/services/identity-service/commands.md) for a cheat sheet of useful Docker and shell commands!*

### 2. Installation
Clone this repository and navigate to the `identity-service` folder.
```bash
# Start the database and the identity service
docker-compose up -d --build
```
*That's it!* The `docker-compose` setup will automatically pull a PostgreSQL database, run `prisma db push` to generate the schema, and start the Fastify server.

---

## 📍 Where is it exposed?

The service runs locally on port `4000`. 
- **Internal API Base:** `http://localhost:4000/api`
- **Health Check:** `http://localhost:4000/health`

*Note: The bundled PostgreSQL database is exposed on host port `5433` to prevent conflicts with your existing local databases.*

---

## 🩺 Checking Service Health

To verify that the service is running correctly, you can ping the health check endpoint:

**Command:**
```bash
curl http://localhost:4000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-07-02T12:00:00.000Z",
  "service": "identity-service"
}
```

---

## 📚 API Reference

### 1. Request OTP (Start Auth)

Sends a 6-digit OTP to the user's email address. If no SMTP credentials are provided in `.env`, the system will automatically generate a mock Ethereal test account and print the email preview URL to your console!

- **Endpoint:** `POST /api/auth/start`
- **Rate Limit:** Max 100 requests per 5 minutes per IP address.

**Example Command:**
```bash
curl -X POST http://localhost:4000/api/auth/start \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully. Check your email.",
  "expiresIn": 600
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Active OTP session already exists for this email. Please wait before requesting a new OTP.",
  "code": "ACTIVE_SESSION_EXISTS"
}
```

### 2. Verify OTP

Verifies the 6-digit OTP. The user has a maximum of 3 attempts before the OTP session is permanently invalidated.

- **Endpoint:** `POST /api/auth/verify`
- **Rate Limit:** Max 30 requests per 1 minute per IP address.

**Example Command:**
```bash
curl -X POST http://localhost:4000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "1234567890", "otp": "123456", "email": "user@example.com"}'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "email": "user@example.com",
    "phoneNumber": "1234567890"
  }
}
```

**Error Responses (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid OTP. You have 2 attempt(s) remaining.",
  "code": "INVALID_OTP"
}
```

---

## 🛡️ Security Architecture
- **Helmet:** Automatically drops malicious scripts and prevents clickjacking using standard HTTP headers.
- **Rate Limiting:** Network-level request dropping via `@fastify/rate-limit` prevents Brute Force and DDoS attacks from ever reaching the Prisma ORM.
- **Un-opinionated Gateway Support:** Stripped of internal API Key handling so it can cleanly sit behind your robust API Gateway.
