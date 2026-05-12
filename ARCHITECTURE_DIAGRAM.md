# System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MULTI-TENANT FEATURE FLAG SYSTEM                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER                            │
├──────────────────┬──────────────────┬──────────────────────────────┤
│                  │                  │                              │
│  Super Admin     │  Org Admin       │  End User                    │
│  Frontend        │  Frontend        │  Frontend                    │
│                  │                  │                              │
│  - Login         │  - Signup        │  - Feature Checker           │
│  - Create Orgs   │  - Login         │  - No Auth Required          │
│  - List Orgs     │  - Manage Flags  │  - Check Feature Status      │
│                  │  - Toggle Flags  │                              │
│                  │                  │                              │
│  Port: 8001      │  Port: 8002      │  Port: 8003                  │
│                  │                  │                              │
└────────┬─────────┴────────┬─────────┴────────┬─────────────────────┘
         │                  │                  │
         │ HTTP/HTTPS       │ HTTP/HTTPS       │ HTTP/HTTPS
         │                  │                  │
         └──────────────────┴──────────────────┴─────────────────────┐
                                                                      │
                                                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EXPRESS.JS SERVER                             │
│                         Port: 3000                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                         │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │  • CORS (Allow All Origins)                                │   │
│  │  • Body Parser (JSON)                                      │   │
│  │  • JWT Verification                                        │   │
│  │  • Role-Based Access Control                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                      API ROUTES                             │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │                                                             │   │
│  │  /api/auth                                                  │   │
│  │  ├─ POST /super-admin/login  (Public)                      │   │
│  │  ├─ POST /admin/signup        (Public)                      │   │
│  │  └─ POST /admin/login         (Public)                      │   │
│  │                                                             │   │
│  │  /api/organizations                                         │   │
│  │  ├─ POST   /                  (Super Admin)                │   │
│  │  ├─ GET    /                  (Super Admin)                │   │
│  │  └─ GET    /:id               (Public)                      │   │
│  │                                                             │   │
│  │  /api/feature-flags                                         │   │
│  │  ├─ POST   /                  (Org Admin)                  │   │
│  │  ├─ GET    /                  (Org Admin)                  │   │
│  │  ├─ PUT    /:id               (Org Admin)                  │   │
│  │  ├─ DELETE /:id               (Org Admin)                  │   │
│  │  └─ POST   /check             (Public)                      │   │
│  │                                                             │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   AUTHENTICATION LAYER                      │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │  • JWT Token Generation (jsonwebtoken)                     │   │
│  │  • Password Hashing (bcryptjs)                             │   │
│  │  • Token Expiration: 24 hours                              │   │
│  │  • Secret Key: Configurable                                │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                  IN-MEMORY DATABASE                         │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │                                                             │   │
│  │  Organizations []                                           │   │
│  │  ├─ id: UUID                                               │   │
│  │  ├─ name: String                                           │   │
│  │  ├─ description: String                                     │   │
│  │  └─ createdAt: Date                                        │   │
│  │                                                             │   │
│  │  Users []                                                   │   │
│  │  ├─ id: UUID                                               │   │
│  │  ├─ email: String                                          │   │
│  │  ├─ password: Hash                                         │   │
│  │  ├─ name: String                                           │   │
│  │  ├─ role: 'org-admin'                                      │   │
│  │  ├─ organizationId: UUID                                   │   │
│  │  └─ createdAt: Date                                        │   │
│  │                                                             │   │
│  │  Feature Flags []                                           │   │
│  │  ├─ id: UUID                                               │   │
│  │  ├─ organizationId: UUID                                   │   │
│  │  ├─ key: String                                            │   │
│  │  ├─ description: String                                     │   │
│  │  ├─ enabled: Boolean                                       │   │
│  │  ├─ createdAt: Date                                        │   │
│  │  └─ updatedAt: Date                                        │   │
│  │                                                             │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                          USER FLOWS                                  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ SUPER ADMIN FLOW                                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Login with static credentials                                │
│     ↓                                                            │
│  2. POST /api/auth/super-admin/login                             │
│     ↓                                                            │
│  3. Receive JWT token                                            │
│     ↓                                                            │
│  4. Create organization                                          │
│     ↓                                                            │
│  5. POST /api/organizations (with token)                         │
│     ↓                                                            │
│  6. View all organizations                                       │
│     ↓                                                            │
│  7. GET /api/organizations (with token)                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ ORGANIZATION ADMIN FLOW                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Receive Organization ID from Super Admin                     │
│     ↓                                                            │
│  2. Sign up with organization ID                                 │
│     ↓                                                            │
│  3. POST /api/auth/admin/signup                                  │
│     ↓                                                            │
│  4. Receive JWT token                                            │
│     ↓                                                            │
│  5. Create feature flags                                         │
│     ↓                                                            │
│  6. POST /api/feature-flags (with token)                         │
│     ↓                                                            │
│  7. Manage flags (enable/disable/delete)                         │
│     ↓                                                            │
│  8. PUT /api/feature-flags/:id (with token)                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ END USER FLOW                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Receive Organization ID from admin                           │
│     ↓                                                            │
│  2. Enter organization ID and feature key                        │
│     ↓                                                            │
│  3. POST /api/feature-flags/check (no auth)                      │
│     ↓                                                            │
│  4. See if feature is enabled or disabled                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      SECURITY MODEL                                  │
└─────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │ Super Admin │  System-wide access
  └──────┬──────┘
         │
         │ Can create
         ▼
  ┌─────────────────┐
  │ Organizations   │  Tenant boundaries
  └──────┬──────────┘
         │
         │ Contains
         ▼
  ┌─────────────────┐
  │ Org Admins      │  Organization-scoped access
  └──────┬──────────┘
         │
         │ Manage
         ▼
  ┌─────────────────┐
  │ Feature Flags   │  Organization-scoped data
  └──────┬──────────┘
         │
         │ Checked by
         ▼
  ┌─────────────────┐
  │ End Users       │  Read-only access (no auth)
  └─────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                                  │
└─────────────────────────────────────────────────────────────────────┘

Backend                          Frontend
├─ Node.js v14+                  ├─ HTML5
├─ Express.js 4.x                ├─ CSS3 (Inline)
├─ bcryptjs 2.4.3                ├─ Vanilla JavaScript
├─ jsonwebtoken 9.0.2            ├─ Fetch API
├─ uuid 9.0.0                    └─ No frameworks
├─ cors 2.8.5
└─ In-memory storage

Authentication                   Authorization
├─ JWT tokens                    ├─ Role-based
├─ 24h expiration                ├─ Super Admin
├─ bcrypt hashing                ├─ Org Admin
└─ Bearer token                  └─ Public endpoints


┌─────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT VIEW                                   │
└─────────────────────────────────────────────────────────────────────┘

Development Environment:

   ┌──────────────┐
   │   Browser    │  Open index.html files
   └──────┬───────┘
          │
          │ HTTP Requests
          │
          ▼
   ┌──────────────┐
   │ Node Server  │  npm start
   │ Port 3000    │
   └──────────────┘


Production Environment (Recommended):

   ┌──────────────┐
   │ Load Balancer│
   └──────┬───────┘
          │
          ├──────────────┬──────────────┐
          │              │              │
          ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ Frontend │   │ Frontend │   │ Frontend │
   │ CDN/S3   │   │ CDN/S3   │   │ CDN/S3   │
   └──────────┘   └──────────┘   └──────────┘
          │              │              │
          └──────────────┴──────────────┘
                     │
                     ▼
          ┌──────────────────┐
          │   API Gateway    │
          └────────┬─────────┘
                   │
          ┌────────┴─────────┐
          │                  │
          ▼                  ▼
   ┌────────────┐     ┌────────────┐
   │ API Server │     │ API Server │
   │   Node.js  │     │   Node.js  │
   └─────┬──────┘     └─────┬──────┘
         │                  │
         └──────────┬───────┘
                    │
                    ▼
         ┌──────────────────┐
         │    Database      │
         │ PostgreSQL/Mongo │
         └──────────────────┘
```
