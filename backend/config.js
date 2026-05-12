module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://anaghaammus555_db_user:sWqbaJIuKv6xJoZH@featureflags.aqpoqoh.mongodb.net/feature_flags?retryWrites=true&w=majority&appName=FeatureFlags',
  
  // Super Admin credentials (static)
  superAdmin: {
    username: 'superadmin',
    password: 'Admin@123' // In production, use hashed password
  }
};
