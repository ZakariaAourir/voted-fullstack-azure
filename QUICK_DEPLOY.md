# ⚡ Quick Deploy Guide

**TL;DR** - Copy-paste commands to deploy your app.

---

## 🎯 Current Status

✅ **Backend**: Deployed to Azure App Service  
🔧 **Frontend**: Ready to deploy (files configured)  
⚠️ **Next**: Commit changes and update CORS

---

## 📝 What Changed

### Files Modified:
1. `.github/workflows/azure-static-web-apps-witty-bay-0fcdaa303.yml` - Fixed build configuration
2. `polls-frontend/package.json` - Added production build script

### Files Created:
1. `polls-frontend/staticwebapp.config.json` - SPA routing
2. `polls-frontend/.oryx_env_settings` - Build command override
3. `DEPLOYMENT_CHECKLIST.md` - Full checklist
4. `polls-frontend/AZURE_DEPLOYMENT_GUIDE.md` - Detailed guide

---

## 🚀 Deploy Now (3 Steps)

### Step 1: Commit and Push

```bash
# Add all changes
git add .

# Commit
git commit -m "Configure frontend for Azure Static Web Apps deployment"

# Push (triggers deployment)
git push origin main
```

### Step 2: Monitor Build

**Option A: Command Line**
```bash
# Open GitHub Actions in browser
start https://github.com/YOUR-USERNAME/YOUR-REPO/actions
```

**Option B: GitHub Web**
1. Go to your repository on GitHub
2. Click "Actions" tab
3. Watch "Azure Static Web Apps CI/CD" workflow
4. Wait for green checkmark (3-5 minutes)

### Step 3: Update Backend CORS

**In Azure Portal:**

1. **Navigate**:
   ```
   Azure Portal → App Services → api-polls-test → Configuration → Application settings
   ```

2. **Find/Edit `ALLOWED_ORIGINS`**:
   ```
   http://localhost:3000,http://localhost:5173,https://YOUR-STATIC-WEB-APP.azurestaticapps.net
   ```
   
   Replace `YOUR-STATIC-WEB-APP` with your actual URL from Azure Portal.

3. **Save & Restart**:
   - Click "Save"
   - Click "Continue" on warning
   - Click "Restart" (top menu)

---

## 🧪 Test Your Deployment

### 1. Find Your Frontend URL

**Azure Portal:**
```
Azure Portal → Static Web Apps → [Your SWA] → Overview → URL
```

**Example:** `https://witty-bay-0fcdaa303.azurestaticapps.net`

### 2. Test Health Check

```bash
curl https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net/health
```

**Expected:**
```json
{"status":"healthy"}
```

### 3. Test Frontend

Open your Static Web App URL in browser:
```
https://YOUR-SWA.azurestaticapps.net
```

**What to test:**
1. ✅ Page loads without errors
2. ✅ Register a new account
3. ✅ Login with credentials
4. ✅ Create a new poll
5. ✅ Vote on the poll
6. ✅ See real-time updates

### 4. Check Browser Console

Press `F12` → Console tab

**Should NOT see:**
- ❌ CORS errors
- ❌ 401 Unauthorized (except for protected routes without login)
- ❌ Failed to fetch errors

**Should see:**
- ✅ WebSocket connected
- ✅ Successful API requests (200 status)

---

## 🐛 Quick Fixes

### Build Still Failing?

**Check workflow file:**
```bash
# View the workflow
cat .github/workflows/azure-static-web-apps-witty-bay-0fcdaa303.yml

# Look for:
# - output_location: "dist" (not "build")
# - env: VITE_API_BASE and VITE_WS_BASE
```

**Re-trigger deployment:**
```bash
# Make empty commit
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

### CORS Errors in Browser?

**Update backend CORS (see Step 3 above)**

**Or via Azure CLI:**
```bash
az webapp config appsettings set \
  --name api-polls-test \
  --resource-group YOUR-RESOURCE-GROUP \
  --settings ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,https://YOUR-SWA.azurestaticapps.net"
```

### WebSocket Not Connecting?

**Enable WebSockets in App Service:**

1. Azure Portal → App Service → Configuration
2. General settings tab
3. Web sockets: **On**
4. Save and Restart

### 404 on Page Refresh?

**Verify `staticwebapp.config.json` exists:**
```bash
ls polls-frontend/staticwebapp.config.json
```

If missing, it was created in this session - make sure you committed it.

---

## 📋 Environment Variables Reference

### Backend (Azure App Service)

**Required in App Service Configuration:**

```env
DATABASE_URL=postgresql+psycopg2://user:pass@server.postgres.database.azure.com:5432/dbname?sslmode=require
JWT_SECRET=your-super-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://YOUR-SWA.azurestaticapps.net
```

### Frontend (GitHub Workflow)

**Already configured in workflow:**

```yaml
env:
  VITE_API_BASE: https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net
  VITE_WS_BASE: wss://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net
```

---

## 🎉 That's It!

Your app should now be fully deployed and working.

**Full documentation:**
- 📖 `DEPLOYMENT_CHECKLIST.md` - Complete checklist
- 📖 `polls-frontend/AZURE_DEPLOYMENT_GUIDE.md` - Detailed guide
- 📖 `polls-backend/DATABASE_SWITCHING_GUIDE.md` - Database configuration

---

## 🆘 Still Having Issues?

### Check GitHub Actions Logs

```bash
# GitHub → Actions → Select failed run → View logs
```

Look for:
- Red X marks (failures)
- Error messages in build output
- Missing environment variables

### Check Azure Logs

**Backend:**
```
Azure Portal → App Service → Log stream
```

**Frontend:**
```
Azure Portal → Static Web Apps → Functions (for runtime logs)
```

### Local Testing

**Test backend locally:**
```bash
cd polls-backend
python run.py
curl http://localhost:8000/health
```

**Test frontend locally:**
```bash
cd polls-frontend
npm run dev
# Opens http://localhost:3000
```

---

**Need more help?** Check the detailed guides or Azure documentation.

Good luck! 🚀

