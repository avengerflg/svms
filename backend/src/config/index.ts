import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/svms",
  },

  // JWT
  jwt: {
    secret: (process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production") as string,
    expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as string | number,
    refreshSecret: (process.env.JWT_REFRESH_SECRET ||
      "your-refresh-secret-change-in-production") as string,
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as
      | string
      | number,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },

  // File Upload
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
    destinationPath: process.env.UPLOAD_PATH || "uploads/",
  },

  // Email (for notifications)
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || "noreply@svms.com",
  },

  // SMS (for notifications)
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};
