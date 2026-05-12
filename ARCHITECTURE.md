# Architecture Decision Record (ADR)

## Overview
This document records the key architectural decisions made during the development of the Multi-Tenant Feature Flag Management System.

---

## ADR-001: In-Memory Database

**Status**: Accepted

**Context**:
- Assignment requires persistent storage of organizations, users, roles, and feature flags
- Time constraint: 6-10 hours
- Focus on demonstrating API design and role management

**Decision**: 
Use in-memory JavaScript objects for data storage instead of a traditional database.

**Rationale**:
1. **Fast Development**: No need to set up database servers or connection pools
2. **Zero Dependencies**: No database drivers or ORMs needed
3. **Easy Testing**: Reset state by restarting server
4. **Focus on Logic**: More time for business logic and API design
5. **Clear Structure**: Data models are explicit and easy to understand

**Consequences**:
- ✅ Fast prototyping and iteration
- ✅ No setup complexity
- ✅ Perfect for demonstration purposes
- ❌ Data lost on server restart
- ❌ Not suitable for production
- ❌ No concurrent access handling

**Migration Path**:
Replace `database.js` with:
- **SQL Option**: PostgreSQL with Sequelize/Prisma
- **NoSQL Option**: MongoDB with Mongoose
- Keep same interface for minimal code changes

---

## ADR-002: Custom JWT Authentication

**Status**: Accepted

**Context**:
- Assignment explicitly prohibits third-party auth providers (Auth0, Firebase, Cognito)
- Need to demonstrate understanding of authentication fundamentals
- Three distinct roles with different permissions

**Decision**: 
Implement custom JWT-based authentication with bcrypt password hashing.

**Rationale**:
1. **Meets Requirements**: No third-party auth services
2. **Industry Standard**: JWT is widely used and understood
3. **Stateless**: No session storage needed
4. **Role-Based**: Easy to include role information in token
5. **Secure**: bcrypt for password hashing, JWT for token security

**Consequences**:
- ✅ Full control over auth flow
- ✅ Demonstrates security knowledge
- ✅ Simple to understand and modify
- ❌ More code to maintain
- ❌ Manual implementation of security features
- ❌ No advanced features (2FA, OAuth, etc.)

**Security Considerations**:
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire in 24 hours
- Secret key configurable via environment
- Tokens required for protected routes

---

## ADR-003: Monolithic Backend Architecture

**Status**: Accepted

**Context**:
- Single Express.js server
- Three distinct user roles
- Multiple API endpoints

**Decision**: 
Use a single monolithic Express application with route-based organization.

**Rationale**:
1. **Simplicity**: Easier to develop and deploy
2. **Time Efficient**: No microservice complexity
3. **Appropriate Scale**: Small feature set doesn't warrant microservices
4. **Easy Testing**: Single server to start and test
5. **Clear Organization**: Routes organized by domain

**Consequences**:
- ✅ Fast development
- ✅ Simple deployment
- ✅ Easy to understand
- ✅ Good for assignment scope
- ❌ All features coupled
- ❌ Scales as single unit
- ❌ No independent deployments

**File Structure**:
```
backend/
├── server.js           # Main app
├── config.js           # Configuration
├── database.js         # Data layer
├── middleware/
│   └── auth.js        # Auth middleware
└── routes/
    ├── auth.js        # Authentication
    ├── organizations.js
    └── featureFlags.js
```

---

## ADR-004: Three Separate HTML Frontend Applications

**Status**: Accepted

**Context**:
- Three user types with different capabilities
- Assignment doesn't require polished UI
- Need to demonstrate separation of concerns

**Decision**: 
Create three standalone HTML files with vanilla JavaScript (no framework).

**Rationale**:
1. **Zero Build Step**: No webpack, vite, or bundlers needed
2. **Fast Development**: Direct coding without boilerplate
3. **Clear Separation**: Each user type gets dedicated app
4. **Self-Contained**: Each HTML file includes all CSS and JS
5. **Easy to Run**: Just open in browser

**Consequences**:
- ✅ No build complexity
- ✅ Fast to develop
- ✅ Easy to understand
- ✅ No dependencies
- ❌ Code duplication (fetch calls, styling)
- ❌ No component reusability
- ❌ Manual state management
- ❌ Less maintainable at scale

**Alternative Considered**:
- Single-page React app with role-based routing
- Rejected due to time constraints and assignment scope

---

## ADR-005: Static Super Admin Credentials

**Status**: Accepted

**Context**:
- Super admin is system-level user
- Only one super admin needed
- Assignment mentions "static credentials"

**Decision**: 
Hardcode super admin credentials in config file.

**Rationale**:
1. **Explicit Requirement**: Assignment mentions "static credentials"
2. **Simple Setup**: No bootstrap/seed scripts needed
3. **Clear Documentation**: Credentials in README
4. **Single User**: Only one super admin needed

**Consequences**:
- ✅ Simple to set up
- ✅ No signup flow needed
- ✅ Documented in code
- ❌ Not production-ready
- ❌ Credentials in source code

**Production Alternative**:
```javascript
superAdmin: {
  username: process.env.SUPER_ADMIN_USERNAME,
  password: bcrypt.hashSync(process.env.SUPER_ADMIN_PASSWORD, 10)
}
```

---

## ADR-006: Public Feature Check Endpoint

**Status**: Accepted

**Context**:
- End users need to check feature status
- Assignment shows simple form submission
- No user authentication mentioned for end users

**Decision**: 
Make feature flag checking endpoint public (no authentication required).

**Rationale**:
1. **User Experience**: End users can check without login
2. **Simple Flow**: Just organization ID + feature key
3. **Read-Only**: No mutation, minimal security risk
4. **Assignment Scope**: Matches the described workflow

**Consequences**:
- ✅ Simple end-user experience
- ✅ No user management needed
- ✅ Matches assignment description
- ❌ Anyone can check any org's flags
- ❌ No rate limiting
- ❌ Potential information disclosure

**Security Considerations**:
- Feature keys are not secret identifiers
- Only returns enabled/disabled status
- In production, consider:
  - API key per organization
  - Rate limiting
  - Usage analytics

---

## ADR-007: RESTful API Design

**Status**: Accepted

**Context**:
- Need well-structured API
- Multiple resources (orgs, users, flags)
- CRUD operations required

**Decision**: 
Use RESTful API conventions with standard HTTP methods.

**Rationale**:
1. **Industry Standard**: Widely understood
2. **Predictable**: Standard conventions
3. **HTTP Semantic**: GET, POST, PUT, DELETE
4. **Easy to Document**: Clear patterns

**API Structure**:
```
POST   /api/auth/super-admin/login
POST   /api/auth/admin/signup
POST   /api/auth/admin/login

POST   /api/organizations
GET    /api/organizations
GET    /api/organizations/:id

POST   /api/feature-flags
GET    /api/feature-flags
PUT    /api/feature-flags/:id
DELETE /api/feature-flags/:id
POST   /api/feature-flags/check
```

**Consequences**:
- ✅ Clear API structure
- ✅ Standard HTTP semantics
- ✅ Easy to test
- ✅ Self-documenting
- ❌ More endpoints than RPC-style
- ❌ Some complexity in nested resources

---

## ADR-008: CORS Enabled by Default

**Status**: Accepted

**Context**:
- Frontend HTML files opened directly in browser
- Different origins (file:// vs http://localhost)
- Development environment

**Decision**: 
Enable CORS with wildcard (*) for all origins.

**Rationale**:
1. **Development Ease**: Frontend works from file:// protocol
2. **Quick Setup**: No configuration needed
3. **Flexible Testing**: Works from any port

**Consequences**:
- ✅ Frontend works immediately
- ✅ No CORS errors
- ✅ Easy local development
- ❌ Not production-ready
- ❌ Security implications

**Production Alternative**:
```javascript
app.use(cors({
  origin: ['https://app.example.com', 'https://admin.example.com'],
  credentials: true
}));
```

---

## ADR-009: No Password Requirements

**Status**: Accepted (with reservations)

**Context**:
- Assignment is time-constrained
- Focus on feature flag functionality
- Admin signup requires password

**Decision**: 
Accept any password without complexity requirements.

**Rationale**:
1. **Time Constraint**: Focus on core features
2. **Demo Purpose**: Not production system
3. **Simple Testing**: Easy to remember test passwords

**Consequences**:
- ✅ Fast signup flow
- ✅ Easy testing
- ❌ Poor security practice
- ❌ Not production-ready

**Production Requirements**:
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers
- Special characters
- Password strength meter
- Common password blocklist

---

## ADR-010: Error Handling Strategy

**Status**: Accepted

**Context**:
- Multiple failure points
- User needs feedback
- API consumers need structured errors

**Decision**: 
Use HTTP status codes with JSON error messages.

**Rationale**:
1. **Standard**: HTTP semantics for errors
2. **Structured**: JSON response format
3. **Client-Friendly**: Easy to parse and display

**Error Format**:
```javascript
{
  "error": "Human-readable error message"
}
```

**HTTP Status Codes**:
- 400: Bad Request (validation errors)
- 401: Unauthorized (no/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

**Consequences**:
- ✅ Clear error communication
- ✅ Standard HTTP semantics
- ✅ Easy to handle in frontend
- ❌ Simple error format (no error codes)
- ❌ No detailed validation errors

---

## Summary

These architectural decisions prioritize:
1. **Speed of Development**: In-memory DB, no frameworks, simple auth
2. **Clarity**: RESTful API, clear separation, good documentation
3. **Assignment Fit**: Meets all requirements within time constraints
4. **Demonstration**: Shows understanding of key concepts

The system is designed as a **prototype/demo** rather than production system. All decisions acknowledge their limitations and provide production alternatives.

---

## Future Improvements

If continuing development:
1. Add real database
2. Implement proper session management
3. Add input validation library
4. Implement rate limiting
5. Add comprehensive logging
6. Add unit and integration tests
7. Implement CI/CD pipeline
8. Add monitoring and alerting
9. Improve frontend with React/Vue
10. Add audit logging for flag changes
