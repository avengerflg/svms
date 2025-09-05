import mongoose from "mongoose";
import { config } from "../config";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/database.log" }),
  ],
});

export const connectDatabase = async (): Promise<void> => {
  try {
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(config.mongodb.uri, options);
    logger.info("Database connected successfully");

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      logger.error("Database connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Database disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("Database reconnected");
    });
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("Database disconnected successfully");
  } catch (error) {
    logger.error("Error disconnecting from database:", error);
  }
};
