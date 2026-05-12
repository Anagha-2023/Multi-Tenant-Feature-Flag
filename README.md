# Multi-Tenant Feature Flag Management System

A comprehensive feature flag management system supporting multiple organizations with role-based access control.

## 🏗️ Architecture

- **Backend**: Node.js + Express.js + MongoDB (Mongoose)
- **Frontends**: 3 separate web applications (Vanilla JavaScript + Vite)
- **Database**: MongoDB Atlas (NoSQL)
- **Authentication**: JWT-based authentication with role-based access control

## 📁 Project Structure

```
Multi-Tenant Feature Flag/
├── backend/                    # Node.js Express API
│   ├── config.js              # MongoDB configuration
│   ├── database.js            # Mongoose schemas and database operations
│   ├── server.js              # Express app setup
│   ├── middleware/
│   │   └── auth.js            # JWT authentication & authorization
│   └── routes/
│       ├── auth.js            # Login/Signup endpoints
│       ├── organizations.js   # Organization CRUD
│       └── featureFlags.js    # Feature flag management
├── super-admin-frontend/       # Super Admin UI (Port 3003)
├── admin-frontend/            # Organization Admin UI (Port 3001)
└── user-frontend/             # End User UI (Port 3004)
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Step 1: Clone and Install Dependencies

1. **Set up MongoDB** (choose one option):
   
   **Option A: Local MongoDB** (Recommended for development)
   ```bash
   # Windows: Download and install from https://www.mongodb.com/try/download/community
   # The installer sets up MongoDB as a Windows service (auto-starts)
   
   # macOS:
   brew install mongodb-community@7.0
   brew services start mongodb-community@7.0
   
   # Linux:
   sudo apt-get install mongodb
   sudo systemctl start mongod
   ```

   **Option B: MongoDB Atlas** (Free cloud option)
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string
   - Update `backend/config.js` with your connection string

   **Option C: Docker** (Fastest)
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:7.0
   ```

   📖 **Detailed setup guide:** See [MONGODB_SETUP.md](MONGODB_SETUP.md)

2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000`
   
   **Note:** If MongoDB isn't running, the server will still start but show a warning. Data won't persist between restarts.

   **Default Super Admin Credentials:**
   - Username: `superadmin`
   - Password: `Admin@123`

### Running the Frontend Applications

The frontend applications are simple HTML files that can be opened directly in a browser or served via a simple HTTP server.

#### Option 1: Open directly in browser
Simply double-click the `index.html` files in each frontend directory.

#### Option 2: Use a local server (recommended)
```bash
# Using Python 3
cd super-admin-frontend
python -m http.server 8001

# In another terminal for admin frontend
cd admin-frontend
python -m http.server 8002

# In another terminal for user frontend
cd user-frontend
python -m http.server 8003
```

Or use VS Code's Live Server extension:
- Right-click on any `index.html` file
- Select "Open with Live Server"

## 📖 Usage Guide

### 1. Super Admin Workflow

**Access:** Open `super-admin-frontend/index.html`

1. **Login** with super admin credentials
   - Username: `superadmin`
   - Password: `Admin@123`

2. **Create Organizations**
   - Enter organization name and description
   - Click "Create Organization"
   - Copy the Organization ID (UUID) - this is needed for admin signup

3. **View Organizations**
   - All created organizations are listed below
   - Each shows name, description, ID, and creation date

### 2. Organization Admin Workflow

**Access:** Open `admin-frontend/index.html`

1. **Sign Up**
   - Click "Sign Up" tab
   - Enter your details
   - Paste the Organization ID provided by Super Admin
   - Click "Sign Up"

2. **Login** (if already registered)
   - Click "Login" tab
   - Enter email and password
   - Click "Login"

3. **Manage Feature Flags**
   - **Create**: Enter feature key, description, and optionally enable it
   - **Enable/Disable**: Click the toggle button on any flag
   - **Delete**: Click delete button (with confirmation)

### 3. End User Workflow

**Access:** Open `user-frontend/index.html`

1. **Enter Organization ID**
   - Get this from your organization admin

2. **Enter Feature Key**
   - Type the feature you want to check (e.g., `dark_mode`)

3. **Check Status**
   - Click "Check Feature"
   - See if the feature is enabled or disabled
   - View feature description if available

## 🔌 API Documentation

### Authentication Endpoints

#### Super Admin Login
```http
POST /api/auth/super-admin/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "Admin@123"
}

Response: {
  "token": "jwt-token",
  "user": { "username": "superadmin", "role": "super-admin" }
}
```

#### Organization Admin Signup
```http
POST /api/auth/admin/signup
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "name": "John Doe",
  "organizationId": "uuid"
}

Response: {
  "token": "jwt-token",
  "user": { ... }
}
```

#### Organization Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response: {
  "token": "jwt-token",
  "user": { ... }
}
```

### Organization Endpoints

#### Create Organization (Super Admin only)
```http
POST /api/organizations
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Acme Corp",
  "description": "Description here"
}

Response: {
  "id": "uuid",
  "name": "Acme Corp",
  "description": "Description here",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get All Organizations (Super Admin only)
```http
GET /api/organizations
Authorization: Bearer {token}

Response: [
  { "id": "uuid", "name": "Acme Corp", ... }
]
```

#### Get Organization by ID (Public)
```http
GET /api/organizations/:id

Response: {
  "id": "uuid",
  "name": "Acme Corp"
}
```

### Feature Flag Endpoints

#### Create Feature Flag (Org Admin only)
```http
POST /api/feature-flags
Authorization: Bearer {token}
Content-Type: application/json

{
  "key": "dark_mode",
  "description": "Enable dark mode UI",
  "enabled": true
}

Response: {
  "id": "uuid",
  "organizationId": "uuid",
  "key": "dark_mode",
  "description": "Enable dark mode UI",
  "enabled": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### Get All Feature Flags (Org Admin only)
```http
GET /api/feature-flags
Authorization: Bearer {token}

Response: [
  { "id": "uuid", "key": "dark_mode", ... }
]
```

#### Update Feature Flag (Org Admin only)
```http
PUT /api/feature-flags/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": false,
  "description": "Updated description"
}

Response: { ... updated flag ... }
``` (MongoDB Collection: `organizations`)
```javascript
{
  id: String (UUID) - indexed, unique,
  name: String - required,
  description: String,
  createdAt: Date - default: now
}
```

### User (MongoDB Collection: `users`)
```javascript
{
  id: String (UUID) - indexed, unique,
  email: String - required, unique,
  password: String - hashed with bcrypt,
  name: String - required,
  role: String - required ('org-admin'),
  organizationId: String (UUID) - required,
  createdAt: Date - default: now
}
```

### Feature Flag (MongoDB Collection: `featureflags`)
```javascript
{
  id: String (UUID) - indexed, unique,
  organizationId: String (UUID) - indexed, required,
  key: String - required,
  description: String,
  enabled: Boolean - default: false,
  createdAt: Date - default: now,
  updatedAt: Date - default: now
}

// Compound Index: (organizationId + key) - unique``javascript
{
  id: String (UUID),
  name: String,
  description: String,
  createdAt: String (ISO Date)
}
```

### User
```javascript
{
  id: String (UUID),
  email: String,
  password: String (hashed),
  name: String,
  role: String ('org-admin'),
  organizationId: String (UUID),
  createdAt: String (ISO Date)
}
```

### Feature Flag
```javascript
{
  id: String (UUID),
  organizationId: String (UUID),
  key: String,
  description: String,
  enabled: Boolean,
  createdAt: String (ISO Date),
  updatedAt: String (ISO Date)
}
```

## 🔐 Security Features

1. **JWT Authentication**: All protected routes require valid JWT tokens
2. **Password Hashing**: User passwords are hashed using bcrypt
3. **Role-Based Access Control**: 
   - Super Admin can only manage organizations
   - Org Admin can only manage their organization's feature flags
   - End users have read-only access via public endpoint
4. **Organization Isolation**: Admins can only access their organization's data

## 🛠️ MongoDB Database
**Decision**: Used MongoDB (NoSQL) with Mongoose ODM  
**Rationale**: 
- Meets assignment requirement for SQL/NoSQL database
- Flexible schema for evolving requirements
- Easy to set up locally or use cloud (Atlas)
- Good for multi-tenant architecture
- Built-in indexing support
- Mongoose provides validation and type safety

**Alternative Considered**: PostgreSQL - Would be better for complex queries and strict data integrity

**Production Alternative**: Replace with PostgreSQL, MongoDB, or MySQL

### 2. Custom Authentication
**Decision**: Implemented custom JWT-based auth instead of using third-party providers  
**Rationale**: 
- Meets assignment requirements (no Auth0, Firebase, etc.)
- Full control over auth logic
- Demonstrates understanding of authentication principles

**Trade-off**: More maintenance burden vs. third-party solutions

### 3. Single Server Architecture
**Decision**: All APIs in one Express server  
**Rationale**: 
- Simplicity for the assignment scope
- Easy to run and test locally

**Production Alternative**: Microservices architecture

### 4. Static Super Admin Credentials
**Decision**: Hardcoded super admin credentials in config  
**Rationale**: 
- Meets assignment requirements
- Simple setup
- No signup flow needed for super admin

**Production Alternative**: Environment variables or secure vault

### 5. No Database Migrations
**Decision**: Schema defined in code, no migration system  
**Rationale**: 
- In-memory storage doesn't persist
- Simplified development

**Production Alternative**: Use migration tools (Sequelize, TypeORM, Knex)

### 6. Basic Frontend Styling
**Decision**: Inline CSS in HTML files  
**Rationale**: 
- Assignment states UI doesn't need to be polished
- No build process required
- Self-contained files

**Production Alternative**: React/Vue with component libraries

## 🧪 Testing the System

### Complete Test Flow

1. **Start the backend server:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Create an organization:**
   - Open Super Admin frontend
   - Login with `superadmin` / `Admin@123`
   - Create organization "Test Corp"
   - Copy the Organization ID

3. **Register an admin:**
   - Open Organization Admin frontend
   - Click Sign Up
   - Fill in details and paste Organization ID
   - Sign up and verify login

4. **Create feature flags:**
   - Create flag: `dark_mode` (enabled)
   - Create flag: `new_dashboard` (disabled)
   - Toggle and test

5. **Check as end user:**
   - Open End User frontend
   - Paste Organization ID
   - Check `dark_mode` - should show ENABLED
   - Check `new_dashboard` - should show DISABLED

## 🚀 Production Considerations

To make this production-ready, consider:

1. **Database**: 
   - Implement PostgreSQL/MongoDB
   - Add connection pooling
   - Implement proper indexing

2. **Security**:
   - Use environment variables for secrets
   - Implement rate limiting
   - Add HTTPS/TLS
   - Implement refresh tokens
   - Add CORS restrictions
   - Input validation and sanitization

3. **Scalability**:
   - Add caching layer (Redis)
   - Implement horizontal scaling
   - Use message queues for async operations

4. **Monitoring**:
   - Add logging (Winston, Pino)
   - Implement error tracking (Sentry)
   - Add metrics and monitoring (Prometheus)

5. **Testing**:
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Cypress)

6. **Frontend**:
   - Use modern framework (React, Vue)
   - Implement state management
   - Add form validation
   - Improve UX/UI

7. **DevOps**:
   - Containerization (Docker)
   - CI/CD pipeline
   - Infrastructure as Code
   - Environment management

## 📝 Time Spent

Estimated development time: **6-8 hours**

- Backend setup and API: 2-3 hours
- Authentication system: 1-2 hours
- Frontend applications: 2-3 hours
- Documentation: 1 hour

## 🤝 Contributing

This is an assignment project, but suggestions for improvements are welcome!

## 📄 License

This project is for educational/assessment purposes.

## 👤 Author

Created as part of a technical assessment assignment.

---

**Note**: This system is designed for development and demonstration purposes. Additional security hardening and production optimizations would be required for real-world deployment.
