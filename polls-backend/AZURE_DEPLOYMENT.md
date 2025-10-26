# Azure Deployment Guide for Polls Backend

## ✅ Prerequisites Completed

1. ✅ Azure PostgreSQL Database created
2. ✅ Environment variables configured
3. ✅ Alembic configured for Azure
4. ✅ SSL mode enabled
5. ✅ Production server (Gunicorn) added
6. ✅ Startup command configured

---

## 📋 Step-by-Step Deployment

### 1. Create `.env` File Locally (for testing)

Create `polls-backend/.env`:

```env
DATABASE_URL=postgresql+psycopg2://username@servername:password@servername.postgres.database.azure.com:5432/dbname
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_MIN=15
REFRESH_EXPIRES_DAYS=7
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Important:** Replace with your actual Azure PostgreSQL credentials.

### 2. Run Migrations to Azure Database

```bash
cd polls-backend
pip install -r requirements.txt
alembic upgrade head
```

This will create all tables in your Azure PostgreSQL database.

### 3. Create Azure App Service

#### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Create **App Service**
3. Settings:
   - **Runtime**: Python 3.11 (or 3.10)
   - **Region**: Same as your database
   - **OS**: Linux
   - **Plan**: Basic B1 or higher

#### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create --name polls-backend-rg --location eastus

# Create App Service Plan
az appservice plan create \
  --name polls-backend-plan \
  --resource-group polls-backend-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name polls-backend-app \
  --resource-group polls-backend-rg \
  --plan polls-backend-plan \
  --runtime "PYTHON:3.11"
```

### 4. Configure Environment Variables in Azure

In Azure Portal → App Service → Configuration → Application settings:

Add these variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql+psycopg2://user@server:password@server.postgres.database.azure.com:5432/dbname` |
| `JWT_SECRET` | Your secure secret key |
| `JWT_EXPIRES_MIN` | `15` |
| `REFRESH_EXPIRES_DAYS` | `7` |
| `ALLOWED_ORIGINS` | `https://your-frontend-url.azurewebsites.net,http://localhost:5173` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `PYTHON_VERSION` | `3.11` |

**Or using CLI:**

```bash
az webapp config appsettings set \
  --name polls-backend-app \
  --resource-group polls-backend-rg \
  --settings \
    DATABASE_URL="postgresql+psycopg2://..." \
    JWT_SECRET="your-secret" \
    JWT_EXPIRES_MIN="15" \
    REFRESH_EXPIRES_DAYS="7" \
    ALLOWED_ORIGINS="https://your-frontend.azurewebsites.net"
```

### 5. Configure Startup Command

In Azure Portal → App Service → Configuration → General settings:

**Startup Command:**
```
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --timeout 120
```

Or it will read from `startup.txt` automatically.

### 6. Deploy Code to Azure

#### Option A: Git Deployment (Recommended)

```bash
# Initialize git (if not done)
cd polls-backend
git init
git add .
git commit -m "Ready for Azure deployment"

# Get Azure Git URL
az webapp deployment source config-local-git \
  --name polls-backend-app \
  --resource-group polls-backend-rg

# Add Azure remote and push
git remote add azure <GIT_URL_FROM_PREVIOUS_COMMAND>
git push azure main
```

#### Option B: ZIP Deployment

```bash
# Create deployment package (exclude unnecessary files)
cd polls-backend
zip -r deploy.zip . -x "*.pyc" "__pycache__/*" "test*" ".env" "test.db"

# Deploy
az webapp deployment source config-zip \
  --name polls-backend-app \
  --resource-group polls-backend-rg \
  --src deploy.zip
```

### 7. Run Migrations on Azure (First Time Only)

After deployment, run migrations on Azure:

```bash
az webapp ssh --name polls-backend-app --resource-group polls-backend-rg

# Inside Azure SSH
cd /home/site/wwwroot
python -m alembic upgrade head
exit
```

### 8. Verify Deployment

Visit your app:
- **API**: `https://polls-backend-app.azurewebsites.net/`
- **Health Check**: `https://polls-backend-app.azurewebsites.net/health`
- **API Docs**: `https://polls-backend-app.azurewebsites.net/docs`

---

## 🔧 Azure-Specific Configuration Files

### Files Created/Modified:
- ✅ `startup.txt` - Tells Azure how to start the app
- ✅ `requirements.txt` - Added Gunicorn
- ✅ `app/config.py` - Reads from `.env`
- ✅ `app/db.py` - SSL mode for Azure PostgreSQL
- ✅ `migrations/env.py` - Alembic uses environment variables

---

## 🛡️ Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update `ALLOWED_ORIGINS` to include only your frontend URL
- [ ] Enable HTTPS only in Azure App Service
- [ ] Configure Azure PostgreSQL firewall rules
- [ ] Enable Azure App Service authentication (optional)

---

## 📊 Monitoring & Logs

### View Logs:
```bash
az webapp log tail \
  --name polls-backend-app \
  --resource-group polls-backend-rg
```

### Enable Application Insights:
In Azure Portal → App Service → Application Insights → Enable

---

## 🔄 Update Deployment

After making code changes:

```bash
git add .
git commit -m "Your changes"
git push azure main
```

Azure will automatically rebuild and restart your app.

---

## 🐛 Troubleshooting

### App won't start:
1. Check logs: `az webapp log tail`
2. Verify `DATABASE_URL` is set correctly
3. Check startup command is correct

### Database connection fails:
1. Verify Azure PostgreSQL firewall allows App Service
2. Check SSL mode is in connection string
3. Verify credentials are correct

### CORS errors:
1. Add your frontend URL to `ALLOWED_ORIGINS`
2. Make sure to restart the app after config changes

---

## 📱 Next Steps: Frontend Deployment

After backend is deployed:
1. Update frontend `src/api/config.ts` with Azure backend URL
2. Deploy frontend to Azure Static Web Apps or App Service
3. Update backend `ALLOWED_ORIGINS` with frontend URL


