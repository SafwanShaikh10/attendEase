const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');

dotenv.config();

// Environment Variable Validation
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const passport = require('./config/passport');
app.use(passport.initialize());

const rateLimit = require('express-rate-limit');

// Global limiter — all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  message: { error: 'Too many requests. Please try again later.' }
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please wait.' }
});

app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// AUTHENTICATED FILE SERVING (Security Fix: Replaced open static serving)
const { authenticateToken } = require('./middlewares/auth.middleware');
app.get('/api/uploads/:folder/:filename', authenticateToken, (req, res) => {
  const { folder, filename } = req.params;
  
  // Prevent Path Traversal
  if (filename.includes('..') || folder.includes('..')) {
    return res.status(400).json({ error: 'Illegal path' });
  }

  const filePath = path.resolve(__dirname, 'uploads', folder, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Sanitized logging - do not log req.url as it contains the JWT token
  console.log(`[FILE SERVED] folder=${folder} file=${filename} user=${req.user.id}`);

  res.sendFile(filePath);
});

// Routes
const authRoutes = require('./routes/auth.routes');
const requestRoutes = require('./routes/request.routes');
const chairpersonRoutes = require('./routes/chairperson.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chairperson', chairpersonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Register background cron jobs (deadline enforcement)
require('./jobs/deadline.job');

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Attendance Request System API is running.' });
});

// Sanitized Error handling middleware for production
app.use((err, req, res, next) => {
  console.error(err.stack); // Full log on server
  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An internal server error occurred' 
    : err.message;

  res.status(status).json({ 
    success: false, 
    error: message 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
