# Talent Spark Recruit - API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user profile |
| POST | `/auth/refresh-token` | Refresh JWT token |
| POST | `/auth/change-password` | Change user password |
| POST | `/auth/request-password-reset` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/logout` | Logout (client-side) |

### Authentication Headers

For protected routes, include the JWT token in request headers:

```
Authorization: Bearer <token>
```

## User Management

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users (with filters) |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create a new user |
| PUT | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete/deactivate a user |
| PUT | `/users/profile` | Update own profile |
| POST | `/users/:id/reset-password` | Admin reset password |
| GET | `/users/stats` | Get user statistics |
| PUT | `/users/notification-settings` | Update notification settings |

### Sample Request/Response

**Create User Request**
```json
{
  "email": "recruiter@example.com",
  "password": "Password123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "RECRUITER",
  "departmentId": 1,
  "locationId": 2,
  "phone": "+1234567890",
  "customPermissions": [],
  "isActive": true,
  "sendInvite": true
}
```

**Create User Response**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 5,
    "email": "recruiter@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "RECRUITER",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2023-05-20T14:30:00.000Z",
    "customPermissions": [],
    "department": {
      "id": 1,
      "name": "Engineering"
    },
    "location": {
      "id": 2,
      "name": "New York Office"
    }
  }
}
```

## Job Management

### Job Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/jobs` | Create a new job |
| GET | `/jobs` | Get all jobs (with filters) |
| GET | `/jobs/public` | Get all public (active) jobs |
| GET | `/jobs/:id` | Get job by ID |
| GET | `/jobs/public/:id` | Get public job by ID |
| PUT | `/jobs/:id` | Update a job |
| DELETE | `/jobs/:id` | Delete/close a job |
| GET | `/jobs/department/:departmentId` | Get jobs by department |
| GET | `/jobs/location/:locationId` | Get jobs by location |
| GET | `/jobs/stats` | Get job statistics |

### Sample Request/Response

**Create Job Request**
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for a Senior Software Engineer to join our team.",
  "requirements": "Bachelor's degree in Computer Science or related field. 5+ years of experience in software development.",
  "responsibilities": "Design and develop high-quality software. Collaborate with cross-functional teams.",
  "departmentId": 1,
  "locationId": 1,
  "salaryRangeMin": 120000,
  "salaryRangeMax": 160000,
  "jobType": "FULL_TIME",
  "experienceLevel": "SENIOR",
  "status": "OPEN",
  "publishedAt": "2023-05-20T14:30:00.000Z",
  "deadlineAt": "2023-06-20T14:30:00.000Z",
  "hiringManagerId": 3,
  "isRemote": true,
  "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
  "benefits": ["Health Insurance", "401(k)", "Flexible Working Hours", "Remote Work"],
  "numberOfOpenings": 2
}
```

**Create Job Response**
```json
{
  "message": "Job created successfully",
  "job": {
    "id": 3,
    "title": "Senior Software Engineer",
    "description": "We are looking for a Senior Software Engineer to join our team.",
    "requirements": "Bachelor's degree in Computer Science or related field. 5+ years of experience in software development.",
    "responsibilities": "Design and develop high-quality software. Collaborate with cross-functional teams.",
    "salaryRangeMin": 120000,
    "salaryRangeMax": 160000,
    "jobType": "FULL_TIME",
    "experienceLevel": "SENIOR",
    "status": "OPEN",
    "publishedAt": "2023-05-20T14:30:00.000Z",
    "deadlineAt": "2023-06-20T14:30:00.000Z",
    "isRemote": true,
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
    "benefits": ["Health Insurance", "401(k)", "Flexible Working Hours", "Remote Work"],
    "numberOfOpenings": 2,
    "createdAt": "2023-05-20T14:30:00.000Z",
    "updatedAt": "2023-05-20T14:30:00.000Z",
    "department": {
      "id": 1,
      "name": "Engineering"
    },
    "location": {
      "id": 1,
      "name": "Headquarters",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "hiringManager": {
      "id": 3,
      "firstName": "Department",
      "lastName": "Manager",
      "email": "manager@talentspark.com"
    }
  }
}
```

## Application Management

### Application Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications/apply` | Apply for a job |
| GET | `/applications` | Get all applications (with filters) |
| GET | `/applications/:id` | Get application by ID |
| PUT | `/applications/:id/status` | Update application status |
| DELETE | `/applications/:id` | Delete an application |
| GET | `/applications/job/:jobId` | Get applications by job |
| GET | `/applications/candidate/:candidateId` | Get applications by candidate |
| GET | `/applications/stats` | Get application statistics |

### Sample Request/Response

**Apply for Job Request**
```json
{
  "jobId": 3,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1987654321",
  "coverLetter": "I am excited to apply for this position and believe my skills are a great match.",
  "source": "WEBSITE",
  "expectedSalary": 130000,
  "availableStartDate": "2023-07-01",
  "education": [
    {
      "institution": "Stanford University",
      "degree": "Master of Science",
      "fieldOfStudy": "Computer Science",
      "from": "2015-09-01",
      "to": "2017-06-01",
      "current": false
    }
  ],
  "experience": [
    {
      "company": "Tech Innovations Inc.",
      "position": "Software Engineer",
      "description": "Developed and maintained web applications using React and Node.js.",
      "from": "2017-07-01",
      "to": "2020-12-31",
      "current": false
    },
    {
      "company": "Global Solutions",
      "position": "Senior Software Engineer",
      "description": "Leading a team of 5 engineers to build scalable backend services.",
      "from": "2021-01-01",
      "current": true
    }
  ],
  "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
  "portfolioUrl": "https://johndoe-portfolio.com",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "githubUrl": "https://github.com/johndoe"
}
```

**Apply for Job Response**
```json
{
  "message": "Application submitted successfully",
  "applicationId": 5
}
```

## Interview Management

### Interview Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/interviews` | Schedule an interview |
| GET | `/interviews` | Get all interviews (with filters) |
| GET | `/interviews/:id` | Get interview by ID |
| PUT | `/interviews/:id` | Update interview details |
| DELETE | `/interviews/:id` | Delete/cancel an interview |
| GET | `/interviews/application/:applicationId` | Get interviews by application |
| GET | `/interviews/interviewer/:interviewerId` | Get interviews by interviewer |
| POST | `/interviews/:id/feedback` | Submit interview feedback |
| GET | `/interviews/stats` | Get interview statistics |

### Sample Request/Response

**Schedule Interview Request**
```json
{
  "applicationId": 5,
  "interviewerId": 5,
  "scheduledAt": "2023-05-25T14:00:00.000Z",
  "duration": 60,
  "type": "TECHNICAL",
  "status": "SCHEDULED",
  "location": "Virtual (Zoom)",
  "meetingLink": "https://zoom.us/j/123456789",
  "questions": [
    "Describe your experience with React and Node.js",
    "How do you approach testing in your projects?",
    "Tell us about a challenging project you worked on"
  ]
}
```

**Schedule Interview Response**
```json
{
  "message": "Interview scheduled successfully",
  "interview": {
    "id": 3,
    "applicationId": 5,
    "interviewerId": 5,
    "scheduledAt": "2023-05-25T14:00:00.000Z",
    "duration": 60,
    "type": "TECHNICAL",
    "status": "SCHEDULED",
    "location": "Virtual (Zoom)",
    "meetingLink": "https://zoom.us/j/123456789",
    "questions": [
      "Describe your experience with React and Node.js",
      "How do you approach testing in your projects?",
      "Tell us about a challenging project you worked on"
    ],
    "createdAt": "2023-05-20T14:30:00.000Z",
    "updatedAt": "2023-05-20T14:30:00.000Z"
  }
}
```

## Offer Management

### Offer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/offers` | Create a job offer |
| GET | `/offers` | Get all offers (with filters) |
| GET | `/offers/:id` | Get offer by ID |
| PUT | `/offers/:id` | Update offer details |
| DELETE | `/offers/:id` | Delete an offer |
| POST | `/offers/:id/approve` | Approve an offer |
| POST | `/offers/:id/reject` | Reject an offer |
| POST | `/offers/:id/accept` | Accept an offer (candidate) |
| POST | `/offers/:id/decline` | Decline an offer (candidate) |
| GET | `/offers/application/:applicationId` | Get offers by application |
| GET | `/offers/stats` | Get offer statistics |

### Sample Request/Response

**Create Offer Request**
```json
{
  "applicationId": 5,
  "salary": 140000,
  "bonus": 10000,
  "stockOptions": 1000,
  "benefits": ["Health Insurance", "401(k)", "Flexible Working Hours", "Remote Work"],
  "startDate": "2023-07-01",
  "expiryDate": "2023-06-01",
  "jobTitle": "Senior Software Engineer",
  "status": "DRAFT",
  "approvalWorkflow": [
    {
      "approverId": 3,
      "status": "PENDING"
    },
    {
      "approverId": 2,
      "status": "PENDING"
    }
  ]
}
```

**Create Offer Response**
```json
{
  "message": "Offer created successfully",
  "offer": {
    "id": 2,
    "applicationId": 5,
    "salary": 140000,
    "bonus": 10000,
    "stockOptions": 1000,
    "benefits": ["Health Insurance", "401(k)", "Flexible Working Hours", "Remote Work"],
    "startDate": "2023-07-01T00:00:00.000Z",
    "expiryDate": "2023-06-01T00:00:00.000Z",
    "jobTitle": "Senior Software Engineer",
    "status": "DRAFT",
    "approvalWorkflow": [
      {
        "approverId": 3,
        "status": "PENDING"
      },
      {
        "approverId": 2,
        "status": "PENDING"
      }
    ],
    "createdAt": "2023-05-20T14:30:00.000Z",
    "updatedAt": "2023-05-20T14:30:00.000Z"
  }
}
```

## Department Management

### Department Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/departments` | Create a department |
| GET | `/departments` | Get all departments |
| GET | `/departments/:id` | Get department by ID |
| PUT | `/departments/:id` | Update a department |
| DELETE | `/departments/:id` | Delete a department |

### Sample Request/Response

**Create Department Request**
```json
{
  "name": "Product Development",
  "description": "Responsible for product strategy and development",
  "managerId": 3,
  "parentDepartmentId": 1,
  "budgetCode": "PROD-2023",
  "isActive": true
}
```

**Create Department Response**
```json
{
  "message": "Department created successfully",
  "department": {
    "id": 4,
    "name": "Product Development",
    "description": "Responsible for product strategy and development",
    "managerId": 3,
    "parentDepartmentId": 1,
    "budgetCode": "PROD-2023",
    "isActive": true,
    "createdAt": "2023-05-20T14:30:00.000Z",
    "updatedAt": "2023-05-20T14:30:00.000Z"
  }
}
```

## Location Management

### Location Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/locations` | Create a location |
| GET | `/locations` | Get all locations |
| GET | `/locations/:id` | Get location by ID |
| PUT | `/locations/:id` | Update a location |
| DELETE | `/locations/:id` | Delete a location |

### Sample Request/Response

**Create Location Request**
```json
{
  "name": "Austin Office",
  "address": "123 Tech Blvd",
  "city": "Austin",
  "state": "TX",
  "country": "USA",
  "postalCode": "78701",
  "phone": "+1 (512) 555-1234",
  "isHeadquarters": false,
  "isActive": true,
  "timezone": "America/Chicago"
}
```

**Create Location Response**
```json
{
  "message": "Location created successfully",
  "location": {
    "id": 3,
    "name": "Austin Office",
    "address": "123 Tech Blvd",
    "city": "Austin",
    "state": "TX",
    "country": "USA",
    "postalCode": "78701",
    "phone": "+1 (512) 555-1234",
    "isHeadquarters": false,
    "isActive": true,
    "timezone": "America/Chicago",
    "createdAt": "2023-05-20T14:30:00.000Z",
    "updatedAt": "2023-05-20T14:30:00.000Z"
  }
}
```

## Budget Management

### Budget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/budgets` | Create a budget |
| GET | `/budgets` | Get all budgets |
| GET | `/budgets/:id` | Get budget by ID |
| PUT | `/budgets/:id` | Update a budget |
| DELETE | `/budgets/:id` | Delete a budget |
| GET | `/budgets/department/:departmentId` | Get budgets by department |
| GET | `/budgets/utilization` | Get budget utilization |
| POST | `/budgets/allocate` | Allocate budget |

### Sample Request/Response

**Create Budget Request**
```json
{
  "fiscalYear": 2023,
  "departmentId": 1,
  "totalAmount": 500000,
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "description": "Engineering department budget for 2023",
  "status": "ACTIVE",
  "createdById": 2,
  "categories": [
    {
      "name": "Recruitment",
      "amount": 200000,
      "description": "Hiring and onboarding new team members"
    },
    {
      "name": "Tools and Software",
      "amount": 100000,
      "description": "Development tools and software licenses"
    },
    {
      "name": "Training",
      "amount": 50000,
      "description": "Professional development and training"
    },
    {
      "name": "Miscellaneous",
      "amount": 150000,
      "description": "Other expenses"
    }
  ]
}
```

**Create Budget Response**
```json
{
  "message": "Budget created successfully",
  "budget": {
    "id": 2,
    "fiscalYear": 2023,
    "departmentId": 1,
    "totalAmount": 500000,
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-12-31T00:00:00.000Z",
    "description": "Engineering department budget for 2023",
    "status": "ACTIVE",
    "createdById": 2,
    "categories": [
      {
        "name": "Recruitment",
        "amount": 200000,
        "description": "Hiring and onboarding new team members"
      },
      {
        "name": "Tools and Software",
        "amount": 100000,
        "description": "Development tools and software licenses"
      },
      {
        "name": "Training",
        "amount": 50000,
        "description": "Professional development and training"
      },
      {
        "name": "Miscellaneous",
        "amount": 150000,
        "description": "Other expenses"
      }
    ],
    "createdAt": "2023-05-20T14:30:00.000Z",
    "updatedAt": "2023-05-20T14:30:00.000Z"
  }
}
```

## Resume Parsing and Job Matching

### Resume Parsing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resumes/parse` | Parse a resume file |
| POST | `/resumes/match/:jobId` | Match a resume with a job |
| GET | `/candidates/:id/matching-jobs` | Find matching jobs for a candidate |

### Sample Request/Response

**Parse Resume Request**
```
Multipart form data with resume file
```

**Parse Resume Response**
```json
{
  "message": "Resume parsed successfully",
  "resumeData": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1 (555) 123-4567",
      "linkedIn": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe"
    },
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git"],
    "education": [
      {
        "institution": "University of Technology",
        "degree": "Bachelor of Science",
        "fieldOfStudy": "Computer Science",
        "from": "2015-09-01T00:00:00.000Z",
        "to": "2019-05-31T00:00:00.000Z",
        "current": false
      }
    ],
    "experience": [
      {
        "company": "Tech Solutions Inc.",
        "position": "Software Engineer",
        "description": "Developed web applications using React and Node.js",
        "from": "2019-06-01T00:00:00.000Z",
        "to": "2022-12-31T00:00:00.000Z",
        "current": false
      },
      {
        "company": "Innovation Labs",
        "position": "Senior Developer",
        "description": "Leading development team for cloud applications",
        "from": "2023-01-01T00:00:00.000Z",
        "current": true
      }
    ]
  }
}
```

## Error Responses

The API follows a consistent error response format:

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": ["Email is required", "Password must be at least 8 characters"]
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden: You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "details": "Error details (only in development mode)"
}
```