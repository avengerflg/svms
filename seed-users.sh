#!/bin/bash

# Seed default users for SVMS
echo "🌱 Seeding SVMS database with default users..."

# Get the MongoDB password from environment
MONGO_PASSWORD=$(grep MONGO_PASSWORD /opt/svms/.env.docker | cut -d'=' -f2)

echo "Connecting to MongoDB..."

# Create the seeding script
cat > /tmp/seed.js << 'EOF'
// Switch to the production database
use svms_production;

// Check if users already exist
const existingUsers = db.users.countDocuments();
if (existingUsers > 0) {
    print(`Database already has ${existingUsers} users. Skipping seeding.`);
    exit();
}

// Create default users
const bcrypt = require('bcryptjs');

// Password: password123
const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

const defaultUsers = [
    {
        _id: ObjectId(),
        email: 'superadmin@school.edu',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        school: null,
        permissions: [
            'MANAGE_SCHOOLS',
            'MANAGE_USERS', 
            'MANAGE_VISITORS',
            'VIEW_REPORTS',
            'MANAGE_SYSTEM'
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        email: 'admin@school.edu',
        password: hashedPassword,
        firstName: 'School',
        lastName: 'Admin',
        role: 'SCHOOL_ADMIN',
        isActive: true,
        school: ObjectId(),
        permissions: [
            'MANAGE_USERS',
            'MANAGE_VISITORS', 
            'VIEW_REPORTS'
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        email: 'security@school.edu',
        password: hashedPassword,
        firstName: 'Security',
        lastName: 'Guard',
        role: 'SECURITY_GUARD',
        isActive: true,
        school: ObjectId(),
        permissions: [
            'CHECKIN_VISITORS',
            'CHECKOUT_VISITORS'
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Insert users
const result = db.users.insertMany(defaultUsers);
print(`✅ Successfully created ${result.insertedIds.length} default users:`);
defaultUsers.forEach(user => {
    print(`   - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
});

print("\n📧 Default Login Credentials:");
print("   Super Admin: superadmin@school.edu / password123");
print("   School Admin: admin@school.edu / password123");
print("   Security Guard: security@school.edu / password123");
EOF

# Run the seeding script
docker-compose exec mongodb mongosh "mongodb://admin:$MONGO_PASSWORD@localhost:27017/svms_production?authSource=admin" /tmp/seed.js

echo "✅ Database seeding completed!"
