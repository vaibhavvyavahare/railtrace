const express = require('express');
const { query } = require('../config/database');
const { sarvamClient } = require('../config/sarvam');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Integration Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Detailed health check with dependencies
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'AI Integration Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    dependencies: {
      database: 'unknown',
      sarvam_ai: 'unknown'
    }
  };

  try {
    // Test database connection
    await query('SELECT 1');
    health.dependencies.database = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error.message);
    health.dependencies.database = 'disconnected';
    health.status = 'unhealthy';
    health.database_error = error.message;
  }

  try {
    // Test Sarvam AI connection (basic check)
    if (process.env.SARVAM_API_KEY) {
      health.dependencies.sarvam_ai = 'configured';
    } else {
      health.dependencies.sarvam_ai = 'not_configured';
    }
  } catch (error) {
    health.dependencies.sarvam_ai = 'error';
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
