import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { config } from "./config";
import { connectDatabase } from "./database/connection";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { seedUsers } from "./seeders/userSeeder";

// Import routes
import authRoutes from "./routes/auth";
import visitorRoutes from "./routes/visitors";

const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// CORS
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use("/api/", limiter);

// Logging
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving (for uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "SVMS API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorRoutes);

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "School Visiting Management System API",
    version: "1.0.0",
    description: "RESTful API for managing school visitors",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "Login user",
        "GET /api/auth/me": "Get current user profile",
        "POST /api/auth/refresh": "Refresh access token",
        "PUT /api/auth/change-password": "Change password",
      },
      visitors: {
        "POST /api/visitors": "Create new visitor entry",
        "GET /api/visitors": "Get all visitors (with pagination)",
        "GET /api/visitors/:id": "Get visitor by ID",
        "PUT /api/visitors/:id/approve": "Approve visitor",
        "PUT /api/visitors/:id/checkin": "Check in visitor",
        "PUT /api/visitors/:id/checkout": "Check out visitor",
        "PUT /api/visitors/:id/blacklist": "Blacklist visitor",
      },
    },
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Seed test users in development
    if (config.nodeEnv === "development") {
      await seedUsers();
    }

    // Create uploads directory if it doesn't exist
    const fs = await import("fs/promises");
    await fs.mkdir(path.join(__dirname, "../uploads/badges"), {
      recursive: true,
    });
    await fs.mkdir(path.join(__dirname, "../uploads/qrcodes"), {
      recursive: true,
    });
    await fs.mkdir(path.join(__dirname, "../uploads/documents"), {
      recursive: true,
    });
    await fs.mkdir(path.join(__dirname, "../uploads/photos"), {
      recursive: true,
    });
    await fs.mkdir(path.join(__dirname, "../logs"), { recursive: true });

    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`🚀 SVMS API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 API documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer();

export default app;
