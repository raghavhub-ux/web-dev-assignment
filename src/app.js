const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'CampusTrack API is running',
    version: 'v1',
  });
});

// Mount API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assignments', assignmentRoutes);

// Catch 404 for unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
