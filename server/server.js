const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const sequelize = require('./config/database');
require('dotenv').config();

// Import routes
const roleRoutes = require('./routes/roleRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const branchRoutes = require('./routes/branchRoutes');
const employeeRoleRoutes = require('./routes/employeeRoleRoutes');

// Initialize express app
const app = express();

// Middleware
// Configure CORS to allow requests from the frontend
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'http://localhost:5173'
    : '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow cross-origin resource sharing
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle OPTIONS requests for CORS preflight
app.options('*', cors(corsOptions));

// API routes
app.use('/api/roles', roleRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/branch', branchRoutes); // Changed from '/api/branches' to '/api/branch'
app.use('/api/employee-roles', employeeRoleRoutes);
app.use('/api', permissionRoutes); // This will register /api/permission-groups-with-categories

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to QORE API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3001; // Changed from 3001 to 3003

// Test database connection and sync models
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models with database
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database models synchronized.');

    // Setup model associations
    const { setupAssociations: setupRoleAssociations } = require('./models/Role');
    const { setupAssociations: setupUserAssociations } = require('./models/User');
    const { setupAssociations: setupEmployeeAssociations } = require('./models/Employee');
    const { setupAssociations: setupPermissionGroupAssociations } = require('./models/PermissionGroup');
    const { setupAssociations: setupPermissionCategoryAssociations } = require('./models/PermissionCategory');
    const { setupAssociations: setupDepartmentAssociations } = require('./models/Department');
    const { setupAssociations: setupDesignationAssociations } = require('./models/Designation');
    const { setupAssociations: setupEmployeeRoleAssociations } = require('./models/EmployeeRole');
    const { setupAssociations: setupBranchAssociations } = require('./models/Branch');

    setupRoleAssociations();
    setupUserAssociations();
    setupEmployeeAssociations();
    setupPermissionGroupAssociations();
    setupPermissionCategoryAssociations();
    setupDepartmentAssociations();
    setupDesignationAssociations();
    setupEmployeeRoleAssociations();
    setupBranchAssociations();

    // Seed data if in development mode
    if (process.env.NODE_ENV === 'development') {
      const seedPermissions = require('./seeders/permissionSeeder');
      await seedPermissions();
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
