# Identity Service Architecture

A production-ready, plug-and-play authentication microservice built with Fastify, Bun, and Prisma for OTP-based email authentication.

## 🏗️ Core Architecture

This service is built as a **Standalone Microservice**. It is fully decoupled from any monorepo structure, meaning it manages its own database schema, its own dependencies, and its own execution environment.

### 1. The Database Layer (Prisma)
Unlike traditional monorepo setups that share a single database package, this service embraces the **Database-per-Service** pattern.
- It contains its own `prisma/schema.prisma`.
- When the Docker container starts, it automatically pushes its schema to the database using `bunx prisma db push`.
- OTP Sessions and Users are persisted directly to this dedicated database, not in-memory.

### 2. The API Layer (Fastify + Bun)
- **Fastify**: Chosen for its incredible speed and low overhead.
- **Bun**: Used as the JavaScript runtime for its fast startup times and built-in SQLite/fetch/testing capabilities.
- **Zod**: Used for strict runtime schema validation of all incoming requests.

### 3. The Security Layer
- **No API Keys Internally**: The service is intentionally un-opinionated. It assumes it will be deployed behind a secure API Gateway (like Nginx) on a private network (VPC). 
- **Rate Limiting**: Network-level request dropping via `@fastify/rate-limit` (Max 100 requests / 5 mins for generating OTPs, Max 30 requests / 1 min for verifying).
- **Helmet**: Secures HTTP headers to prevent XSS, clickjacking, and other injection attacks.

## 📁 Directory Structure

```
src/
├── config/              # Configuration (env vars, db singleton)
│   ├── env.ts          
│   └── db.ts           # Prisma client singleton
├── constants/          # Application constants
│   └── auth.ts         
├── controllers/        # Request handlers (authController.ts)
├── routes/             # Fastify route definitions (index.ts, authRoutes.ts)
├── services/           # Core business logic (authService.ts)
├── utils/              # Utilities (otp.ts, email.ts)
└── app.ts              # Fastify app initialization
```

## 🚀 Deployment Strategy (Docker)

The service is fully containerized using `docker-compose`.

1. **`identity-postgres`**: A dedicated PostgreSQL 15 container mapped to port `5433` (to avoid conflicts with standard local Postgres databases).
2. **`identity-service`**: The Node/Bun container running the Fastify app. It uses `depends_on` with a `service_healthy` check to ensure the database is fully ready before it attempts to start.

Upon starting, `start.sh` executes the database migrations before booting the web server.

## ✅ Current Capabilities
- **Database Persistence**: OTPs are securely stored in PostgreSQL.
- **Ethereal Email**: Zero-config auto-generated test email accounts for local development.
- **Security**: Rate limiting and Helmet are fully implemented.
- **Standalone Runtime**: Runs completely independent of turborepo.

## 🔜 Future Enhancements
- JWT Token issuance upon successful OTP verification
- Multi-factor authentication foundations
- Session management / Revocation
