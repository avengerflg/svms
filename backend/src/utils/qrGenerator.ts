import crypto from "crypto";
import QRCode from "qrcode";
import { createCanvas } from "canvas";
import path from "path";
import fs from "fs/promises";

export const generateQRCode = async (): Promise<string> => {
  // Generate unique QR code data
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString("hex");
  const qrData = `SVMS-${timestamp}-${randomString}`;

  return qrData;
};

export const generateQRCodeImage = async (data: string): Promise<string> => {
  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Convert data URL to buffer and save as file
    const base64Data = qrCodeDataURL.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `qr-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}.png`;
    const filePath = path.join("uploads", "qrcodes", fileName);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Save file
    await fs.writeFile(filePath, buffer);

    return filePath;
  } catch (error) {
    console.error("Error generating QR code image:", error);
    throw new Error("Failed to generate QR code image");
  }
};

export const generateVisitorBadge = async (visitor: any): Promise<string> => {
  try {
    // Create canvas for visitor badge
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 600);

    // Header
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(0, 0, 400, 80);

    // Header text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("VISITOR BADGE", 200, 35);
    ctx.font = "16px Arial";
    ctx.fillText("School Visiting Management System", 200, 60);

    // Visitor info section
    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Name:", 30, 120);
    ctx.font = "18px Arial";
    ctx.fillText(`${visitor.firstName} ${visitor.lastName}`, 30, 145);

    ctx.font = "bold 16px Arial";
    ctx.fillText("Purpose:", 30, 180);
    ctx.font = "14px Arial";
    ctx.fillText(visitor.purposeOfVisit, 30, 200);

    ctx.font = "bold 16px Arial";
    ctx.fillText("Date:", 30, 235);
    ctx.font = "14px Arial";
    ctx.fillText(new Date().toLocaleDateString(), 30, 255);

    ctx.font = "bold 16px Arial";
    ctx.fillText("Time:", 30, 290);
    ctx.font = "14px Arial";
    ctx.fillText(new Date().toLocaleTimeString(), 30, 310);

    // Generate QR code for the badge
    const qrCodeDataURL = await QRCode.toDataURL(visitor.qrCode, {
      width: 150,
      margin: 1,
    });

    // Load QR code image (this is a simplified version - in real implementation, you'd use image loading)
    ctx.font = "bold 16px Arial";
    ctx.fillText("QR Code:", 30, 360);

    // QR code placeholder (in real implementation, you'd draw the actual QR code image)
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(30, 370, 150, 150);
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("QR CODE", 105, 450);
    ctx.fillText(visitor.qrCode.substring(0, 20), 105, 470);

    // Instructions
    ctx.textAlign = "left";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Instructions:", 30, 550);
    ctx.font = "12px Arial";
    ctx.fillText("• Wear this badge visibly at all times", 30, 570);
    ctx.fillText("• Return badge when leaving", 30, 585);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png");

    const fileName = `badge-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}.png`;
    const filePath = path.join("uploads", "badges", fileName);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Save file
    await fs.writeFile(filePath, buffer);

    return filePath;
  } catch (error) {
    console.error("Error generating visitor badge:", error);
    throw new Error("Failed to generate visitor badge");
  }
};
