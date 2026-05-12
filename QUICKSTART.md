# Quick Start Guide

## Step 1: Set Up MongoDB (Quick Options)

**Option A: Use Docker (Fastest - 30 seconds)**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

**Option B: MongoDB Atlas (Free Cloud - 3 minutes)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account & cluster
- Get connection string
- Update `backend/config.js`

**Option C: Install Locally**
- Windows: Download from https://www.mongodb.com/try/download/community
- macOS: `brew install mongodb-community@7.0 && brew services start mongodb-community@7.0`

**No MongoDB?** Server will still run with a warning. See [MONGODB_SETUP.md](MONGODB_SETUP.md)

## Step 2: Start the Backend

```bash
cd backend
npm install
npm start
```

Server runs at: `http://localhost:3000`

✅ Look for: "MongoDB connected successfully"  
⚠️ Or: Warning message (server still works, data not persistent)

**Super Admin Credentials:**
- Username: `superadmin`
- Password: `Admin@123`

## Step 3: Open the Frontends

### Option A: Direct in Browser
Simply double-click these files:
- `super-admin-frontend/index.html`
- `admin-frontend/index.html`
- `user-frontend/index.html`

### Option B: With Live Server (Recommended)
Use VS Code's Live Server extension or:

```bash
# Terminal 1 - Super Admin
cd super-admin-frontend
python -m http.server 8001

# Terminal 2 - Org Admin
cd admin-frontend
python -m http.server 8002

# Terminal 3 - End User
cd user-frontend
python -m http.server 8003
```

## Step 4: Test the Flow

1. **Super Admin (port 8001)**
   - Login with credentials above
   - Create organization "Test Corp"
   - Copy the Organization ID (UUID shown below the org)

2. **Org Admin (port 8002)**
   - Click "Sign Up" tab
   - Enter your name, email, password
   - Paste the Organization ID from step 1
   - After signup, create feature flags:
     - Key: `dark_mode`, enabled: ✓
     - Key: `new_feature`, enabled: ✗

3. **End User (port 8003)**
   - Paste the Organization ID
   - Check feature: `dark_mode` → Should show ✅ ENABLED
   - Check feature: `new_feature` → Should show ❌ DISABLED

## Troubleshooting

**CORS Error?**
- Make sure backend is running on port 3000
- Check browser console for errors

**MongoDB connection warning?**
- Server still works, but data isn't persistent
- Install MongoDB or use Docker: See [MONGODB_SETUP.md](MONGODB_SETUP.md)
- Quick fix: `docker run -d --name mongodb -p 27017:27017 mongo:7.0`

**Can't connect to server?**
- Verify backend is running: `http://localhost:3000/api/health`
- Should return: `{"status":"OK","message":"Feature Flag API is running"}`

**Frontend not loading?**
- Try using Live Server instead of opening directly
- Check if port 3000 is already in use

## API Testing with cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Super admin login
curl -X POST http://localhost:3000/api/auth/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"Admin@123"}'

# Check feature (no auth needed)
curl -X POST http://localhost:3000/api/feature-flags/check \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"your-org-id","featureKey":"dark_mode"}'
```

## Project Features

✅ Custom authentication (no third-party providers)  
✅ Three separate frontend applications  
✅ Role-based access control (Super Admin, Org Admin, End User)  
✅ Multi-tenant organization support  
✅ Feature flag CRUD operations  
✅ Real-time feature status checking  
✅ JWT-based security  
✅ In-memory database (easily replaceable)  

---

For detailed documentation, see [README.md](README.md)
