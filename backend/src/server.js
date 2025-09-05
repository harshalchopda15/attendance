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
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Enhanced CORS configuration for cookies
app.use(cors({ 
  origin: allowedOrigin, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    cookies: req.cookies,
    headers: req.headers,
    body: req.body
  });
  next();
});

app.get('/', (req, res) => res.send('API running'));

app.use('/auth', require('./routes/auth'));
app.use('/teacher', require('./routes/teacher'));
app.use('/student', require('./routes/student'));
app.use('/admin', require('./routes/admin'));

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync all models with associations
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
    
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log('Server listening on port ' + port));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
