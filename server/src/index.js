const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Serve Static Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import Modular Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dailyUpdateRoutes = require('./routes/dailyUpdateRoutes');
const deliverableRoutes = require('./routes/deliverableRoutes');

// Import Middlewares for Demo/Testing Protected Endpoints
const { protect, authorize } = require('./middleware/authMiddleware');
const { scopeQuery } = require('./middleware/scopeMiddleware');

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'PENSDEO Workspace API Server Operational',
    auth: 'JWT & RBAC Active',
    features: [
      'File Uploads (Multer)',
      'Client & Staff Email Invitations (Nodemailer)',
      'Dynamic Departments & Multi-Department Assignment',
      'Advanced $in Filtering',
      'Project Attachments',
    ],
    timestamp: new Date(),
  });
});

// --- MOUNT ROUTERS ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/daily-updates', dailyUpdateRoutes);
app.use('/api/deliverables', deliverableRoutes);

// --- DUMMY / TEST PROTECTED ROUTES FOR RBAC DEMONSTRATION ---
app.get('/api/test/admin-only', protect, authorize('SuperAdmin', 'Manager'), (req, res) => {
  res.json({
    message: 'Access Granted: You have Admin/Manager privileges.',
    user: req.user,
  });
});

app.get('/api/test/employee-access', protect, authorize('SuperAdmin', 'Manager', 'Employee'), (req, res) => {
  res.json({
    message: 'Access Granted: Staff member authenticated.',
    user: req.user,
  });
});

app.get('/api/test/client-scoped-updates', protect, authorize('Client'), scopeQuery('DailyUpdate'), (req, res) => {
  res.json({
    message: 'Access Granted: Client view strictly scoped.',
    appliedRoleFilter: req.roleFilter,
    user: req.user,
  });
});

// Serve Static Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PENSDEO Workspace Server running on port ${PORT} with Dynamic Departments & Advanced Filtering.`);
});
