# Backend Usage Guide

This guide provides comprehensive instructions for working with the backend codebase, including development workflow, API usage, and best practices for extending functionality.

## Backend Overview

The backend is a Node.js/Express application written in TypeScript, using PostgreSQL with Prisma ORM for data persistence. It implements a comprehensive API for a recruitment and applicant tracking system with role-based access control.

### Key Features

- **RESTful API**: Well-organized endpoints for all major resources
- **Authentication**: JWT-based authentication with token refresh
- **Role-Based Access Control**: Comprehensive permission system
- **Database Integration**: PostgreSQL with Prisma ORM
- **File Handling**: Resume upload and processing
- **Error Handling**: Standardized error responses
- **Logging**: Comprehensive logging with Winston

## Development Workflow

### 1. Starting the Backend Server

To start the backend server in development mode:

```bash
cd backend
npm run dev
```

This will start the server with hot-reloading enabled, so changes to the code will automatically restart the server.

### 2. API Testing

You can test the API endpoints using tools like Postman, Insomnia, or curl. The API is available at:

```
http://localhost:3001/api
```

For example, to test the health check endpoint:

```bash
curl http://localhost:3001/api/health
```

### 3. Database Management

The backend uses Prisma ORM for database management. Here are some common commands:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration_name>

# Reset database (caution: this will delete all data)
npx prisma migrate reset

# Seed database with initial data
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

## API Structure

The API follows a RESTful structure with the following main endpoints:

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh-token` - Refresh JWT token

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Jobs

- `POST /api/jobs` - Create a new job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications

- `POST /api/applications/apply` - Submit job application
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `PUT /api/applications/:id/status` - Update application status

### Interviews

- `POST /api/interviews` - Schedule interview
- `GET /api/interviews` - Get all interviews
- `GET /api/interviews/:id` - Get interview by ID
- `PUT /api/interviews/:id` - Update interview
- `POST /api/interviews/:id/feedback` - Submit interview feedback

### Locations and Departments

- `POST /api/locations` - Create location
- `GET /api/locations` - Get all locations
- `POST /api/departments` - Create department
- `GET /api/departments` - Get all departments

## Authentication and Authorization

### JWT Authentication

The backend uses JWT (JSON Web Tokens) for authentication. When a user logs in, they receive a token that must be included in subsequent requests:

```
Authorization: Bearer <token>
```

### Role-Based Access Control

The system implements role-based access control with the following roles:

- **CEO**: Complete system access
- **Branch Manager**: Location-specific administrative access
- **Marketing Head**: Department-specific administrative access
- **Marketing Supervisor**: Team management access
- **Marketing Recruiter**: Candidate management access
- **Marketing Associate**: Limited access to assigned tasks
- **Candidate**: Access to own applications and public job listings

Permissions are enforced through middleware that checks the user's role and custom permissions.

## Extending the Backend

### Adding a New API Endpoint

To add a new API endpoint:

1. Create a controller function in the appropriate controller file:

```typescript
// src/controllers/exampleController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getExampleData = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.example.findMany();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
};
```

2. Add a route in the appropriate route file:

```typescript
// src/routes/exampleRoutes.ts
import express from 'express';
import { getExampleData } from '../controllers/exampleController';
import { authenticate } from '../middleware/authMiddleware';
import { checkPermission } from '../middleware/rbacMiddleware';

const router = express.Router();

router.get('/', authenticate, checkPermission('example.view'), getExampleData);

export default router;
```

3. Register the route in the main router:

```typescript
// src/routes/index.ts
import exampleRoutes from './exampleRoutes';

// Add this line with the other routes
router.use('/example', exampleRoutes);
```

### Adding a New Database Model

To add a new database model:

1. Update the Prisma schema in `prisma/schema.prisma`:

```prisma
model Example {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("examples")
}
```

2. Create a migration:

```bash
npx prisma migrate dev --name add_example_model
```

3. Update the Prisma client:

```bash
npx prisma generate
```

## Error Handling

The backend implements standardized error handling through middleware. All API responses follow a consistent format:

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "message": "Error message",
  "errors": [ ... ]  // Optional array of validation errors
}
```

## Logging

The backend uses Winston for logging. Logs are written to the console in development mode and to files in production mode. You can customize the logging configuration in `src/utils/logger.ts`.

## Production Deployment

For production deployment:

1. Build the TypeScript code:

```bash
npm run build
```

2. Set environment variables for production:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=your_production_database_url
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

3. Start the production server:

```bash
npm start
```

## Best Practices

1. **Use TypeScript Types**: Always define proper types for request and response data.
2. **Validate Input**: Use middleware to validate request data before processing.
3. **Handle Errors**: Catch and handle all potential errors properly.
4. **Use Transactions**: Use database transactions for operations that modify multiple records.
5. **Follow RESTful Conventions**: Use appropriate HTTP methods and status codes.
6. **Document API Changes**: Update API documentation when adding or modifying endpoints.
7. **Write Tests**: Add tests for new functionality to ensure it works as expected.
