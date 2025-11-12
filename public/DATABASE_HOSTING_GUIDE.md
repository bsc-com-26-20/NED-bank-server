# Database Hosting Guide - PostgreSQL Alternatives

Since your Render database expired, here are excellent **FREE** alternatives to host your PostgreSQL database:

## 🏆 Recommended Options (Free Tier Available)

### 1. **Neon** (Recommended) ⭐
**Best for:** Serverless PostgreSQL, automatic scaling, branching

**Free Tier:**
- 0.5 GB storage
- Unlimited projects
- Branching feature
- No credit card required

**Setup Steps:**

1. **Sign Up:**
   - Go to https://neon.tech
   - Click "Sign Up" (use GitHub/Google for quick signup)

2. **Create Database:**
   - Click "Create Project"
   - Choose a project name (e.g., "minibank")
   - Select a region closest to you
   - Click "Create Project"

3. **Get Connection String:**
   - After creation, you'll see the connection string
   - It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
   - Click "Copy" to copy it

4. **Update Backend .env:**
   ```env
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

5. **Run Database Schema:**
   - Connect to your database using the connection string
   - Run your `init.sql` file to create tables

**Pros:**
- ✅ Modern serverless PostgreSQL
- ✅ Automatic backups
- ✅ Branching (like Git for databases)
- ✅ Generous free tier
- ✅ No credit card required

**Cons:**
- ⚠️ Database pauses after 5 minutes of inactivity (auto-resumes)

---

### 2. **Supabase** (Great Alternative)
**Best for:** Full-stack platform with PostgreSQL + Auth + Storage

**Free Tier:**
- 500 MB database
- 2 GB bandwidth
- Unlimited API requests

**Setup Steps:**

1. **Sign Up:**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub/Google

2. **Create Project:**
   - Click "New Project"
   - Enter project name: "minibank"
   - Enter database password (save it!)
   - Choose region
   - Click "Create new project"

3. **Get Connection String:**
   - Go to Project Settings → Database
   - Find "Connection string" → "URI"
   - Copy the connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

4. **Update Backend .env:**
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

5. **Run Database Schema:**
   - Use Supabase SQL Editor (in dashboard)
   - Or connect via psql and run `init.sql`

**Pros:**
- ✅ Full-featured platform (Auth, Storage, Realtime)
- ✅ Great dashboard
- ✅ Good free tier
- ✅ Auto-scaling

**Cons:**
- ⚠️ Requires credit card for some features (but free tier works without)

---

### 3. **Railway** (Simple & Fast)
**Best for:** Quick setup, simple interface

**Free Tier:**
- $5 credit/month (enough for small databases)
- 500 MB storage
- No credit card required initially

**Setup Steps:**

1. **Sign Up:**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Sign up with GitHub

2. **Create Database:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Wait for database to provision

3. **Get Connection String:**
   - Click on the PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL` value

4. **Update Backend .env:**
   ```env
   DATABASE_URL=[copied connection string]
   ```

**Pros:**
- ✅ Very simple interface
- ✅ Quick setup
- ✅ Good for beginners

**Cons:**
- ⚠️ Free tier limited to $5/month credit

---

### 4. **ElephantSQL** (Classic Option)
**Best for:** Simple, reliable PostgreSQL hosting

**Free Tier:**
- 20 MB storage
- 5 connections
- 1 database

**Setup Steps:**

1. **Sign Up:**
   - Go to https://www.elephantsql.com
   - Click "Get a managed database today"
   - Sign up (email verification required)

2. **Create Instance:**
   - Click "Create New Instance"
   - Choose "Tiny Turtle" (free plan)
   - Select region
   - Click "Select Region"

3. **Get Connection String:**
   - After creation, click on your instance
   - Copy "URL" (connection string)

4. **Update Backend .env:**
   ```env
   DATABASE_URL=[copied URL]
   ```

**Pros:**
- ✅ Simple and reliable
- ✅ No credit card required
- ✅ Good for testing

**Cons:**
- ⚠️ Small free tier (20 MB)

---

## 🚀 Quick Setup (Using Neon - Recommended)

### Step 1: Create Neon Account
```bash
# Visit https://neon.tech and sign up
```

### Step 2: Create Database
1. Click "Create Project"
2. Name it "minibank"
3. Copy the connection string

### Step 3: Update Backend
```bash
cd C:\Users\RO\Projects\minibank-server

# Create or update .env file
echo DATABASE_URL=your_neon_connection_string > .env
echo JWT_SECRET=your_secret_key_here >> .env
echo REFRESH_SECRET=your_refresh_secret_here >> .env
echo PORT=5000 >> .env
```

### Step 4: Initialize Database
```bash
# Option 1: Using Neon SQL Editor
# - Go to Neon dashboard → SQL Editor
# - Paste your init.sql content
# - Run it

# Option 2: Using psql (if installed)
psql "your_connection_string" -f init.sql
```

### Step 5: Test Connection
```bash
# Start your backend server
node index.js

# Should see: "✅ Connected to PostgreSQL"
```

---

## 📝 Connection String Format

All platforms use similar connection strings:
```
postgresql://username:password@host:port/database?sslmode=require
```

**Important:** Always use `?sslmode=require` for secure connections!

---

## 🔒 Security Best Practices

1. **Never commit .env file to Git**
   - Add `.env` to `.gitignore`

2. **Use strong secrets:**
   ```env
   JWT_SECRET=your_very_long_random_string_here
   REFRESH_SECRET=another_very_long_random_string_here
   ```

3. **Rotate secrets regularly**

4. **Use environment variables in production**

---

## 🆘 Troubleshooting

### "Connection refused"
- Check if database is paused (Neon auto-pauses)
- Verify connection string is correct
- Check firewall settings

### "Authentication failed"
- Verify username and password
- Check if database exists
- Ensure SSL is enabled

### "Database does not exist"
- Create database in dashboard
- Or run: `CREATE DATABASE dbname;`

---

## 💡 Recommendation

**For your project, I recommend Neon** because:
- ✅ No credit card required
- ✅ Generous free tier
- ✅ Modern serverless architecture
- ✅ Easy to use
- ✅ Auto-resumes when paused

**Quick Start with Neon:**
1. Sign up at https://neon.tech
2. Create project
3. Copy connection string
4. Update `.env` file
5. Run `init.sql` in SQL Editor
6. Done! 🎉

---

## 📚 Additional Resources

- **Neon Docs:** https://neon.tech/docs
- **Supabase Docs:** https://supabase.com/docs
- **Railway Docs:** https://docs.railway.app
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## ✅ Checklist

- [ ] Sign up for database hosting (Neon recommended)
- [ ] Create database/project
- [ ] Copy connection string
- [ ] Update backend `.env` file
- [ ] Run `init.sql` to create tables
- [ ] Test connection (start backend server)
- [ ] Verify tables exist
- [ ] Test API endpoints

Good luck! 🚀


