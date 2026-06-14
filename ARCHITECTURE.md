# Identity Service

A production-ready authentication service built with Fastify, TypeScript, and Zod for OTP-based email authentication.

## Architecture

### Directory Structure

```
src/
├── config/              # Configuration and environment variables
│   └── env.ts          # Environment configuration
├── constants/          # Application constants
│   └── auth.ts         # Auth-related constants and messages
├── controllers/        # Request handlers and route logic
│   └── authController.ts
├── services/           # Business logic and core functionality
│   └── authService.ts  # OTP generation and verification
├── types/              # TypeScript type definitions
│   └── auth.ts         # Auth-related types
├── utils/              # Utility functions
│   ├── otp.ts          # OTP generation and validation
│   └── email.ts        # Email sending functionality
├── middleware/         # Custom middleware (for future use)
├── routes/             # Route definitions
│   ├── index.ts        # Main router
│   └── authRoutes.ts   # Auth routes
├── app.ts             # App initialization and setup
└── controllers/        # Request handlers
```

## Features

✅ **OTP-Based Authentication** - 6-digit OTP via email
✅ **Email Integration** - Nodemailer support with Ethereal (dev) and SMTP (prod)
✅ **Type Safety** - Full TypeScript with Zod validation
✅ **Error Handling** - Comprehensive error messages and codes
✅ **Security** - OTP expiry, attempt tracking, workflow IDs
✅ **Development Mode** - OTP logged to console for testing
✅ **Health Check** - Built-in health endpoint
✅ **CORS Support** - Configurable CORS origins

## API Endpoints

### Health Check

**GET** `/health`

Response:

```json
{
  "status": "healthy",
  "timestamp": "2026-05-14T10:30:00.000Z",
  "service": "identity-service"
}
```

### Start Authentication

**POST** `/api/auth/start`

Request body:

```json
{
  "email": "user@example.com"
}
```

Response (Success):

```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "workflowId": "abc123def456ghi789jkl012"
}
```

Response (Error):

```json
{
  "success": false,
  "message": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

### Verify OTP

**POST** `/api/auth/verify`

Request body:

```json
{
  "email": "user@example.com",
  "phoneNumber": "+1234567890",
  "otp": "123456",
  "workflowId": "abc123def456ghi789jkl012"
}
```

Response (Success):

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "workflowId": "abc123def456ghi789jkl012"
  }
}
```

Response (Error):

```json
{
  "success": false,
  "message": "Invalid OTP provided",
  "code": "INVALID_OTP"
}
```

## Error Codes

| Code                    | Message                       | HTTP Status |
| ----------------------- | ----------------------------- | ----------- |
| `INVALID_EMAIL`         | Invalid email format          | 400         |
| `INVALID_OTP`           | Invalid OTP provided          | 400         |
| `OTP_EXPIRED`           | OTP has expired               | 400         |
| `MAX_ATTEMPTS_EXCEEDED` | Maximum OTP attempts exceeded | 400         |
| `WORKFLOW_NOT_FOUND`    | Workflow not found            | 400         |
| `EMAIL_SEND_FAILED`     | Failed to send email          | 400         |
| `INVALID_PHONE`         | Invalid phone number format   | 400         |
| `INTERNAL_ERROR`        | Internal server error         | 500         |

## Configuration

### Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development
API_PREFIX=/api

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Email (Production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@parking.com

# Email (Development - Ethereal)
ETHEREAL_USER=test@ethereal.email
ETHEREAL_PASS=test-password
```

## Running the Service

### Development

```bash
cd services/identity-service
bun run dev
```

The service will start on `http://localhost:3000`

### Production

```bash
NODE_ENV=production bun ./index.ts
```

## Testing with Postman

### 1. Start Authentication

- **Method**: POST
- **URL**: `http://localhost:3000/api/auth/start`
- **Body** (JSON):

```json
{
  "email": "test@example.com"
}
```

### 2. Verify OTP

- **Method**: POST
- **URL**: `http://localhost:3000/api/auth/verify`
- **Body** (JSON):

```json
{
  "email": "test@example.com",
  "phoneNumber": "+1234567890",
  "otp": "123456",
  "workflowId": "from-start-auth-response"
}
```

**Note**: In development mode, the OTP is logged to console.

## Security Considerations

### Current Implementation

- ✅ OTP expires after 10 minutes
- ✅ Maximum 3 verification attempts per OTP
- ✅ Unique workflow IDs for each authentication flow
- ✅ Email validation
- ✅ Phone number validation

### Future Improvements

- 🔜 Rate limiting
- 🔜 IP-based rate limiting
- 🔜 Database persistence for OTP sessions
- 🔜 JWT token generation after verification
- 🔜 Session management
- 🔜 Audit logging

## Database Integration

Currently, OTP sessions are stored in-memory. To scale to production:

1. Create a migration in `@repo/database` for `otp_sessions` table
2. Update `authService.ts` to use the database client
3. Replace `otpSessions` Map with database queries

## Future Enhancements

- [ ] Database persistence
- [ ] JWT token generation
- [ ] Session management
- [ ] Multi-factor authentication
- [ ] SMS OTP support
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Password-based authentication
- [ ] Social authentication
- [ ] Two-factor authentication
