# AI Frontend Troubleshooting Guide

## 🚨 White Screen Issues

### Common Causes:
1. **AI_Integration service not running** - Most common cause
2. **JavaScript errors** - Check browser console
3. **Missing dependencies** - Run `npm install`
4. **Port conflicts** - Check if port 3001 is free

### Quick Fixes:

#### 1. Check if AI_Integration is running
```bash
# Test the AI service
curl http://localhost:3100/health

# If not running, start it:
cd AI_Integration
npm start
```

#### 2. Check browser console
- Press F12 to open Developer Tools
- Look for red error messages in Console tab
- Check Network tab for failed requests

#### 3. Reinstall dependencies
```bash
cd AI_frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 4. Test with simple page
- Go to `http://localhost:3001/test`
- If this works, the issue is with API calls
- If this doesn't work, there's a React/build issue

### Step-by-Step Debugging:

1. **Start AI_Integration first:**
   ```bash
   cd AI_Integration
   npm start
   # Should show: "AI Integration Service running on port 3100"
   ```

2. **Test AI service:**
   - Open: `http://localhost:3100/health`
   - Should return JSON with status

3. **Start AI Frontend:**
   ```bash
   cd AI_frontend
   npm run dev
   # Should show: "Local: http://localhost:3001"
   ```

4. **Check the test page:**
   - Go to: `http://localhost:3001/test`
   - Should show a simple test page

5. **Check the dashboard:**
   - Go to: `http://localhost:3001/`
   - Should show dashboard or service unavailable message

### Error Messages:

#### "Service Unavailable"
- AI_Integration is not running
- Start it with: `cd AI_Integration && npm start`

#### "Failed to fetch"
- Network connectivity issue
- Check if AI_Integration is running on port 3100

#### "Module not found"
- Missing dependencies
- Run: `npm install`

#### "Port already in use"
- Another service is using port 3001
- Kill the process or change port in vite.config.js

### Browser Console Errors:

#### CORS errors
- AI_Integration service not running
- Check if service is accessible

#### 404 errors
- API endpoints not found
- Check AI_Integration routes

#### 500 errors
- Server-side errors
- Check AI_Integration logs

### Quick Commands:

```bash
# Check what's running on ports
netstat -ano | findstr :3001
netstat -ano | findstr :3100

# Kill process on port 3001
taskkill /PID <PID_NUMBER> /F

# Start all services
start-all-services.bat

# Start just AI Frontend
start-ai-frontend.bat
```

### Still having issues?

1. Check the browser console for specific errors
2. Verify all services are running on correct ports
3. Try the test page first: `http://localhost:3001/test`
4. Check if the AI_Integration service is responding: `http://localhost:3100/health`
