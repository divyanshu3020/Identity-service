export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: (
    process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001"
  ).split(","),
  apiPrefix: process.env.API_PREFIX || "/api",

  // Email configuration
  emailFrom: process.env.EMAIL_FROM || "noreply@parking.com",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,

  // Development
  isDevelopment: process.env.NODE_ENV !== "production",
};
