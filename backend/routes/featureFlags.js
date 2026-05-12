const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../database');
const { verifyToken, isOrgAdmin } = require('../middleware/auth');

const router = express.Router();

// Create feature flag (Org Admin only)
router.post('/', verifyToken, isOrgAdmin, async (req, res) => {
  try {
    const { key, description, enabled } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Feature key is required' });
    }

    // Check if flag already exists for this organization
    const existing = await database.getFeatureFlag(req.user.organizationId, key);
    if (existing) {
      return res.status(400).json({ error: 'Feature flag already exists' });
    }

    const featureFlag = {
      id: uuidv4(),
      organizationId: req.user.organizationId,
      key,
      description: description || '',
      enabled: enabled !== undefined ? enabled : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await database.createFeatureFlag(featureFlag);

    res.status(201).json(featureFlag);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all feature flags for org (Org Admin only)
router.get('/', verifyToken, isOrgAdmin, async (req, res) => {
  try {
    const flags = await database.getFeatureFlagsByOrganization(req.user.organizationId);
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update feature flag (Org Admin only)
router.put('/:id', verifyToken, isOrgAdmin, async (req, res) => {
  try {
    const { key, description, enabled } = req.body;
    const { id } = req.params;

    // Verify flag belongs to user's organization
    const flags = await database.getFeatureFlagsByOrganization(req.user.organizationId);
    const flag = flags.find(f => f.id === id);
    
    if (!flag) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (key !== undefined) updates.key = key;
    if (description !== undefined) updates.description = description;
    if (enabled !== undefined) updates.enabled = enabled;

    const updated = await database.updateFeatureFlag(id, updates);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete feature flag (Org Admin only)
router.delete('/:id', verifyToken, isOrgAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify flag belongs to user's organization
    const flags = await database.getFeatureFlagsByOrganization(req.user.organizationId);
    const flag = flags.find(f => f.id === id);
    
    if (!flag) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    await database.deleteFeatureFlag(id);

    res.json({ message: 'Feature flag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Check feature flag status (Public endpoint for end users)
router.post('/check', async (req, res) => {
  try {
    const { organizationId, featureKey } = req.body;

    if (!organizationId || !featureKey) {
      return res.status(400).json({ error: 'Organization ID and feature key are required' });
    }

    const flag = await database.getFeatureFlag(organizationId, featureKey);

    if (!flag) {
      return res.json({
        organizationId,
        featureKey,
        enabled: false,
        message: 'Feature flag not found'
      });
    }

    res.json({
      organizationId,
      featureKey,
      enabled: flag.enabled,
      description: flag.description
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
