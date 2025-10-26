# Azure Environment Variables Setup

## Required Environment Variables for Azure App Service

Go to your Azure App Service → **Configuration** → **Application settings** and add these:

### 1. Database Configuration
```
DATABASE_URL = postgresql://username:password@your-server.postgres.database.azure.com:5432/your-database-name?sslmode=require
```
**Important**: Replace with your actual Azure PostgreSQL connection string.

### 2. CORS Configuration
```
ALLOWED_ORIGINS = https://your-frontend-domain.com,https://www.your-frontend-domain.com
```
**Format**: Comma-separated list of allowed origins (no spaces between commas)

### 3. JWT Configuration
```
JWT_SECRET = your-super-secret-random-string-here-make-it-long-and-random
JWT_EXPIRES_MIN = 60
REFRESH_EXPIRES_DAYS = 7
```
**Important**: Generate a strong random secret. You can use:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Build Configuration (Already set)
These should already be configured if you followed the deployment guide:
```
SCM_DO_BUILD_DURING_DEPLOYMENT = true
ENABLE_ORYX_BUILD = true
```

## Startup Command
In **Configuration** → **General Settings** → **Startup Command**:
```
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --timeout 120
```

## After Adding Environment Variables
1. Click **Save** in Azure Portal
2. The app will automatically restart
3. Check **Log stream** for any errors
4. Visit your API URL to verify it's working

## Testing Your Configuration
Once deployed, test these endpoints:
- `https://your-app.azurewebsites.net/` - Should return: `{"message": "Welcome to Polls API"}`
- `https://your-app.azurewebsites.net/health` - Should return: `{"status": "healthy"}`
- `https://your-app.azurewebsites.net/docs` - Should show API documentation

