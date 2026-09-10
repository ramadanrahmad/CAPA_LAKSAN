const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware
// ============================================

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/oauth'));
app.use('/api/auth', require('./routes/password'));

// Admin routes
app.use('/api/admin', require('./routes/admin'));

// Supervisor routes
app.use('/api/supervisor', require('./routes/supervisor'));

// Petugas routes
app.use('/api/petugas', require('./routes/petugas'));

// Sertifikasi routes
app.use('/api/sertifikasi', require('./routes/sertifikasi'));

// Serve static files from uploads folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inspeksi routes
app.use('/api/inspeksi', require('./routes/inspeksi'));

// Upload routes
app.use('/api/upload', require('./routes/upload'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ============================================
// Start Server
// ============================================

const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🚀 Server running on port ${PORT}    ║
  ║   📦 Environment: ${(process.env.NODE_ENV || 'development').padEnd(16)}║
  ╚══════════════════════════════════════╝
  `);
});

// Tambahkan timeout yang lebih besar agar tidak terjadi ECONNRESET di proxy (Vite)
server.keepAliveTimeout = 120000; // 120 detik
server.headersTimeout = 120000; // 120 detik

module.exports = app;
