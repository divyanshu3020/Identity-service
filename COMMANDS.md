# Identity Service - Commands Reference

## Current Commands

### Development
```bash
bun run dev
```
Starts FastAPI development server on PORT 3000 (default). Hot-reloads on file changes.

### Dependencies
```bash
bun install
```
Installs all dependencies from package.json

## Future Commands (To Be Added)

### Build & Production
```bash
bun build ./index.ts
```
Compiles TypeScript for production deployment.

```bash
bun run build
```
(Once build script is added to package.json)

### Testing
```bash
bun test
```
Runs all tests. Add test files with `.test.ts` extension.

```bash
bun run test:watch
```
Runs tests in watch mode (reruns on file changes).

```bash
bun run test:coverage
```
Shows code coverage report for tests.

### Linting & Formatting
```bash
bunx eslint src/
```
Lints TypeScript code for errors and style issues.

```bash
bunx prettier --write src/
```
Formats code to match style standards.

```bash
bun run lint
```
(Once lint script is added to package.json)

### Type Checking
```bash
bun run type-check
```
Checks TypeScript types without building. Useful for catching errors early.

### API Documentation
```bash
bun run docs
```
(Future) Generates API documentation from route schemas.

### Database
```bash
bun run db:migrate
```
(Future) Runs database migrations. Executed before deployment.

```bash
bun run db:seed
```
(Future) Seeds database with test data.

## Environment Variables

Create `.env` or `.env.local` file:
```
PORT=3000
NODE_ENV=development
API_PREFIX=/api
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
EMAIL_FROM=noreply@parking.com
ETHEREAL_USER=your-ethereal-user@ethereal.email
ETHEREAL_PASS=your-ethereal-password
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_SECURE=false
DATABASE_URL=postgresql://user:password@host:5432/parking_db
```

## API Endpoints

### Authentication Routes (`/api/auth`)

**POST /start**
- Starts OTP authentication flow
- Request: `{ email: "user@example.com" }`
- Response: `{ success: true, workflowId: "...", message: "OTP sent" }`

**POST /verify**
- Verifies OTP and completes authentication
- Request: `{ phoneNumber: "+1234567890", otp: "123456", workflowId: "..." }`
- Response: `{ success: true, data: { email, phoneNumber, workflowId } }`

## Project Structure

```
src/
├── app.ts              # Express/Fastify setup
├── config/
│   └── env.ts          # Environment config
├── constants/
│   └── auth.ts         # Auth constants & messages
├── controllers/
│   └── authController.ts
├── middleware/         # Custom middleware
├── routes/
│   ├── authRoutes.ts   # Auth endpoint definitions
│   └── index.ts        # Route registration
├── services/
│   └── authService.ts  # Business logic
├── types/
│   └── auth.ts         # TypeScript types
└── utils/
    ├── email.ts        # Email sending
    └── otp.ts          # OTP generation & validation
```

## Useful Tips

- Use `NODE_ENV=development` for local testing with Ethereal email
- Use `NODE_ENV=production` to use real SMTP credentials
- OTP expires in 10 minutes (configurable in `AUTH_CONSTANTS`)
- Max 3 OTP verification attempts per session
- All errors return structured responses with `code` field for error handling
- Zod schemas validate all request/response data
