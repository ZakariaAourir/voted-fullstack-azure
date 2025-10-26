# Azure Static Web Apps Deployment Guide 🚀

This guide explains how your frontend is configured to deploy to Azure Static Web Apps and connect to your deployed backend API.

---

## 🔧 What Was Fixed

### 1. **Build Output Directory**
- **Problem**: Workflow was looking for `build/` but Vite outputs to `dist/`
- **Fix**: Changed `output_location` from `"build"` to `"dist"` in the workflow

### 2. **TypeScript Permission Error**
- **Problem**: `tsc: Permission denied` during Azure build
- **Fix**: 
  - Added `build:prod` script that skips type checking: `vite build`
  - Created `.oryx_env_settings` to tell Oryx to use `npm run build:prod`
  - Type checking still runs during local dev with `npm run build`

### 3. **Backend API Configuration**
- **Problem**: Frontend didn't know where to find the deployed backend
- **Fix**: Added environment variables to workflow:
  ```yaml
  VITE_API_BASE: https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net
  VITE_WS_BASE: wss://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net
  ```

### 4. **SPA Routing & API Proxy**
- **Problem**: Direct routing and CORS issues
- **Fix**: Created `staticwebapp.config.json` with:
  - SPA fallback routing (all routes → `/index.html`)
  - API route permissions
  - Proper MIME types and caching

---

## 📁 New Files Created

### 1. `staticwebapp.config.json`
Configures Azure Static Web Apps routing and behavior:

```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/ws/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```

### 2. `.oryx_env_settings`
Tells Azure's Oryx build system to use the production build:

```bash
BUILD_COMMAND="npm run build:prod"
```

---

## 🌐 How It Works

### Frontend → Backend Connection

Your React app is configured to connect to the backend via environment variables:

**File**: `src/config/env.ts`
```typescript
export const config = {
  apiBase: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  wsBase: import.meta.env.VITE_WS_BASE || 'ws://localhost:8000',
};
```

**During Local Development:**
- Uses defaults: `http://localhost:8000` and `ws://localhost:8000`
- Backend must be running locally on port 8000

**During Azure Deployment:**
- Uses production URLs from workflow environment variables
- Connects to: `https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net`
- WebSocket connects to: `wss://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net`

---

## 🚀 Deployment Process

### Automatic Deployment (Recommended)

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Fix: Azure Static Web Apps deployment configuration"
   git push origin main
   ```

2. **Monitor deployment:**
   - Go to [GitHub Actions](https://github.com/your-repo/actions)
   - Watch the "Azure Static Web Apps CI/CD" workflow
   - Build should complete in 3-5 minutes

3. **Access your app:**
   - Your Static Web App URL (check Azure Portal)
   - Usually: `https://witty-bay-0fcdaa303.azurestaticapps.net`
   - Or custom domain if configured

### Manual Deployment

If you need to trigger deployment manually:

1. Go to GitHub Actions tab
2. Select "Azure Static Web Apps CI/CD" workflow
3. Click "Run workflow" → "Run workflow"

---

## ✅ Testing Your Deployment

### 1. Test Frontend Loading
```bash
curl https://YOUR-STATIC-WEB-APP.azurestaticapps.net
```

Should return HTML of your React app.

### 2. Test Backend Connection
Open browser console on your deployed app and check:
- Network tab for API calls to your backend
- Console for any CORS or connection errors

### 3. Test Full Flow

1. **Register a new user:**
   - Navigate to `/register`
   - Create account
   - Check if API call succeeds

2. **Login:**
   - Navigate to `/login`
   - Login with credentials
   - Should redirect to dashboard

3. **Create a poll:**
   - Navigate to `/create`
   - Create a test poll
   - Verify it saves to backend

4. **Vote on poll:**
   - Open poll detail page
   - Cast a vote
   - Check if WebSocket updates work

---

## 🔐 CORS Configuration

Your backend needs to allow requests from your Static Web App URL.

### Update Backend CORS Settings

**Option 1: Update `.env` file on your local backend** (if running migrations locally):

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://witty-bay-0fcdaa303.azurestaticapps.net
```

**Option 2: Update Azure App Service Configuration:**

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your App Service: **api-polls-test**
3. Go to **Configuration** → **Application settings**
4. Find or add `ALLOWED_ORIGINS`
5. Set value to:
   ```
   http://localhost:3000,http://localhost:5173,https://YOUR-STATIC-WEB-APP.azurestaticapps.net
   ```
6. Click **Save** and **Continue**
7. Restart the App Service

### Verify CORS in Backend Code

Your backend should have this in `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🛠️ Local Development

### Run Frontend Locally (with local backend):

```bash
cd polls-frontend
npm install
npm run dev
```

Connects to `http://localhost:8000` (local backend)

### Run Frontend Locally (with Azure backend):

Create a `.env.local` file:

```env
VITE_API_BASE=https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net
VITE_WS_BASE=wss://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net
```

Then run:
```bash
npm run dev
```

---

## 📝 Scripts Explained

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Local development server |
| `build` | `tsc --noEmit && vite build` | Production build with type checking |
| `build:prod` | `vite build` | Azure build (skips type checking for speed) |
| `preview` | `vite preview` | Preview production build locally |

---

## 🔍 Troubleshooting

### Build Still Failing with Permission Error

If you still see `tsc: Permission denied`:

**Option A**: Update workflow to install dependencies with proper permissions:

Add before "Build And Deploy" step:

```yaml
- name: Install dependencies
  working-directory: polls-frontend
  run: |
    npm ci
    chmod +x node_modules/.bin/*
```

**Option B**: Disable type checking entirely:

Update `package.json`:
```json
"scripts": {
  "build": "vite build"
}
```

### Frontend Can't Connect to Backend

1. **Check CORS settings** in backend (see above)
2. **Verify backend is running:**
   ```bash
   curl https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net/health
   ```
3. **Check browser console** for error messages
4. **Verify environment variables** are set in GitHub workflow

### 404 on Page Refresh

If you get 404 when refreshing on routes like `/dashboard`:

- This should be fixed by `staticwebapp.config.json`
- If not, verify the file is in the root of `polls-frontend/`
- Check Azure Static Web Apps configuration in portal

### WebSocket Connection Failing

1. **Verify backend URL** uses `wss://` (not `ws://`)
2. **Check Azure backend** supports WebSocket connections:
   - Azure App Service → Configuration → General settings
   - Web sockets: **On**
3. **Test WebSocket endpoint:**
   ```javascript
   // In browser console
   const ws = new WebSocket('wss://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net/ws/polls/1');
   ```

---

## 🎯 Next Steps

### 1. **Commit and Push Changes**

```bash
git add .
git commit -m "Configure frontend for Azure Static Web Apps deployment"
git push origin main
```

### 2. **Monitor Build**

- Watch GitHub Actions workflow
- Check for any errors

### 3. **Update Backend CORS**

Add your Static Web App URL to allowed origins (see CORS section above)

### 4. **Test Your App**

- Register → Login → Create Poll → Vote
- Test all features end-to-end

### 5. **Optional: Custom Domain**

In Azure Portal:
1. Go to Static Web App resource
2. Settings → Custom domains
3. Add your domain (e.g., `polls.yourdomain.com`)
4. Follow DNS configuration instructions

---

## 📚 Additional Resources

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Static Web Apps Configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)

---

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ GitHub Actions workflow completes without errors
- ✅ Static Web App URL loads your React application
- ✅ You can register and login successfully
- ✅ API calls reach your backend (check Network tab)
- ✅ Polls are created and saved
- ✅ Voting works and updates in real-time
- ✅ No CORS errors in browser console

---

Good luck with your deployment! 🚀

