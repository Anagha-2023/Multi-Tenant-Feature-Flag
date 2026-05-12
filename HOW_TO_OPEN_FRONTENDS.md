# How to Open and Test Each Frontend

## Method 1: Direct Browser Access (Easiest)

### Super Admin Frontend
1. Navigate to: `d:\Project\Multi-Tenant Feature Flag\super-admin-frontend`
2. Double-click `index.html`
3. Browser will open automatically
4. Login with:
   - Username: `superadmin`
   - Password: `Admin@123`

### Organization Admin Frontend
1. Navigate to: `d:\Project\Multi-Tenant Feature Flag\admin-frontend`
2. Double-click `index.html`
3. Browser will open automatically
4. Use the signup tab to create an account

### End User Frontend
1. Navigate to: `d:\Project\Multi-Tenant Feature Flag\user-frontend`
2. Double-click `index.html`
3. Browser will open automatically
4. Enter organization ID and feature key

---

## Method 2: VS Code Live Server (Recommended)

### Prerequisites
Install "Live Server" extension in VS Code:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Live Server"
4. Install by Ritwick Dey

### Steps for Each Frontend

#### Super Admin
1. Open VS Code
2. Open folder: `d:\Project\Multi-Tenant Feature Flag\super-admin-frontend`
3. Right-click on `index.html`
4. Select "Open with Live Server"
5. Browser opens at: `http://127.0.0.1:5500/index.html`

#### Organization Admin
1. Open folder: `d:\Project\Multi-Tenant Feature Flag\admin-frontend`
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Browser opens at: `http://127.0.0.1:5501/index.html`

#### End User
1. Open folder: `d:\Project\Multi-Tenant Feature Flag\user-frontend`
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Browser opens at: `http://127.0.0.1:5502/index.html`

**Note:** Live Server automatically assigns different ports for multiple instances.

---

## Method 3: Python HTTP Server

### For Each Frontend (Use separate terminal windows)

#### Terminal 1: Super Admin
```powershell
cd "d:\Project\Multi-Tenant Feature Flag\super-admin-frontend"
python -m http.server 8001
```
Access at: `http://localhost:8001`

#### Terminal 2: Organization Admin
```powershell
cd "d:\Project\Multi-Tenant Feature Flag\admin-frontend"
python -m http.server 8002
```
Access at: `http://localhost:8002`

#### Terminal 3: End User
```powershell
cd "d:\Project\Multi-Tenant Feature Flag\user-frontend"
python -m http.server 8003
```
Access at: `http://localhost:8003`

---

## Method 4: Node.js HTTP Server

### Install http-server globally
```powershell
npm install -g http-server
```

### For Each Frontend (Use separate terminal windows)

#### Terminal 1: Super Admin
```powershell
cd "d:\Project\Multi-Tenant Feature Flag\super-admin-frontend"
http-server -p 8001
```

#### Terminal 2: Organization Admin
```powershell
cd "d:\Project\Multi-Tenant Feature Flag\admin-frontend"
http-server -p 8002
```

#### Terminal 3: End User
```powershell
cd "d:\Project\Multi-Tenant Feature Flag\user-frontend"
http-server -p 8003
```

---

## Complete Testing Workflow

### Step 1: Start Backend (Required)
```powershell
cd "d:\Project\Multi-Tenant Feature Flag\backend"
npm install
npm start
```
✅ Server running at: `http://localhost:3000`

### Step 2: Open Super Admin Frontend
- Use any method above
- Login: `superadmin` / `Admin@123`
- Create organization: "Test Company"
- **Copy the Organization ID** (shown below the organization)

### Step 3: Open Organization Admin Frontend
- Use any method above
- Click "Sign Up" tab
- Fill in:
  - Name: Your Name
  - Email: admin@test.com
  - Password: password123
  - Organization ID: **Paste from Step 2**
- Click "Sign Up"
- Create feature flags:
  - `dark_mode` - Enabled ✅
  - `beta_features` - Disabled ❌

### Step 4: Open End User Frontend
- Use any method above
- Paste Organization ID from Step 2
- Check features:
  - `dark_mode` → Should show ✅ ENABLED
  - `beta_features` → Should show ❌ DISABLED
  - `nonexistent` → Should show ❌ DISABLED (not found)

---

## Quick URLs Reference

After starting servers:

| Frontend | Direct File | Python Server | Node Server | Live Server |
|----------|------------|---------------|-------------|-------------|
| Super Admin | `file:///d:/Project/Multi-Tenant%20Feature%20Flag/super-admin-frontend/index.html` | `http://localhost:8001` | `http://localhost:8001` | `http://127.0.0.1:5500` |
| Org Admin | `file:///d:/Project/Multi-Tenant%20Feature%20Flag/admin-frontend/index.html` | `http://localhost:8002` | `http://localhost:8002` | `http://127.0.0.1:5501` |
| End User | `file:///d:/Project/Multi-Tenant%20Feature%20Flag/user-frontend/index.html` | `http://localhost:8003` | `http://localhost:8003` | `http://127.0.0.1:5502` |
| Backend API | - | - | - | `http://localhost:3000` |

---

## Troubleshooting

### CORS Error
**Symptom:** Browser console shows CORS policy error

**Solution:**
- Ensure backend is running
- Use Live Server or Python server instead of file:// protocol
- Check backend shows "CORS enabled" on startup

### Cannot Connect to Server
**Symptom:** Frontend shows "Failed to connect to server"

**Solution:**
```powershell
# Check if backend is running
curl http://localhost:3000/api/health

# Should return: {"status":"OK","message":"Feature Flag API is running"}
```

### Port Already in Use
**Symptom:** Error: Port 8001 already in use

**Solution:**
- Use different port: `python -m http.server 8004`
- Or kill existing process:
  ```powershell
  # Find process using port
  netstat -ano | findstr :8001
  
  # Kill process (replace PID)
  taskkill /PID <PID> /F
  ```

### Page Not Loading
**Symptom:** Blank page or 404 error

**Solution:**
- Verify you're in the correct directory
- Check file path is correct
- Look at browser console for errors
- Try different method (Live Server vs Python)

---

## Browser Compatibility

✅ **Chrome**: Fully supported  
✅ **Firefox**: Fully supported  
✅ **Edge**: Fully supported  
✅ **Safari**: Fully supported  
⚠️ **IE11**: Not supported (uses ES6+)

---

## Tips

1. **Use Chrome DevTools**: F12 to see network requests and errors
2. **Check Console**: Look for JavaScript errors
3. **Test API First**: Use `test-api.ps1` to verify backend works
4. **Use Live Server**: Best for development with auto-reload
5. **Keep Backend Running**: Frontend needs API access
6. **Clear Storage**: If issues, clear localStorage in browser DevTools

---

## Video Tutorial Steps (for demo)

1. **Show backend running**
   ```powershell
   cd backend
   npm start
   ```

2. **Open Super Admin frontend**
   - Double-click index.html
   - Show login screen
   - Login and create org
   - Show organization ID

3. **Open Org Admin frontend**
   - Double-click index.html
   - Show signup process
   - Create feature flags
   - Toggle them on/off

4. **Open End User frontend**
   - Double-click index.html
   - Show feature checking
   - Demonstrate enabled/disabled states

5. **Show API response**
   - Open browser DevTools
   - Show network tab
   - Demonstrate API calls

---

**Remember:** Always start the backend first before opening any frontend!
