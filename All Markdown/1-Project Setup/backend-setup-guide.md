# Backend Setup and Configuration Guide

This guide provides detailed instructions for setting up and configuring the backend server, including database setup, environment configuration, and running the server.

## 1. Backend Directory Structure

The backend is already properly organized in the `backend` folder at the root level of your project with the following structure:

```
backend/
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Seed data
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Middleware functions
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── index.ts          # Entry point
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

You can verify this structure by running:

```bash
ls -la backend
```

## 2. Database Setup

### 2.1 Install PostgreSQL

If you haven't already installed PostgreSQL, follow these steps:

#### macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### Windows:
1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Follow the installation wizard
3. Remember the password you set for the postgres user

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.2 Create a Database

Create a new PostgreSQL database for the application:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create a new database
CREATE DATABASE talent_spark;

# Exit psql
\q
```

### 2.3 Configure Database Connection

Create or update the `.env` file in the backend directory with your database connection string:

```
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/talent_spark?schema=public"
```

Replace `your_password` with your PostgreSQL password.

## 3. Backend Environment Configuration

### 3.1 Create Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/talent_spark?schema=public"

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
ACCESS_TOKEN_EXPIRY=24h

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=uploads

# Logging Configuration
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

### 3.2 Update CORS Configuration

Ensure the CORS configuration in `src/index.ts` allows requests from your frontend:

```typescript
// src/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
```

## 4. Database Schema and Migrations

### 4.1 Review the Prisma Schema

The Prisma schema (`prisma/schema.prisma`) defines your database structure. Review it to ensure it matches your application needs:

```prisma
// This is your Prisma schema file
// Learn more about it here: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model with role-based access control
model User {
  id                Int                 @id @default(autoincrement())
  email             String              @unique
  password          String
  firstName         String
  lastName          String
  role              Role                @default(CANDIDATE)
  phone             String?
  avatarUrl         String?
  customPermissions String[]
  isActive          Boolean             @default(true)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  department        Department?         @relation("DepartmentMembers", fields: [departmentId], references: [id])
  departmentId      Int?
  location          Location?           @relation(fields: [locationId], references: [id])
  locationId        Int?

  // Relations
  managedDepartments   Department[]         @relation("DepartmentManager")
  jobs                 Job[]                @relation("JobHiringManager")
  applications         Application[]        @relation("CandidateApplications")
  interviews           Interview[]          @relation("UserInterviews")
  interviewFeedbacks   InterviewFeedback[]  @relation("FeedbackInterviewer")
  budgets              Budget[]             @relation("BudgetCreator")
  budgetAllocations    BudgetAllocation[]   @relation("BudgetRequester")
  approvedAllocations  BudgetAllocation[]   @relation("BudgetApprover")
  notificationSettings NotificationSettings?
  receivedNotifications Notification[]      @relation("NotificationRecipient")

  @@map("users")
}

enum Role {
  CEO
  BRANCH_MANAGER
  MARKETING_HEAD
  MARKETING_SUPERVISOR
  MARKETING_RECRUITER
  MARKETING_ASSOCIATE
  CANDIDATE
}

// Other models...
```

### 4.2 Generate Prisma Client

Generate the Prisma client based on your schema:

```bash
cd backend
npx prisma generate
```

### 4.3 Run Database Migrations

Create and apply database migrations:

```bash
cd backend
npx prisma migrate dev --name init
```

### 4.4 Seed the Database

Seed the database with initial data:

```bash
cd backend
npx prisma db seed
```

## 5. Install Dependencies

Install the required dependencies:

```bash
cd backend
npm install
```

## 6. Start the Backend Server

Start the backend server in development mode:

```bash
cd backend
npm run dev
```

The server should now be running at http://localhost:3001.

## 7. Verify API Endpoints

Test the API endpoints to ensure they're working correctly:

### 7.1 Health Check

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2023-06-01T12:00:00.000Z",
  "environment": "development"
}
```

### 7.2 Authentication

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "MARKETING_RECRUITER"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

## 8. Troubleshooting Common Issues

### 8.1 Database Connection Issues

If you encounter database connection issues:

1. Verify that PostgreSQL is running:
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services in Task Manager
```

2. Check your database connection string in the `.env` file.

3. Ensure the database exists:
```bash
psql -U postgres -c "\l" | grep talent_spark
```

### 8.2 Prisma Migration Issues

If you encounter issues with Prisma migrations:

1. Reset the database (warning: this will delete all data):
```bash
npx prisma migrate reset
```

2. Check for syntax errors in your schema.prisma file.

3. Ensure you're running the commands from the backend directory.

### 8.3 Server Startup Issues

If the server fails to start:

1. Check for errors in the console output.

2. Verify that the required environment variables are set.

3. Ensure the port is not already in use:
```bash
# Check if port 3001 is in use
lsof -i :3001
```

4. Check for TypeScript compilation errors:
```bash
npm run build
```

## 9. Backend Development Workflow

### 9.1 Making Schema Changes

When you need to update the database schema:

1. Modify the `prisma/schema.prisma` file.
2. Create a new migration:
```bash
npx prisma migrate dev --name your_migration_name
```
3. Update any affected controllers or services.

### 9.2 Adding New API Endpoints

When adding new API endpoints:

1. Create or update controller functions in `src/controllers/`.
2. Add routes in `src/routes/`.
3. Update the main router in `src/routes/index.ts`.
4. Test the new endpoints.

### 9.3 Implementing Authentication and Authorization

When implementing authentication and authorization:

1. Use the `authenticate` middleware for protected routes.
2. Use the `checkPermission` middleware to enforce role-based access control.
3. Test with different user roles to ensure proper access control.

## 10. Production Considerations

### 10.1 Environment Configuration

For production deployment:

1. Set `NODE_ENV=production` in your environment variables.
2. Use a strong, unique `JWT_SECRET`.
3. Configure a production database connection.
4. Set appropriate CORS origins.

### 10.2 Security Measures

Implement these security measures:

1. Enable HTTPS in production.
2. Set secure and HTTP-only cookies.
3. Implement rate limiting for sensitive endpoints.
4. Configure proper logging (avoid sensitive data).
5. Regularly update dependencies.

### 10.3 Performance Optimization

Optimize performance with:

1. Database indexing for frequently queried fields.
2. Response compression.
3. Caching for expensive operations.
4. Connection pooling for database connections.

## 11. Next Steps

After setting up the backend:

1. Test all API endpoints thoroughly.
2. Document the API for frontend developers.
3. Implement monitoring and error tracking.
4. Set up automated testing.
5. Configure CI/CD pipelines.
