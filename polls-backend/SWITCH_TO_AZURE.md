# How to Switch from SQLite to Azure PostgreSQL

## 📍 Current Setup
- ✅ Using **SQLite** locally (`sqlite:///./test.db`)
- ✅ No `.env` file needed
- ✅ Works out of the box

---

## 🔄 When You're Ready to Use Azure PostgreSQL

### Step 1: Create `.env` File

In `polls-backend/`, create a new `.env` file with UTF-8 encoding:

```env
DATABASE_URL=postgresql+psycopg2://username@servername:password@servername.postgres.database.azure.com:5432/dbname
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_MIN=15
REFRESH_EXPIRES_DAYS=7
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Important:**
- Replace `username`, `password`, `servername`, `dbname` with your actual Azure credentials
- Make sure the file is saved as **UTF-8** (not UTF-16 or UTF-8 with BOM)

### Step 2: Run Migrations to Azure

```bash
cd polls-backend
alembic upgrade head
```

This creates all tables in your Azure PostgreSQL database.

### Step 3: Restart Your App

```bash
python run.py
```

The app will now use Azure PostgreSQL instead of SQLite!

---

## 🔙 Switch Back to SQLite

Simply delete or rename the `.env` file:

```bash
# Option 1: Delete
Remove-Item .env

# Option 2: Rename (keep for later)
Rename-Item .env .env.backup
```

Restart the app - it will automatically use SQLite again.

---

## 💡 Pro Tip: Multiple Environments

Create different `.env` files for different environments:

- `.env.local` - SQLite for local development
- `.env.azure` - Azure PostgreSQL for testing
- `.env.production` - Production database

Then copy the one you need:
```bash
# Use local SQLite
Copy-Item .env.local .env

# Use Azure
Copy-Item .env.azure .env
```

---

## 🐛 Troubleshooting

### Error: "can't decode byte 0xff"
- Your `.env` file has wrong encoding
- Delete it and recreate with UTF-8 encoding
- Use a text editor like VS Code (bottom right shows encoding)

### App still uses SQLite after creating `.env`
- Make sure `.env` is in `polls-backend/` folder (not root)
- Restart the app
- Check the file content with: `Get-Content .env`

### Database connection errors
- Verify Azure PostgreSQL connection string is correct
- Check firewall rules allow your IP
- Make sure SSL mode is included: `?sslmode=require`

