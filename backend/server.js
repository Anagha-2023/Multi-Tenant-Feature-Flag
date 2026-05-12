const express = require('express');
const cors = require('cors');
const config = require('./config');
const database = require('./database');

const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organizations');
const featureFlagRoutes = require('./routes/featureFlags');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/feature-flags', featureFlagRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Feature Flag API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB and start server
async function startServer() {
  await database.connectDB();
  
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`API available at http://localhost:${config.port}/api`);
    console.log(`MongoDB URI: ${config.mongoUri}`);
    console.log(`\nSuper Admin Credentials:`);
    console.log(`Username: ${config.superAdmin.username}`);
    console.log(`Password: ${config.superAdmin.password}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
