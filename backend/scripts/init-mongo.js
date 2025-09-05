// MongoDB initialization script
// This script creates the application user and database

print('Starting MongoDB initialization...');

// Switch to admin database
db = db.getSiblingDB('admin');

// Create application database
db = db.getSiblingDB('svms_production');

// Create application user
db.createUser({
  user: 'svms_user',
  pwd: 'svms_password_change_this',
  roles: [
    {
      role: 'readWrite',
      db: 'svms_production'
    }
  ]
});

// Create collections
db.createCollection('users');
db.createCollection('visitors');
db.createCollection('schools');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.visitors.createIndex({ qrCode: 1 }, { unique: true });
db.visitors.createIndex({ email: 1 });
db.visitors.createIndex({ phone: 1 });
db.schools.createIndex({ code: 1 }, { unique: true });

print('MongoDB initialization completed successfully!');
