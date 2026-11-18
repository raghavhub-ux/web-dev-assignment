const dotenv = require('dotenv');

// Load environment variables before anything else
dotenv.config();

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 4000;

// Connect to MongoDB Atlas
connectDB();

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 CampusTrack API server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});
