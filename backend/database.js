const mongoose = require('mongoose');
const config = require('./config');

// MongoDB Schemas
const organizationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  organizationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const featureFlagSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  organizationId: { type: String, required: true, index: true },
  key: { type: String, required: true },
  description: String,
  enabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for organizationId + key
featureFlagSchema.index({ organizationId: 1, key: 1 }, { unique: true });

// Models
const Organization = mongoose.model('Organization', organizationSchema);
const User = mongoose.model('User', userSchema);
const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);

// Database connection
async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('⚠️  MongoDB connection failed:', error.message);
    console.log('   The API will continue running without persistent storage.');
    console.log('   Data will be lost when server restarts.');
    console.log('   To enable MongoDB: See MONGODB_SETUP.md');
    // Continue running without MongoDB - operations will fail gracefully
  }
}

// Database operations
const database = {
  connectDB,

  // Organizations
  async createOrganization(org) {
    const organization = new Organization(org);
    await organization.save();
    return org;
  },

  async getAllOrganizations() {
    return await Organization.find({}, { _id: 0, __v: 0 }).lean();
  },

  async getOrganizationById(id) {
    return await Organization.findOne({ id }, { _id: 0, __v: 0 }).lean();
  },

  async getOrganizationByName(name) {
    return await Organization.findOne(
      { name: { $regex: new RegExp(`^${name}$`, 'i') } },
      { _id: 0, __v: 0 }
    ).lean();
  },

  // Users
  async createUser(user) {
    const newUser = new User(user);
    await newUser.save();
    return user;
  },

  async getUserByEmail(email) {
    return await User.findOne({ email }, { _id: 0, __v: 0 }).lean();
  },

  async getUserById(id) {
    return await User.findOne({ id }, { _id: 0, __v: 0 }).lean();
  },

  // Feature Flags
  async createFeatureFlag(flag) {
    const featureFlag = new FeatureFlag(flag);
    await featureFlag.save();
    return flag;
  },

  async getFeatureFlagsByOrganization(organizationId) {
    return await FeatureFlag.find({ organizationId }, { _id: 0, __v: 0 }).lean();
  },

  async getFeatureFlag(organizationId, featureKey) {
    return await FeatureFlag.findOne(
      { organizationId, key: featureKey },
      { _id: 0, __v: 0 }
    ).lean();
  },

  async updateFeatureFlag(id, updates) {
    updates.updatedAt = new Date();
    const result = await FeatureFlag.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, projection: { _id: 0, __v: 0 } }
    ).lean();
    return result;
  },

  async deleteFeatureFlag(id) {
    return await FeatureFlag.findOneAndDelete({ id }, { projection: { _id: 0, __v: 0 } }).lean();
  }
};

module.exports = database;
