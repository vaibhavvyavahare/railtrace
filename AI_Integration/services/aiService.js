const { query } = require('../config/database');
const { generateTextCompletion, generateChatCompletion } = require('../config/sarvam');

class AIService {
  
  // Generate vendor performance summary
  async generateVendorSummary(vendorId) {
    try {
      // Get vendor data
      const vendorData = await this.getVendorData(vendorId);
      if (!vendorData.vendor) {
        throw new Error('Vendor not found');
      }

      // Build AI prompt
      const prompt = this.buildVendorPrompt(vendorData);
      
      // Generate AI analysis
      const aiResponse = await generateTextCompletion(prompt, {
        maxTokens: 1500,
        temperature: 0.3
      });

      return {
        data: vendorData,
        aiAnalysis: this.parseAIResponse(aiResponse)
      };
    } catch (error) {
      console.error('Error generating vendor summary:', error);
      throw error;
    }
  }

  // Generate batch performance summary
  async generateBatchSummary(batchId) {
    try {
      const batchData = await this.getBatchData(batchId);
      if (!batchData.batch) {
        throw new Error('Batch not found');
      }

      const prompt = this.buildBatchPrompt(batchData);
      const aiResponse = await generateTextCompletion(prompt, {
        maxTokens: 1000,
        temperature: 0.3
      });

      return {
        data: batchData,
        aiAnalysis: this.parseAIResponse(aiResponse)
      };
    } catch (error) {
      console.error('Error generating batch summary:', error);
      throw error;
    }
  }

  // Generate lot performance summary
  async generateLotSummary(lotId) {
    try {
      const lotData = await this.getLotData(lotId);
      if (!lotData.lot) {
        throw new Error('Lot not found');
      }

      const prompt = this.buildLotPrompt(lotData);
      const aiResponse = await generateTextCompletion(prompt, {
        maxTokens: 1200,
        temperature: 0.3
      });

      return {
        data: lotData,
        aiAnalysis: this.parseAIResponse(aiResponse)
      };
    } catch (error) {
      console.error('Error generating lot summary:', error);
      throw error;
    }
  }

  // Generate comprehensive performance report
  async generatePerformanceReport() {
    try {
      const reportData = await this.getPerformanceReportData();
      const prompt = this.buildPerformanceReportPrompt(reportData);
      
      const aiResponse = await generateTextCompletion(prompt, {
        maxTokens: 2000,
        temperature: 0.3
      });

      return {
        data: reportData,
        aiAnalysis: this.parseAIResponse(aiResponse)
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  // Generate maintenance alerts
  async generateMaintenanceAlerts() {
    try {
      const maintenanceData = await this.getMaintenanceData();
      const prompt = this.buildMaintenanceAlertsPrompt(maintenanceData);
      
      const aiResponse = await generateTextCompletion(prompt, {
        maxTokens: 1000,
        temperature: 0.2
      });

      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('Error generating maintenance alerts:', error);
      throw error;
    }
  }

  // Data retrieval methods
  async getVendorData(vendorId) {
    const vendor = await query('SELECT * FROM vendors WHERE vendor_id = $1', [vendorId]);
    const lots = await query('SELECT * FROM lots WHERE vendor_id = $1 ORDER BY created_at DESC', [vendorId]);
    const lotIds = lots.map(l => l.lot_id);
    
    const batches = lotIds.length > 0 
      ? await query('SELECT * FROM batches WHERE lot_id = ANY($1)', [lotIds])
      : [];
    
    const batchIds = batches.map(b => b.batch_id);
    const fittings = batchIds.length > 0
      ? await query('SELECT * FROM fittings WHERE batch_id = ANY($1)', [batchIds])
      : [];
    
    const fittingIds = fittings.map(f => f.fitting_id);
    const installations = fittingIds.length > 0
      ? await query('SELECT * FROM installation_records WHERE fitting_id = ANY($1) ORDER BY installed_at DESC', [fittingIds])
      : [];
    
    const maintenances = fittingIds.length > 0
      ? await query('SELECT * FROM maintenance_records WHERE fitting_id = ANY($1) ORDER BY reported_at DESC', [fittingIds])
      : [];

    return {
      vendor: vendor[0] || null,
      lots,
      batches,
      fittings,
      installations,
      maintenances
    };
  }

  async getBatchData(batchId) {
    const batch = await query('SELECT * FROM batches WHERE batch_id = $1', [batchId]);
    if (!batch[0]) return { batch: null };

    const lot = await query('SELECT * FROM lots WHERE lot_id = $1', [batch[0].lot_id]);
    const order = await query('SELECT * FROM orders WHERE order_id = $1', [batch[0].order_id]);
    const vendor = order[0] ? await query('SELECT * FROM vendors WHERE vendor_id = $1', [order[0].vendor_id]) : [];
    
    const fittings = await query('SELECT * FROM fittings WHERE batch_id = $1', [batchId]);
    const fittingIds = fittings.map(f => f.fitting_id);
    
    const installations = fittingIds.length > 0
      ? await query('SELECT * FROM installation_records WHERE fitting_id = ANY($1) ORDER BY installed_at DESC', [fittingIds])
      : [];
    
    const maintenances = fittingIds.length > 0
      ? await query('SELECT * FROM maintenance_records WHERE fitting_id = ANY($1) ORDER BY reported_at DESC', [fittingIds])
      : [];

    return {
      batch: batch[0],
      lot: lot[0] || null,
      order: order[0] || null,
      vendor: vendor[0] || null,
      fittings,
      installations,
      maintenances
    };
  }

  async getLotData(lotId) {
    const lot = await query('SELECT * FROM lots WHERE lot_id = $1', [lotId]);
    if (!lot[0]) return { lot: null };

    const vendor = await query('SELECT * FROM vendors WHERE vendor_id = $1', [lot[0].vendor_id]);
    const batches = await query('SELECT * FROM batches WHERE lot_id = $1', [lotId]);
    const batchIds = batches.map(b => b.batch_id);
    
    const fittings = batchIds.length > 0
      ? await query('SELECT * FROM fittings WHERE batch_id = ANY($1)', [batchIds])
      : [];
    
    const fittingIds = fittings.map(f => f.fitting_id);
    const installations = fittingIds.length > 0
      ? await query('SELECT * FROM installation_records WHERE fitting_id = ANY($1) ORDER BY installed_at DESC', [fittingIds])
      : [];
    
    const maintenances = fittingIds.length > 0
      ? await query('SELECT * FROM maintenance_records WHERE fitting_id = ANY($1) ORDER BY reported_at DESC', [fittingIds])
      : [];

    return {
      lot: lot[0],
      vendor: vendor[0] || null,
      batches,
      fittings,
      installations,
      maintenances
    };
  }

  async getPerformanceReportData() {
    const vendors = await query('SELECT * FROM vendors');
    const orders = await query('SELECT * FROM orders');
    const lots = await query('SELECT * FROM lots');
    const batches = await query('SELECT * FROM batches');
    const fittings = await query('SELECT * FROM fittings');
    const installations = await query('SELECT * FROM installation_records');
    const maintenances = await query('SELECT * FROM maintenance_records');

    return {
      vendors,
      orders,
      lots,
      batches,
      fittings,
      installations,
      maintenances
    };
  }

  async getMaintenanceData() {
    const maintenances = await query(`
      SELECT mr.*, f.fitting_id, b.batch_id, l.lot_id, v.vendor_name, o.component_type
      FROM maintenance_records mr
      JOIN fittings f ON mr.fitting_id = f.fitting_id
      JOIN batches b ON f.batch_id = b.batch_id
      JOIN lots l ON b.lot_id = l.lot_id
      JOIN orders o ON b.order_id = o.order_id
      JOIN vendors v ON o.vendor_id = v.vendor_id
      ORDER BY mr.reported_at DESC
    `);

    return { maintenances };
  }

  // Prompt building methods
  buildVendorPrompt(data) {
    const { vendor, lots, batches, fittings, installations, maintenances } = data;
    
    return `Analyze the performance data for vendor ${vendor.vendor_name} (ID: ${vendor.vendor_id}):

VENDOR STATISTICS:
- Total Lots: ${lots.length}
- Total Batches: ${batches.length}
- Total Fittings: ${fittings.length}
- Total Installations: ${installations.length}
- Total Maintenance Records: ${maintenances.length}

INSTALLATION STATUS BREAKDOWN:
${this.getStatusBreakdown(installations, 'status')}

MAINTENANCE STATUS BREAKDOWN:
${this.getStatusBreakdown(maintenances, 'status')}

RECENT ACTIVITY (Last 10):
- Recent Installations: ${installations.slice(0, 10).map(i => `${i.fitting_id}: ${i.status} (${i.installed_at})`).join(', ')}
- Recent Maintenance: ${maintenances.slice(0, 10).map(m => `${m.fitting_id}: ${m.status} - ${m.issue_description}`).join(', ')}

Please provide a comprehensive analysis including:
1. Performance trends and quality indicators
2. Risk assessment and potential issues
3. Recommendations for improvement
4. Priority alerts for immediate attention

Format your response as JSON with: {"summary": "...", "trends": "...", "risks": "...", "recommendations": [...], "alerts": [{"severity": "high/medium/low", "message": "...", "action": "..."}]}`;
  }

  buildBatchPrompt(data) {
    const { batch, lot, vendor, order, fittings, installations, maintenances } = data;
    
    return `Analyze the performance data for batch ${batch.batch_id}:

BATCH DETAILS:
- Batch ID: ${batch.batch_id}
- Lot ID: ${batch.lot_id}
- Vendor: ${vendor ? vendor.vendor_name : 'Unknown'}
- Component Type: ${order ? order.component_type : 'Unknown'}
- Total Items: ${fittings.length}

INSTALLATION DATA:
${this.getStatusBreakdown(installations, 'status')}

MAINTENANCE DATA:
${this.getStatusBreakdown(maintenances, 'status')}

Please provide analysis including:
1. Quality assessment
2. Installation success rate
3. Maintenance frequency and issues
4. Performance predictions
5. Recommendations

Format as JSON: {"summary": "...", "quality_score": "1-10", "issues": [...], "recommendations": [...], "alerts": [...]}`;
  }

  buildLotPrompt(data) {
    const { lot, vendor, batches, fittings, installations, maintenances } = data;
    
    return `Analyze the performance data for lot ${lot.lot_id}:

LOT DETAILS:
- Lot ID: ${lot.lot_id}
- Vendor: ${vendor ? vendor.vendor_name : 'Unknown'}
- Created: ${lot.created_at}
- Total Batches: ${batches.length}
- Total Fittings: ${fittings.length}

BATCH BREAKDOWN:
${batches.map(b => `- ${b.batch_id}: ${fittings.filter(f => f.batch_id === b.batch_id).length} items`).join('\n')}

INSTALLATION & MAINTENANCE:
${this.getStatusBreakdown(installations, 'status')}
${this.getStatusBreakdown(maintenances, 'status')}

Provide analysis including lot performance, batch comparison, and overall quality assessment.

Format as JSON: {"summary": "...", "performance": "...", "batch_analysis": [...], "recommendations": [...]}`;
  }

  buildPerformanceReportPrompt(data) {
    const { vendors, orders, lots, batches, fittings, installations, maintenances } = data;
    
    return `Generate a comprehensive performance report for the entire RailTrace system:

SYSTEM OVERVIEW:
- Total Vendors: ${vendors.length}
- Total Orders: ${orders.length}
- Total Lots: ${lots.length}
- Total Batches: ${batches.length}
- Total Fittings: ${fittings.length}
- Total Installations: ${installations.length}
- Total Maintenance Records: ${maintenances.length}

ORDER STATUS BREAKDOWN:
${this.getStatusBreakdown(orders, 'status')}

INSTALLATION STATUS BREAKDOWN:
${this.getStatusBreakdown(installations, 'status')}

MAINTENANCE STATUS BREAKDOWN:
${this.getStatusBreakdown(maintenances, 'status')}

VENDOR PERFORMANCE:
${vendors.map(v => {
  const vendorLots = lots.filter(l => l.vendor_id === v.vendor_id);
  const vendorBatches = batches.filter(b => vendorLots.some(l => l.lot_id === b.lot_id));
  const vendorFittings = fittings.filter(f => vendorBatches.some(b => b.batch_id === f.batch_id));
  return `- ${v.vendor_name}: ${vendorLots.length} lots, ${vendorBatches.length} batches, ${vendorFittings.length} fittings`;
}).join('\n')}

Provide a comprehensive system analysis including:
1. Overall system health and performance
2. Vendor performance comparison
3. Quality trends and patterns
4. Risk assessment and critical issues
5. Strategic recommendations
6. Priority action items

Format as JSON: {"executive_summary": "...", "system_health": "...", "vendor_performance": [...], "critical_issues": [...], "recommendations": [...], "action_items": [...]}`;
  }

  buildMaintenanceAlertsPrompt(data) {
    const { maintenances } = data;
    
    return `Analyze maintenance records to generate alerts and predictions:

MAINTENANCE OVERVIEW:
- Total Records: ${maintenances.length}
- Status Breakdown: ${this.getStatusBreakdown(maintenances, 'status')}

RECENT MAINTENANCE (Last 20):
${maintenances.slice(0, 20).map(m => 
  `- ${m.fitting_id}: ${m.status} - ${m.issue_description} (${m.reported_at})`
).join('\n')}

COMMON ISSUES:
${this.getCommonIssues(maintenances)}

Generate maintenance alerts including:
1. High-priority unresolved issues
2. Patterns in recurring problems
3. Predictive maintenance recommendations
4. Vendor performance issues
5. Component failure trends

Format as JSON: {"critical_alerts": [...], "predictive_alerts": [...], "vendor_issues": [...], "recommendations": [...]}`;
  }

  // Helper methods
  getStatusBreakdown(items, statusField) {
    const breakdown = {};
    items.forEach(item => {
      const status = item[statusField] || 'unknown';
      breakdown[status] = (breakdown[status] || 0) + 1;
    });
    return Object.entries(breakdown).map(([status, count]) => `- ${status}: ${count}`).join('\n');
  }

  getCommonIssues(maintenances) {
    const issues = {};
    maintenances.forEach(m => {
      const issue = m.issue_description?.toLowerCase() || 'unknown';
      issues[issue] = (issues[issue] || 0) + 1;
    });
    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([issue, count]) => `- ${issue}: ${count} occurrences`)
      .join('\n');
  }

  parseAIResponse(aiResponse) {
    try {
      // Try to parse as JSON first
      if (typeof aiResponse === 'string') {
        return JSON.parse(aiResponse);
      }
      // If it's already an object, return as is
      return aiResponse;
    } catch (error) {
      // If JSON parsing fails, return as text
      return {
        raw_response: aiResponse,
        parse_error: 'Could not parse as JSON'
      };
    }
  }
}

module.exports = new AIService();
