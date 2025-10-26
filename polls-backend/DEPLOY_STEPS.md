# Azure Backend Deployment - Step by Step (Code Path)

## ✅ Prerequisites Checklist

- [x] Backend structure ready (`polls-backend/` folder)
- [x] `requirements.txt` configured with gunicorn
- [x] `app/main.py` with FastAPI app
- [x] `app/db.py` with Azure PostgreSQL SSL support
- [x] Azure PostgreSQL database created
- [ ] Azure subscription & Resource Group
- [ ] GitHub repository with your code
- [ ] Azure PostgreSQL connection string

---

## 📋 Step-by-Step Deployment

### **STEP 0: Verify Your Backend Structure** ✅

Your current structure is good! You have:
```
polls-backend/
  ✅ app/
     ✅ main.py
     ✅ db.py
     ✅ models.py
     ✅ auth/, polls/ (routers)
  ✅ migrations/ (alembic)
  ✅ alembic.ini
  ✅ requirements.txt
  ✅ startup.txt
```

---

### **STEP 1: Create Azure App Service (Linux)**

#### 1.1 Go to Azure Portal
- Navigate to: https://portal.azure.com
- Click **"Create a resource"** → Search for **"Web App"** → Click **Create**

#### 1.2 Fill in Basic Settings

| Field | Value |
|-------|-------|
| **Subscription** | Your Azure subscription |
| **Resource Group** | Create new or use existing (e.g., `rg-polls-dev`) |
| **Name** | `app-polls-api-dev` (or your preferred name) |
| **Publish** | **Code** ⚠️ Important! |
| **Runtime stack** | **Python 3.12** (or 3.11) |
| **Operating System** | **Linux** |
| **Region** | Same as your PostgreSQL database |

#### 1.3 App Service Plan
- Click **"Create new"**
- Name: `asp-polls-dev`
- Pricing tier: **B1** (Basic, ~$13/month) for dev, or **F1** (Free) for testing
- Click **Review + Create** → **Create**

⏳ Wait 1-2 minutes for deployment to complete.

---

### **STEP 2: Configure App Service**

#### 2.1 Enable WebSockets (Required for real-time features)

1. Go to your App Service: `app-polls-api-dev`
2. Left menu → **Configuration** → **General settings** tab
3. Set **Web sockets** = **On**
4. Click **Save** at the top → **Continue**

#### 2.2 Add Application Settings (Environment Variables)

1. Still in **Configuration** → **Application settings** tab
2. Click **+ New application setting** for each:

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | `postgresql+psycopg2://user@server:password@server.postgres.database.azure.com:5432/dbname` | Replace with your Azure PostgreSQL connection string |
| `JWT_SECRET` | `generate-a-strong-random-secret-here-min-32-chars` | Use a secure random string |
| `JWT_EXPIRES_MIN` | `15` | Token expiry in minutes |
| `REFRESH_EXPIRES_DAYS` | `7` | Refresh token expiry |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://yourapp.azurestaticapps.net` | Add your frontend URLs (comma-separated) |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` | Tells Azure to install dependencies |
| `PYTHON_VERSION` | `3.12` | Or 3.11 based on what you selected |

**Important:** Replace:
- `user@server`, `password`, `server`, `dbname` with your actual Azure PostgreSQL details
- Generate a secure `JWT_SECRET`: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

3. Click **Save** at the top → **Continue**

#### 2.3 Set Startup Command

1. Still in **Configuration** → **General settings** tab
2. Find **Startup Command** field
3. Enter:
```bash
gunicorn -k uvicorn.workers.UvicornWorker --bind=0.0.0.0:8000 app.main:app
```
4. Click **Save** → **Continue**

---

### **STEP 3: Deploy Code via GitHub Actions**

#### 3.1 Connect GitHub Repository

1. In your App Service → Left menu → **Deployment Center**
2. **Source**: Select **GitHub**
3. Sign in to GitHub if prompted
4. Configure:
   - **Organization**: Your GitHub username/org
   - **Repository**: `voted` (your repo name)
   - **Branch**: `main`
5. Click **Save**

Azure will automatically create a GitHub Actions workflow file.

#### 3.2 Download Publish Profile

1. In App Service → **Overview** page
2. Click **Get publish profile** at the top
3. Save the downloaded `.PublishSettings` file

#### 3.3 Add Publish Profile to GitHub Secrets

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/voted
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
   - **Name**: `AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND`
   - **Value**: Paste the entire contents of the `.PublishSettings` file
4. Click **Add secret**

#### 3.4 Create GitHub Actions Workflow

Create this file in your repository:

**File:** `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths: 
      - 'polls-backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:  # Allow manual trigger

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.12'
    
    - name: Install dependencies
      working-directory: polls-backend
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run tests (optional)
      working-directory: polls-backend
      run: |
        # pip install pytest pytest-asyncio
        # pytest tests/
        echo "Tests skipped for now"
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v3
      with:
        app-name: 'app-polls-api-dev'  # Change to your app name
        publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND }}
        package: polls-backend
```

#### 3.5 Commit and Push

```powershell
# In your project root (voted/)
git add .github/workflows/deploy-backend.yml
git add polls-backend/
git commit -m "Setup Azure deployment for backend"
git push origin main
```

This will trigger the deployment automatically!

---

### **STEP 4: Run Database Migrations**

After the first deployment, you need to create the database tables.

#### Option A: Using Azure SSH Console (Recommended)

1. Go to App Service → **SSH** (or **Console**) in left menu
2. Wait for SSH to connect
3. Run these commands:

```bash
cd /home/site/wwwroot
python -m alembic upgrade head
```

You should see output like:
```
INFO [alembic.runtime.migration] Running upgrade -> 001, Initial migration
INFO [alembic.runtime.migration] Running upgrade 001 -> head
```

#### Option B: Using Azure CLI (from your local machine)

```powershell
# Install Azure CLI if not installed: https://aka.ms/installazurecli

# Login
az login

# Run command on Azure App Service
az webapp ssh --name app-polls-api-dev --resource-group rg-polls-dev --command "cd /home/site/wwwroot && python -m alembic upgrade head"
```

---

### **STEP 5: Test Your Deployment** 🧪

#### 5.1 Health Check

Open in browser:
```
https://app-polls-api-dev.azurewebsites.net/health
```

Expected response:
```json
{"status": "healthy"}
```

#### 5.2 API Documentation

```
https://app-polls-api-dev.azurewebsites.net/docs
```

You should see the Swagger UI with all your endpoints.

#### 5.3 Test Registration

Using PowerShell:
```powershell
$body = @{
    email = "test@example.com"
    name = "Test User"
    password = "testpass123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://app-polls-api-dev.azurewebsites.net/auth/register" -Method POST -Body $body -ContentType "application/json"
```

#### 5.4 Test WebSocket Connection

WebSocket URL:
```
wss://app-polls-api-dev.azurewebsites.net/ws/polls/{poll_id}?token={jwt_token}
```

---

### **STEP 6: Monitor & Debug** 📊

#### View Logs

**Option 1: Log Stream (Real-time)**
1. App Service → **Log stream**
2. Watch logs in real-time

**Option 2: Azure CLI**
```powershell
az webapp log tail --name app-polls-api-dev --resource-group rg-polls-dev
```

#### Enable Application Insights

1. App Service → **Application Insights**
2. Click **Turn on Application Insights**
3. Create new or use existing
4. Click **Apply**

View metrics:
- Requests, response times
- Failed requests
- Live metrics
- Database queries

---

## 🔄 Updating Your App

After making code changes:

```powershell
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions will automatically deploy to Azure!

---

## 📝 Quick Reference

### Your App URLs
- **API Base**: `https://app-polls-api-dev.azurewebsites.net`
- **Health**: `https://app-polls-api-dev.azurewebsites.net/health`
- **Docs**: `https://app-polls-api-dev.azurewebsites.net/docs`
- **WebSocket**: `wss://app-polls-api-dev.azurewebsites.net/ws/polls/{poll_id}`

### Important Commands

**View logs:**
```powershell
az webapp log tail --name app-polls-api-dev --resource-group rg-polls-dev
```

**Restart app:**
```powershell
az webapp restart --name app-polls-api-dev --resource-group rg-polls-dev
```

**Run migrations:**
```powershell
az webapp ssh --name app-polls-api-dev --resource-group rg-polls-dev
# Then: cd /home/site/wwwroot && alembic upgrade head
```

**Update environment variable:**
```powershell
az webapp config appsettings set --name app-polls-api-dev --resource-group rg-polls-dev --settings JWT_SECRET="new-secret"
```

---

## 🐛 Common Issues

### Issue: "Application Error"
- Check logs in Log Stream
- Verify all environment variables are set
- Check startup command is correct

### Issue: "Cannot connect to database"
- Verify `DATABASE_URL` is correct
- Check Azure PostgreSQL firewall allows Azure services
- Ensure `?sslmode=require` is in connection string

### Issue: "Module not found"
- Verify `requirements.txt` includes all dependencies
- Check `SCM_DO_BUILD_DURING_DEPLOYMENT=true` is set
- Try redeploying

### Issue: WebSocket fails
- Verify WebSockets are enabled in Configuration
- Check CORS `ALLOWED_ORIGINS` includes your frontend

---

## ✅ Deployment Checklist

- [ ] App Service created with Python runtime
- [ ] WebSockets enabled
- [ ] All environment variables configured
- [ ] Startup command set
- [ ] GitHub Actions workflow created
- [ ] Publish profile added to GitHub secrets
- [ ] Code pushed and deployed
- [ ] Database migrations run
- [ ] Health check returns OK
- [ ] API docs accessible
- [ ] Test registration works
- [ ] Application Insights enabled

---

## 🎉 Next Steps

1. **Update Frontend** to use Azure backend URL
2. **Deploy Frontend** to Azure Static Web Apps
3. **Update CORS** to include frontend URL
4. **Set up custom domain** (optional)
5. **Enable SSL** (automatic with Azure)
6. **Configure CI/CD** for automated testing

Your backend is now live on Azure! 🚀

