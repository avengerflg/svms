import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";
import { SchoolModel } from "../models/School";
import { UserRole } from "../types";

const testUsers = [
  {
    email: "admin@school.com",
    password: "admin123",
    firstName: "Super",
    lastName: "Admin",
    role: UserRole.SUPER_ADMIN,
  },
  {
    email: "schooladmin@school.com",
    password: "schooladmin123",
    firstName: "School",
    lastName: "Administrator",
    role: UserRole.SCHOOL_ADMIN,
  },
  {
    email: "security@school.com",
    password: "security123",
    firstName: "Security",
    lastName: "Guard",
    role: UserRole.SECURITY_GUARD,
  },
  {
    email: "frontdesk@school.com",
    password: "frontdesk123",
    firstName: "Front",
    lastName: "Desk",
    role: UserRole.FRONT_DESK,
  },
  {
    email: "teacher@school.com",
    password: "teacher123",
    firstName: "John",
    lastName: "Teacher",
    role: UserRole.TEACHER,
  },
  {
    email: "staff@school.com",
    password: "staff123",
    firstName: "Jane",
    lastName: "Staff",
    role: UserRole.STAFF,
  },
];

export const seedUsers = async (): Promise<void> => {
  try {
    console.log("🌱 Starting user seeding...");

    // Create a test school first
    let school = await SchoolModel.findOne({ email: "demo@school.com" });
    if (!school) {
      school = await SchoolModel.create({
        name: "Demo School",
        address: "123 Demo Street, Demo City, DC 12345",
        phone: "+1-555-0123",
        email: "demo@school.com",
        principalName: "Dr. Demo Principal",
        settings: {
          allowPreRegistration: true,
          requirePhotoUpload: true,
          requireIdProofUpload: true,
          autoCheckoutHours: 8,
          qrCodeExpirationMinutes: 60,
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
          },
          securitySettings: {
            maxVisitorsPerDay: 100,
            blacklistEnabled: true,
            photoRequired: true,
            idProofRequired: true,
          },
        },
        isActive: true,
      });
      console.log("✅ Demo school created");
    }

    // Check if users already exist
    const existingUserCount = await UserModel.countDocuments({
      email: { $in: testUsers.map((user) => user.email) },
    });

    if (existingUserCount > 0) {
      console.log("⚠️  Test users already exist, skipping seeding");
      return;
    }

    // Create test users
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const user = await UserModel.create({
        ...userData,
        password: hashedPassword,
        schoolId:
          userData.role !== UserRole.SUPER_ADMIN ? school._id : undefined,
        isActive: true,
      });

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    console.log("🎉 User seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
};
