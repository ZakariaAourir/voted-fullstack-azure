# 🚀 Full Stack Deployment Checklist

Quick checklist to deploy both backend and frontend to Azure.

---

## ✅ Backend Deployment (Azure App Service)

### Prerequisites
- [x] Azure App Service created: `api-polls-test`
- [x] PostgreSQL database created and configured
- [x] GitHub secrets configured
- [x] `.github/workflows/deploy-backend.yml` exists

### Environment Configuration

**In Azure Portal → App Service → Configuration → Application settings:**

| Setting | Value | Status |
|---------|-------|--------|
| `DATABASE_URL` | `postgresql+psycopg2://user:pass@server.postgres.database.azure.com:5432/dbname?sslmode=require` | ⚠️ Verify |
| `JWT_SECRET` | Your secure JWT secret | ⚠️ Verify |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173,https://YOUR-SWA.azurestaticapps.net` | ⚠️ Update with SWA URL |

### Backend Verification

- [ ] Health check works: `https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net/health`
- [ ] Authentication is **OFF** (or set to "Allow unauthenticated")
- [ ] Database migrations applied: `python -m alembic upgrade head`
- [ ] API docs accessible: `https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net/docs`
- [ ] Web Sockets enabled (Configuration → General settings → Web sockets: **On**)

---

## ✅ Frontend Deployment (Static Web Apps)

### Prerequisites
- [x] Azure Static Web App created
- [x] GitHub workflow auto-generated
- [x] GitHub secrets configured

### Files Updated/Created

- [x] `.github/workflows/azure-static-web-apps-witty-bay-0fcdaa303.yml` - Fixed output directory and added env vars
- [x] `polls-frontend/staticwebapp.config.json` - SPA routing configuration
- [x] `polls-frontend/.oryx_env_settings` - Oryx build configuration
- [x] `polls-frontend/package.json` - Added `build:prod` script

### Environment Configuration

**In workflow file (`.github/workflows/azure-static-web-apps-*.yml`):**

```yaml
env:
  VITE_API_BASE: https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net
  VITE_WS_BASE: wss://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net
```

### Frontend Verification

- [ ] GitHub Actions workflow completes successfully
- [ ] Static Web App URL loads: `https://YOUR-SWA.azurestaticapps.net`
- [ ] No 404 errors on page refresh
- [ ] Browser console shows no CORS errors
- [ ] API calls reach backend (check Network tab)

---

## 🔗 Integration Checklist

### 1. Update Backend CORS

**Add your Static Web App URL to backend allowed origins:**

```bash
# In Azure App Service Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://witty-bay-0fcdaa303.azurestaticapps.net
```

- [ ] CORS settings updated
- [ ] App Service restarted after CORS change

### 2. Test Full Integration

**User Authentication:**
- [ ] Register new user from frontend
- [ ] Login works
- [ ] Token stored in localStorage
- [ ] Protected routes work (dashboard, create poll)

**Poll Management:**
- [ ] Create new poll
- [ ] View polls list
- [ ] View poll details
- [ ] Edit own polls
- [ ] Delete own polls

**Voting:**
- [ ] Cast vote on poll
- [ ] Vote updates in real-time (WebSocket)
- [ ] Results chart updates correctly
- [ ] Cannot vote twice (enforced by backend)

**WebSocket:**
- [ ] WebSocket connects successfully
- [ ] Real-time updates work
- [ ] Reconnection works after disconnect

---

## 🐛 Common Issues & Solutions

### Backend Issues

| Issue | Solution |
|-------|----------|
| 401 on `/health` | Disable App Service Authentication or set to "Allow unauthenticated" |
| "Could not translate host name" | Check DATABASE_URL in App Service configuration |
| CORS errors | Update ALLOWED_ORIGINS with frontend URL |
| WebSocket not working | Enable Web Sockets in App Service settings |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| `tsc: Permission denied` | Workflow now uses `build:prod` script (skips type checking) |
| Wrong output directory | Changed from `build` to `dist` in workflow |
| 404 on page refresh | `staticwebapp.config.json` handles SPA routing |
| Can't connect to API | Verify `VITE_API_BASE` in workflow environment variables |

---

## 📋 Deployment Steps (In Order)

### Step 1: Database Setup
```bash
# Local machine with Azure PostgreSQL credentials
cd polls-backend
# Create .env with DATABASE_URL
python -m alembic upgrade head
```

### Step 2: Deploy Backend
```bash
# Commit and push (triggers GitHub Actions)
git add .
git commit -m "Backend ready for deployment"
git push origin main

# Or trigger manually from GitHub Actions UI
```

### Step 3: Verify Backend
```bash
# Test health endpoint
curl https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net/health

# Test API docs
# Open: https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net/docs
```

### Step 4: Update Backend CORS
```
1. Azure Portal → App Service → Configuration
2. Update ALLOWED_ORIGINS with Static Web App URL
3. Save and Restart
```

### Step 5: Deploy Frontend
```bash
# Commit and push (triggers GitHub Actions)
git add polls-frontend/
git commit -m "Frontend configured for Azure deployment"
git push origin main

# Monitor: https://github.com/your-repo/actions
```

### Step 6: Test Everything
```
1. Open Static Web App URL
2. Register → Login → Create Poll → Vote
3. Check browser console for errors
4. Verify WebSocket real-time updates
```

---

## 🎯 URLs Reference

| Service | URL | Status |
|---------|-----|--------|
| **Backend API** | https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net | ⚠️ Verify |
| **API Docs** | https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net/docs | ⚠️ Verify |
| **Health Check** | https://api-polls-test-fwdwerddd6b6echt.francecentral-01.azurewebsites.net/health | ⚠️ Verify |
| **Frontend** | https://YOUR-SWA.azurestaticapps.net | ⚠️ Update |
| **Database** | YOUR-SERVER.postgres.database.azure.com | ⚠️ Verify |

---

## 📞 Getting Help

### Check Logs

**Backend Logs:**
```
Azure Portal → App Service → Log stream
```

**Frontend Build Logs:**
```
GitHub → Actions → Select workflow run
```

### Test Endpoints Locally

**Backend:**
```bash
cd polls-backend
python run.py
# Test: http://localhost:8000/health
```

**Frontend:**
```bash
cd polls-frontend
npm run dev
# Open: http://localhost:3000
```

---

## ✨ Success!

Your application is fully deployed when:

- ✅ Backend health check returns `{"status": "healthy"}`
- ✅ Frontend loads without errors
- ✅ Users can register and login
- ✅ Polls can be created and voted on
- ✅ Real-time updates work via WebSocket
- ✅ No CORS errors in browser console

---

**Next Steps After Deployment:**

1. Set up custom domains (optional)
2. Configure SSL certificates (handled by Azure)
3. Set up monitoring and alerts
4. Configure automatic backups for database
5. Implement CI/CD for staging environment
6. Add application insights for analytics

🎉 **Happy Deploying!**

