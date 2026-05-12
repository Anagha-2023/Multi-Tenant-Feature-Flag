const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../database');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Create organization (Super Admin only)
router.post('/', verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    // Check if organization already exists
    const existing = await database.getOrganizationByName(name);
    if (existing) {
      return res.status(400).json({ error: 'Organization already exists' });
    }

    const organization = {
      id: uuidv4(),
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    };

    await database.createOrganization(organization);

    res.status(201).json(organization);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all organizations (Super Admin only)
router.get('/', verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const organizations = await database.getAllOrganizations();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get organization by ID (for signup page)
router.get('/:id', async (req, res) => {
  try {
    const organization = await database.getOrganizationById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json({ id: organization.id, name: organization.name });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
