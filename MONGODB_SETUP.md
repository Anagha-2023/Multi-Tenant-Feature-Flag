# MongoDB Setup Guide

## Option 1: Local MongoDB Installation (Recommended for Development)

### Windows

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download and run installer

2. **Install MongoDB:**
   - Choose "Complete" installation
   - Install as a Windows Service (default)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation:**
   ```powershell
   mongod --version
   ```

4. **MongoDB should start automatically as a service**
   - Default connection: `mongodb://localhost:27017`

### macOS

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## Option 2: MongoDB Atlas (Cloud - Free Tier Available)

1. **Create Account:**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster:**
   - Choose "Free Shared" tier
   - Select region closest to you
   - Create cluster (takes 1-3 minutes)

3. **Configure Access:**
   - Database Access: Create database user
   - Network Access: Add IP address (0.0.0.0/0 for development)

4. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

5. **Update backend/.env:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/feature_flags?retryWrites=true&w=majority
   ```

---

## Option 3: Docker (Fastest Setup)

```bash
# Pull and run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -v mongodb_data:/data/db \
  mongo:7.0

# Connection string:
# mongodb://admin:admin123@localhost:27017/feature_flags?authSource=admin
```

For backend, update config.js:
```javascript
mongoUri: 'mongodb://admin:admin123@localhost:27017/feature_flags?authSource=admin'
```

---

## Verifying Connection

### Using MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You should see the `feature_flags` database after first API call

### Using MongoDB Shell
```bash
# Connect to MongoDB
mongosh

# Switch to feature_flags database
use feature_flags

# Show collections
show collections

# Query organizations
db.organizations.find()

# Query users
db.users.find()

# Query feature flags
db.featureflags.find()
```

---

## Configuration

### Backend Configuration

The backend automatically creates the database and collections.

**Default connection** (no MongoDB installed):
- Falls back to graceful error handling
- See console for connection status

**Local MongoDB:**
```javascript
// backend/config.js
mongoUri: 'mongodb://localhost:27017/feature_flags'
```

**MongoDB Atlas:**
```javascript
// backend/config.js or .env
mongoUri: 'mongodb+srv://username:password@cluster.mongodb.net/feature_flags'
```

**Docker MongoDB:**
```javascript
// backend/config.js
mongoUri: 'mongodb://admin:admin123@localhost:27017/feature_flags?authSource=admin'
```

---

## Database Schema

### Collections Created Automatically:

1. **organizations**
   - Stores organization data
   - Indexed on: `id` (unique)

2. **users**
   - Stores admin users
   - Indexed on: `id` (unique), `email` (unique)

3. **featureflags**
   - Stores feature flags
   - Indexed on: `id` (unique), `organizationId`, `(organizationId + key)` (compound unique)

---

## Troubleshooting

### Connection Failed
**Error:** `MongoServerError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running:
   ```powershell
   # Windows
   Get-Service MongoDB
   
   # If not running
   Start-Service MongoDB
   ```

2. Check connection string in config.js
3. Try connecting with MongoDB Compass

### Authentication Failed
**Error:** `Authentication failed`

**Solutions:**
1. Check username/password in connection string
2. For Docker: use admin/admin123
3. For Atlas: verify user credentials in Atlas dashboard

### Database Not Created
**Issue:** No database visible in Compass

**Solution:** 
- Database is created on first write operation
- Run `test-api.ps1` to populate data
- Then check MongoDB Compass

---

## Quick Start (Recommended)

### Fastest Way to Get Running:

1. **Use Docker** (if you have Docker installed):
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:7.0
   ```

2. **Or install locally** and let it run as service (Windows auto-starts it)

3. **Start the backend** (it connects automatically):
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Verify connection** in console:
   ```
   MongoDB connected successfully
   ```

---

## No MongoDB? No Problem!

If you don't want to install MongoDB:

1. **Use MongoDB Atlas** (free cloud option)
   - No installation required
   - 512MB free tier
   - Setup takes 3 minutes

2. **Or continue without database**
   - The app will log the error
   - But won't crash
   - Some features may not work

---

## Production Recommendations

For production deployment:

1. **Use MongoDB Atlas** (managed service)
2. **Enable authentication** always
3. **Restrict IP access** (not 0.0.0.0/0)
4. **Enable SSL/TLS** for connections
5. **Regular backups** (Atlas has automatic backups)
6. **Monitor performance** with Atlas monitoring
7. **Use replica sets** for high availability

---

## Additional Resources

- [MongoDB Installation Docs](https://docs.mongodb.com/manual/installation/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Compass Download](https://www.mongodb.com/products/compass)
