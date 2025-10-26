# 🚀 START HERE - Deploy Your Backend to Azure

## 📚 Documentation Files

I've created **4 documents** to help you deploy:

### 1. **DEPLOYMENT_CHECKLIST.txt** ⭐ START HERE!
   - Simple printable checklist
   - Check off each step as you complete it
   - Perfect for following along

### 2. **DEPLOY_STEPS.md**
   - Detailed step-by-step guide
   - Code examples and screenshots
   - Troubleshooting section

### 3. **AZURE_DEPLOYMENT.md**
   - Complete Azure deployment guide
   - Container path instructions (for later)
   - Advanced configuration

### 4. **SWITCH_TO_AZURE.md**
   - How to switch from SQLite to Azure PostgreSQL locally
   - For testing before deployment

---

## ⚡ Quick Start (Code Path)

### What You Need:
1. ✅ Azure subscription
2. ✅ Azure PostgreSQL database (you already created this!)
3. ✅ GitHub account with your code
4. ✅ 30 minutes of time

### Follow These Steps:

**1. Print the checklist:**
   - Open: `DEPLOYMENT_CHECKLIST.txt`
   - Print it or keep it on second screen

**2. Follow the checklist:**
   - Go through each checkbox
   - Detailed help in `DEPLOY_STEPS.md`

**3. Your backend will be live at:**
   ```
   https://YOUR-APP-NAME.azurewebsites.net
   ```

---

## 🔑 Important Info for Step 3

When you add environment variables in Azure, use these values:

### Your Generated JWT Secret:
```
uk-qeIVr7um4TVMMvnwKnT8JSDdz-W3nGGs2_Ki7voY
```
*(Generated securely - save this!)*

### DATABASE_URL Format:
```
postgresql+psycopg2://username@servername:password@servername.postgres.database.azure.com:5432/dbname
```

**Replace:**
- `username` - Your Azure PostgreSQL admin username
- `password` - Your database password  
- `servername` - Your Azure PostgreSQL server name
- `dbname` - Your database name (e.g., `pollsdb`)

### Example:
```
postgresql+psycopg2://adminuser@myserver:MyP@ss123@myserver.postgres.database.azure.com:5432/pollsdb
```

---

## 📋 Quick Checklist Overview

1. ☐ Create Azure App Service (Web App)
2. ☐ Enable WebSockets
3. ☐ Add environment variables (DATABASE_URL, JWT_SECRET, etc.)
4. ☐ Set startup command
5. ☐ Download publish profile
6. ☐ Add publish profile to GitHub secrets
7. ☐ Update workflow file with your app name
8. ☐ Push to GitHub (auto-deploys!)
9. ☐ Run database migrations via SSH
10. ☐ Test your API

---

## 📂 Files Already Created for You:

### ✅ Backend Configuration:
- `app/config.py` - Environment variable support
- `app/db.py` - Azure PostgreSQL with SSL
- `app/main.py` - CORS configured
- `migrations/env.py` - Alembic reads from env
- `requirements.txt` - Includes gunicorn
- `startup.txt` - Azure startup command

### ✅ Deployment Files:
- `.github/workflows/deploy-backend.yml` - GitHub Actions workflow
- `DEPLOYMENT_CHECKLIST.txt` - Step-by-step checklist
- `DEPLOY_STEPS.md` - Detailed instructions
- `AZURE_DEPLOYMENT.md` - Complete guide
- `SWITCH_TO_AZURE.md` - Local Azure DB setup

---

## 🎯 Current Status

### ✅ Local Development:
- Using SQLite database (`test.db`)
- No `.env` file needed
- Ready to run: `python run.py`

### 🚀 Ready for Azure:
- All files configured
- GitHub Actions workflow ready
- Just need to create App Service and deploy!

---

## ⚠️ IMPORTANT: Before You Start

1. **Have your Azure PostgreSQL connection details ready:**
   - Server name
   - Admin username
   - Password
   - Database name

2. **Make sure your code is pushed to GitHub:**
   ```powershell
   git status
   git add .
   git commit -m "Ready for Azure deployment"
   git push origin main
   ```

3. **Open the checklist:**
   - `DEPLOYMENT_CHECKLIST.txt`

---

## 🆘 Need Help?

### Common Questions:

**Q: Which document should I follow?**
A: Start with `DEPLOYMENT_CHECKLIST.txt` - it's the simplest!

**Q: Do I need Docker/containers?**
A: No! We're using the "Code path" - Azure handles everything.

**Q: How long does deployment take?**
A: First time: 30-45 minutes. Updates: 2-5 minutes (automatic).

**Q: What if something goes wrong?**
A: Check `DEPLOY_STEPS.md` → Section 6: Monitor & Debug

**Q: Can I test locally with Azure database first?**
A: Yes! See `SWITCH_TO_AZURE.md`

---

## 📞 Troubleshooting

### App won't start:
```powershell
# View logs
az webapp log tail --name YOUR-APP-NAME --resource-group YOUR-RG
```

### Forgot to run migrations:
```powershell
# SSH into app
az webapp ssh --name YOUR-APP-NAME --resource-group YOUR-RG
# Then run: cd /home/site/wwwroot && alembic upgrade head
```

### Need to update settings:
- Go to Azure Portal → App Service → Configuration
- Or use CLI: `az webapp config appsettings set ...`

---

## ✅ Success Checklist

After deployment, you should have:

- [ ] Backend running at `https://YOUR-APP.azurewebsites.net`
- [ ] Health check working: `/health` → `{"status":"healthy"}`
- [ ] API docs visible: `/docs`
- [ ] Database tables created (via migrations)
- [ ] Can register a user via API
- [ ] GitHub Actions deploying automatically on push

---

## 🎉 Next Steps After Backend is Deployed

1. **Test all endpoints** using `/docs` Swagger UI
2. **Update frontend** with Azure backend URL
3. **Deploy frontend** to Azure Static Web Apps
4. **Update CORS** in backend to include frontend URL
5. **Set up custom domain** (optional)
6. **Enable Application Insights** for monitoring

---

## 💡 Pro Tips

- Use **B1 tier** for development (~$13/month, can scale to F1 Free for testing)
- Enable **Application Insights** for better debugging
- Use **Log Stream** to watch real-time logs
- GitHub Actions auto-deploy on every push to `main`
- Test locally before pushing changes

---

## 🔗 Useful Links

- [Azure Portal](https://portal.azure.com)
- [Your GitHub Repo](https://github.com)
- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [FastAPI on Azure](https://docs.microsoft.com/azure/app-service/quickstart-python)

---

## 📝 Remember

- **Save your JWT_SECRET** (generated above)
- **Keep your publish profile secure** (it's like a password!)
- **Don't commit `.env` file** to GitHub (already in .gitignore)
- **Database connection string** should include `?sslmode=require`

---

# 🎯 Ready? 

**Open `DEPLOYMENT_CHECKLIST.txt` and start checking off steps!**

Good luck! 🚀


