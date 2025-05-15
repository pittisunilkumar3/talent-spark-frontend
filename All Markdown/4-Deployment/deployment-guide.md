# Deployment Guide

This guide provides detailed instructions for deploying both the frontend and backend of the QORE Recruitment Platform to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
   - [Option 1: Deploying to Heroku](#option-1-deploying-to-heroku)
   - [Option 2: Deploying to Railway](#option-2-deploying-to-railway)
3. [Frontend Deployment](#frontend-deployment)
   - [Deploying to Vercel](#deploying-to-vercel)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)
7. [Post-Deployment Tasks](#post-deployment-tasks)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- A GitHub repository with your code
- Node.js and npm installed locally
- Access to your deployment platforms (Heroku/Railway and Vercel accounts)
- PostgreSQL database credentials for production
- Domain names (optional)

## Backend Deployment

### Option 1: Deploying to Heroku

Heroku is a platform as a service (PaaS) that enables developers to build, run, and operate applications entirely in the cloud.

#### 1. Prepare Your Backend for Heroku

1. Create a `Procfile` in the backend directory:
```
web: npm start
```

2. Update `package.json` to include a proper build script:
```json
"scripts": {
  "start": "node dist/index.js",
  "build": "tsc",
  "postinstall": "prisma generate && npm run build"
}
```

3. Ensure your server listens on the correct port:
```typescript
// src/index.ts
const PORT = process.env.PORT || 3001;
```

#### 2. Create a Heroku App

1. Install the Heroku CLI:
```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download installer from https://devcenter.heroku.com/articles/heroku-cli

# Ubuntu
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```

2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
cd backend
heroku create qore-recruit-api
```

#### 3. Add a PostgreSQL Database

```bash
heroku addons:create heroku-postgresql:hobby-dev --app qore-recruit-api
```

#### 4. Configure Environment Variables

```bash
heroku config:set NODE_ENV=production --app qore-recruit-api
heroku config:set JWT_SECRET=your_secure_jwt_secret --app qore-recruit-api
heroku config:set ACCESS_TOKEN_EXPIRY=24h --app qore-recruit-api
heroku config:set CORS_ORIGIN=https://your-frontend-domain.vercel.app --app qore-recruit-api
```

#### 5. Deploy to Heroku

```bash
git subtree push --prefix backend heroku main
```

If your backend is in a subdirectory, use:
```bash
git subtree push --prefix path/to/backend heroku main
```

#### 6. Run Database Migrations

```bash
heroku run npm run migrate --app qore-recruit-api
```

### Option 2: Deploying to Railway

Railway is a modern platform for deploying apps and websites.

#### 1. Prepare Your Backend for Railway

No special preparation is needed as Railway supports Node.js applications out of the box.

#### 2. Deploy to Railway

1. Install the Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize a new project:
```bash
cd backend
railway init
```

4. Add a PostgreSQL database:
```bash
railway add
```
Select PostgreSQL from the list.

5. Deploy your backend:
```bash
railway up
```

6. Configure environment variables through the Railway dashboard.

## Frontend Deployment

### Deploying to Vercel

Vercel is a cloud platform for static sites and serverless functions, optimized for frontend frameworks.

#### 1. Prepare Your Frontend for Vercel

1. Update your `vite.config.ts` to remove the development proxy:
```typescript
// vite.config.ts
export default defineConfig({
  // Remove the proxy configuration for production
  // It will use the VITE_API_BASE_URL environment variable instead
});
```

2. Create a `vercel.json` file in the frontend directory:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "github": {
    "silent": true
  }
}
```

#### 2. Deploy to Vercel

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy your frontend:
```bash
cd frontend
vercel
```

4. For production deployment:
```bash
vercel --prod
```

#### 3. Configure Environment Variables in Vercel

1. Go to the Vercel dashboard.
2. Select your project.
3. Go to Settings > Environment Variables.
4. Add the following environment variables:
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., https://qore-recruit-api.herokuapp.com/api)

## Environment Configuration

### Production Environment Variables

#### Backend

```
NODE_ENV=production
PORT=3001
DATABASE_URL=your_production_database_url
JWT_SECRET=your_secure_jwt_secret
ACCESS_TOKEN_EXPIRY=24h
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

#### Frontend

```
VITE_API_BASE_URL=https://your-backend-domain.herokuapp.com/api
```

## Database Setup

### Setting Up the Production Database

1. Run migrations on the production database:
```bash
# For Heroku
heroku run npm run migrate --app qore-recruit-api

# For Railway
railway run npm run migrate
```

2. Seed the production database (optional):
```bash
# For Heroku
heroku run npm run seed --app qore-recruit-api

# For Railway
railway run npm run seed
```

### Database Backups

1. Set up regular backups for your production database:
```bash
# For Heroku
heroku pg:backups:schedule --at '02:00 America/New_York' --app qore-recruit-api
```

2. To capture a manual backup:
```bash
# For Heroku
heroku pg:backups:capture --app qore-recruit-api
```

## Continuous Integration/Continuous Deployment

### Setting Up GitHub Actions

1. Create a `.github/workflows` directory in your repository.

2. Create a workflow file for the backend:
```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          
      - name: Run tests
        run: |
          cd backend
          npm test
          
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "qore-recruit-api"
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          appdir: "backend"
```

3. Create a workflow file for the frontend:
```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'src/**'
      - 'public/**'
      - 'package.json'
      - 'vite.config.ts'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
          
      - name: Run tests
        run: npm test
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Post-Deployment Tasks

### 1. Verify Deployment

1. Check that the backend API is accessible:
```bash
curl https://your-backend-domain.herokuapp.com/api/health
```

2. Check that the frontend is accessible:
```
https://your-frontend-domain.vercel.app
```

### 2. Set Up Monitoring

1. Add application monitoring with New Relic or Datadog.
2. Set up error tracking with Sentry.
3. Configure uptime monitoring with UptimeRobot or Pingdom.

### 3. Set Up Analytics

1. Add Google Analytics or Plausible Analytics to the frontend.
2. Set up conversion tracking for key user flows.

## Troubleshooting

### Common Backend Deployment Issues

1. **Database Connection Errors**:
   - Check your `DATABASE_URL` environment variable.
   - Ensure your database is accessible from your deployment platform.
   - Check for firewall rules that might block connections.

2. **Missing Environment Variables**:
   - Verify all required environment variables are set.
   - Check for typos in variable names.

3. **Build Failures**:
   - Check your build logs for errors.
   - Ensure all dependencies are properly listed in `package.json`.
   - Verify TypeScript configuration is correct.

### Common Frontend Deployment Issues

1. **API Connection Errors**:
   - Check that `VITE_API_BASE_URL` is correctly set.
   - Verify CORS settings on the backend.
   - Check for mixed content issues (HTTP vs HTTPS).

2. **Build Failures**:
   - Check for TypeScript errors.
   - Verify all dependencies are properly listed in `package.json`.
   - Check for environment-specific code that might fail in production.

3. **Routing Issues**:
   - Ensure your `vercel.json` has the correct rewrites configuration.
   - Check that client-side routing works correctly.

### Getting Help

If you encounter issues not covered in this guide:

1. Check the deployment platform's documentation:
   - [Heroku Dev Center](https://devcenter.heroku.com/)
   - [Railway Docs](https://docs.railway.app/)
   - [Vercel Documentation](https://vercel.com/docs)

2. Search for error messages on Stack Overflow or GitHub issues.

3. Reach out to the platform's support channels.
