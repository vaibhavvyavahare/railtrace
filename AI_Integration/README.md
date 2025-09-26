# AI Integration Service

Express.js service for integrating Sarvam AI APIs with RailTrace database to generate performance summaries, alerts, and analytics.

## Features

- **Vendor Performance Analysis**: AI-powered summaries of vendor performance
- **Batch/Lot Analytics**: Detailed analysis of batch and lot performance
- **Maintenance Alerts**: Predictive maintenance and issue detection
- **System Reports**: Comprehensive performance reports
- **Health Monitoring**: Service health checks and dependency monitoring

## Setup

1. **Install Dependencies**
   ```bash
   cd AI_Integration
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file with:
   ```env
   PORT=3100
   NODE_ENV=development
   
   # Database Configuration
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=railtrace_db
   PGUSER=postgres
   PGPASSWORD=your_password_here
   
   # Sarvam AI Configuration
   SARVAM_API_KEY=your_sarvam_api_key_here
   SARVAM_BASE_URL=https://api.sarvam.ai
   ```

3. **Start the Service**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health with dependencies

### AI Analysis
- `GET /api/ai/vendor/:vendorId/summary` - Vendor performance summary
- `GET /api/ai/batch/:batchId/summary` - Batch performance summary
- `GET /api/ai/lot/:lotId/summary` - Lot performance summary
- `GET /api/ai/performance/report` - System-wide performance report
- `GET /api/ai/alerts/maintenance` - Maintenance alerts and predictions

## Usage Examples

### Get Vendor Summary
```bash
curl http://localhost:3100/api/ai/vendor/V-001/summary
```

### Get Batch Analysis
```bash
curl http://localhost:3100/api/ai/batch/V-001-LOT-1-B1/summary
```

### Get System Performance Report
```bash
curl http://localhost:3100/api/ai/performance/report
```

## Integration with Frontend

The service is designed to work with the RailTrace frontend. The `AIIntegration.jsx` component can call these endpoints to display AI-generated reports and analytics.

## Dependencies

- **Express.js**: Web framework
- **PostgreSQL**: Database client
- **Axios**: HTTP client for Sarvam AI
- **Helmet**: Security middleware
- **Morgan**: Logging middleware
- **CORS**: Cross-origin resource sharing

## Sarvam AI Integration

The service integrates with Sarvam AI APIs for:
- Text completion and analysis
- Chat completions
- Text translation
- Performance predictions

Make sure to set your `SARVAM_API_KEY` in the environment variables.

## Error Handling

The service includes comprehensive error handling:
- Database connection errors
- Sarvam AI API errors
- Invalid request parameters
- Service health monitoring

## Development

For development with auto-restart:
```bash
npm run dev
```

The service will automatically restart when files change.
