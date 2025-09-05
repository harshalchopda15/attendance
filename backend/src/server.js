const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./config/database');

// Import models to ensure associations are established
require('./models/User');
require('./models/Class');
require('./models/Attendance');

dotenv.config();

const app = express();

// Get allowed origins from environment
const allowedOrigins = process.env.CORS_ORIGIN ? 
  process.env.CORS_ORIGIN.split(',') : 
  ['http://localhost:3000'];

// Enhanced CORS configuration for cookies
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Debug middleware to log all requests (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, {
      cookies: req.cookies,
      headers: req.headers,
      body: req.body
    });
    next();
  });
}

app.get('/', (req, res) => res.send('API running'));

app.use('/auth', require('./routes/auth'));
app.use('/teacher', require('./routes/teacher'));
app.use('/student', require('./routes/student'));
app.use('/admin', require('./routes/admin'));

// Initialize database connection
let dbInitialized = false;

async function initializeDatabase() {
  if (dbInitialized) return;
  
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync all models with associations
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
    
    dbInitialized = true;
  } catch (err) {
    console.error('Failed to initialize database', err);
    throw err;
  }
}

// Initialize database on first request
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// For Vercel serverless
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log('Server listening on port ' + port));
}
