# Identity Service (Open-Source Email OTP Service)

A highly secure, incredibly fast, and lightweight Email OTP (One-Time Password) identity service. Built with Fastify, Bun, and Prisma, this service is designed to be easily integrated into any new or existing project by developers. 

It handles the heavy lifting of:
- Sending OTP emails
- Tracking OTP expiration and maximum attempts (3 times)
- Securing endpoints via API Key authentication
- Protecting against brute-force and DDoS via strict Rate Limiting
- Emitting standard security headers using Helmet

---

## 🚀 Getting Started (A to Z Setup)

### 1. Prerequisites
- **Bun**: Make sure you have [Bun](https://bun.sh/) installed.
- **PostgreSQL**: A running PostgreSQL database.

### 2. Installation

Clone the repository and install dependencies:

```bash
bun install
```

### 3. Environment Variables

Create a `.env` file in the root of the project (or copy from `.env.example` if it exists) and fill it out. Here is what is required:

```env
# Server configuration
PORT=4000
NODE_ENV=development
API_PREFIX=/api
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Database Configuration (Make sure this exists in the root or @repo/database)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb?schema=public

# Email sender address
EMAIL_FROM=noreply@parking.com

# SMTP settings
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### 4. Database Setup

Push the database schema to create the required tables (`User`, `OTPSession`, `ApiKey`):

```bash
cd packages/database
bunx prisma db push
bunx prisma generate
```

### 5. Start the Server

```bash
# From the identity-service directory
bun run dev
```

---

## 🔑 Generating your first API Key

Before any external app can use the OTP endpoints, you need an API key. This prevents random people on the internet from abusing your SMTP server as a spam relay.

To generate a key, make a POST request to the admin endpoint (usually done via cURL or Postman when setting up):

**Request:**
```bash
curl -X POST http://localhost:4000/api/admin/keys/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "My Main Web App"}'
```

**Response:**
```json
{
  "success": true,
  "message": "API Key generated successfully. Please save this key now as it cannot be retrieved again.",
  "data": {
    "id": "cuid_xxxx",
    "name": "My Main Web App",
    "apiKey": "sk_your_base64_secret_key"
  }
}
```

> **⚠️ CRITICAL:** Save the `apiKey` string! It is only shown once. It is hashed in the database and cannot be recovered if lost.

---

## 📚 API Reference

All requests to the `/auth/*` endpoints **MUST** include your API Key in the headers.

**Required Header:**
`x-api-key: <your-api-key>`

### 1. Request OTP (Start Auth)

Sends a 6-digit OTP to the user's email address. 

- **Endpoint:** `POST /api/auth/start`
- **Rate Limit:** Max 3 requests per 5 minutes per IP address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully. Check your email.",
  "workflowId": "wf_xxxxx"
}
```

**Error Response (400 Bad Request - Active Session Exists):**
```json
{
  "success": false,
  "message": "Active OTP session already exists for this email. Please wait before requesting a new OTP.",
  "code": "ACTIVE_SESSION_EXISTS"
}
```

### 2. Verify OTP

Verifies the 6-digit OTP. The user has a maximum of 3 attempts before the workflow ID is permanently invalidated.

- **Endpoint:** `POST /api/auth/verify`
- **Rate Limit:** Max 30 requests per 1 minute per IP address.

**Request Body:**
```json
{
  "phoneNumber": "1234567890",
  "otp": "123456",
  "workflowId": "wf_xxxxx"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "email": "user@example.com",
    "phoneNumber": "1234567890",
    "workflowId": "wf_xxxxx"
  }
}
```

**Error Response (400 Bad Request - Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid OTP. You have 2 attempt(s) remaining.",
  "code": "INVALID_OTP"
}
```

**Error Response (400 Bad Request - Expired/Not Found):**
```json
{
  "success": false,
  "message": "Invalid workflow ID. The OTP session may have expired or does not exist.",
  "code": "WORKFLOW_NOT_FOUND"
}
```

### 3. Missing/Invalid API Key Errors

If a developer forgets the `x-api-key` header or provides a bad one:

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Missing API Key in headers (x-api-key)",
  "code": "UNAUTHORIZED"
}
```

---

## 🛡️ Security Architecture
- **Helmet:** Automatically drops malicious scripts and prevents clickjacking using standard HTTP headers.
- **Argon2/SHA256:** API Keys are hashed securely via `crypto/sha256` so database leaks do not compromise active sessions.
- **Rate Limiting:** Network-level request dropping via `@fastify/rate-limit` prevents Brute Force and DDoS attacks from ever reaching the Prisma ORM.
