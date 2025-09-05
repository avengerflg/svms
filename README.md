# School Visiting Management System (SVMS)

A comprehensive web-based solution for managing and monitoring school visitors with enhanced security, digital check-in/out, and administrative controls.

## 🚀 Features

### Core Functionalities

- **Visitor Management**: Pre-registration, on-site registration, and digital visitor tracking
- **Digital Check-In/Out**: QR code-based entry/exit system with timestamps
- **Role-Based Access Control**: Multiple user roles (Admin, Security, Front Desk, Teachers, Staff)
- **Real-Time Dashboard**: Live visitor statistics and monitoring
- **Appointment Scheduling**: Book and manage visitor appointments
- **Security Features**: ID verification, photo capture, blacklisting system
- **Notifications**: SMS/Email alerts for staff and visitors
- **Reports & Analytics**: Comprehensive visitor reports and analytics
- **Multi-School Support**: Centralized management for school networks

### Security & Compliance

- JWT Authentication with refresh tokens
- HTTPS encryption
- Data validation and sanitization
- GDPR & FERPA compliance ready
- Audit logs for all activities

## 🛠 Tech Stack

### Frontend

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management
- **Tanstack Query** for state management
- **Axios** for HTTP requests
- **Headless UI** for accessible components

### Backend

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Express Validator** for input validation
- **Winston** for logging
- **Multer** for file uploads

### Additional Tools

- **QR Code** generation and scanning
- **Canvas** for badge generation
- **Rate limiting** for API protection
- **CORS** for cross-origin requests
- **Helmet** for security headers

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/svms
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-secret
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The backend server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_NAME=School Visiting Management System
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The frontend application will start on `http://localhost:3000`

## 🗂 Project Structure

```
SVMS/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   ├── types/          # TypeScript type definitions
│   │   ├── validators/     # Input validation schemas
│   │   └── database/       # Database connection
│   ├── uploads/            # File upload directory
│   ├── logs/              # Application logs
│   └── package.json
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── common/     # Common components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── forms/      # Form components
│   │   │   └── modals/     # Modal components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── constants/      # Application constants
│   │   └── assets/         # Static assets
│   └── package.json
├── shared/                 # Shared utilities and types
├── docs/                   # Documentation
├── assets/                 # Project assets
└── README.md
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh access token
- `PUT /api/auth/change-password` - Change password

### Visitors

- `POST /api/visitors` - Create new visitor entry
- `GET /api/visitors` - Get all visitors (with pagination)
- `GET /api/visitors/:id` - Get visitor by ID
- `PUT /api/visitors/:id/approve` - Approve visitor
- `PUT /api/visitors/:id/checkin` - Check in visitor
- `PUT /api/visitors/:id/checkout` - Check out visitor
- `PUT /api/visitors/:id/blacklist` - Blacklist visitor

## 👥 User Roles & Permissions

### Super Admin

- Complete system access
- Multi-school management
- Global settings and configuration

### School Admin

- School-specific administrative access
- User management within school
- Reports and analytics
- School settings configuration

### Security Guard

- Visitor check-in/out operations
- QR code scanning
- Security alerts and monitoring

### Front Desk

- Visitor registration and management
- Appointment scheduling
- Basic visitor operations

### Teacher/Staff

- View assigned visitors
- Approve/reject visitor requests
- Basic visitor information access

## 🚀 Development Workflow

### Running in Development Mode

1. **Start MongoDB** (if running locally)

   ```bash
   mongod
   ```

2. **Start Backend** (Terminal 1)

   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```

### Building for Production

1. **Build Backend**

   ```bash
   cd backend
   npm run build
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

## 📱 Key Features Walkthrough

### 1. Visitor Registration

- Online pre-registration portal
- On-site kiosk registration
- ID proof upload and verification
- Photo capture capability

### 2. Approval Workflow

- Teacher/staff approval system
- Automatic notifications
- QR code generation upon approval
- Digital badge creation

### 3. Check-In Process

- QR code scanning
- Photo verification
- Host notification
- Real-time status updates

### 4. Security Features

- Blacklist management
- Overstay alerts
- Emergency panic button
- Comprehensive audit logs

### 5. Reporting

- Daily/weekly/monthly reports
- Visitor analytics and trends
- Export functionality (CSV/PDF)
- Custom report generation

## 🔧 Configuration Options

### School Settings

- Visiting hours configuration
- Working days setup
- Maximum visit duration
- Pre-approval requirements
- Photo capture settings
- Auto check-out options

### Notification Settings

- Email/SMS configuration
- Alert preferences
- Notification templates
- Delivery options

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify database permissions

2. **JWT Token Errors**

   - Check JWT secret configuration
   - Verify token expiration settings
   - Clear browser localStorage

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure proper MIME type configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `docs/` folder

## 🗺 Roadmap

### Phase 1 ✅

- Core visitor management
- Basic authentication
- Dashboard and reporting

### Phase 2 🚀

- Mobile app (iOS & Android)
- Advanced analytics
- Integration APIs

### Phase 3 📋

- Facial recognition
- Biometric authentication
- AI-powered insights
- Advanced security features

---

**Built with ❤️ for modern school security and visitor management**
