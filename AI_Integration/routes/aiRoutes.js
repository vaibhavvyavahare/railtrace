const express = require('express');
const aiService = require('../services/aiService');

const router = express.Router();

// Get vendor performance summary with AI analysis
router.get('/vendor/:vendorId/summary', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const result = await aiService.generateVendorSummary(vendorId);
    
    res.json({
      success: true,
      vendorId,
      data: result.data,
      aiAnalysis: result.aiAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Vendor summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate vendor summary',
      message: error.message
    });
  }
});

// Get batch performance summary with AI analysis
router.get('/batch/:batchId/summary', async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await aiService.generateBatchSummary(batchId);
    
    res.json({
      success: true,
      batchId,
      data: result.data,
      aiAnalysis: result.aiAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate batch summary',
      message: error.message
    });
  }
});

// Get lot performance summary with AI analysis
router.get('/lot/:lotId/summary', async (req, res) => {
  try {
    const { lotId } = req.params;
    const result = await aiService.generateLotSummary(lotId);
    
    res.json({
      success: true,
      lotId,
      data: result.data,
      aiAnalysis: result.aiAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Lot summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate lot summary',
      message: error.message
    });
  }
});

// Get comprehensive performance report for all vendors
router.get('/performance/report', async (req, res) => {
  try {
    const result = await aiService.generatePerformanceReport();
    
    res.json({
      success: true,
      report: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Performance report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate performance report',
      message: error.message
    });
  }
});

// Get maintenance alerts and predictions
router.get('/alerts/maintenance', async (req, res) => {
  try {
    const result = await aiService.generateMaintenanceAlerts();
    
    res.json({
      success: true,
      alerts: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Maintenance alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate maintenance alerts',
      message: error.message
    });
  }
});

module.exports = router;
