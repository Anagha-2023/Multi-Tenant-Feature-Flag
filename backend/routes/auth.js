const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const database = require('../database');

const router = express.Router();

// Super Admin Login
router.post('/super-admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === config.superAdmin.username && password === config.superAdmin.password) {
    const token = jwt.sign(
      { id: 'super-admin', role: 'super-admin', username },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: { username, role: 'super-admin' }
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

// Organization Admin Signup
router.post('/admin/signup', async (req, res) => {
  try {
    const { email, password, name, organizationId } = req.body;

    // Validate input
    if (!email || !password || !name || !organizationId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if organization exists
    const organization = await database.getOrganizationById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user already exists
    const existingUser = await database.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role: 'org-admin',
      organizationId,
      createdAt: new Date().toISOString()
    };

    await database.createUser(user);

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, organizationId: user.organizationId },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Organization Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await database.getUserByEmail(email);
    if (!user || user.role !== 'org-admin') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, organizationId: user.organizationId },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
