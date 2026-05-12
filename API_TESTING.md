# API Testing Examples

This document provides examples for testing all API endpoints using cURL or PowerShell.

## Health Check

### cURL
```bash
curl http://localhost:3000/api/health
```

### PowerShell
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/health -Method Get
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Feature Flag API is running"
}
```

---

## Super Admin Endpoints

### Login

#### cURL
```bash
curl -X POST http://localhost:3000/api/auth/super-admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"superadmin\",\"password\":\"Admin@123\"}"
```

#### PowerShell
```powershell
$body = @{
    username = "superadmin"
    password = "Admin@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:3000/api/auth/super-admin/login `
  -Method Post -Body $body -ContentType "application/json"

$token = $response.token
Write-Host "Token: $token"
```

### Create Organization

#### cURL
```bash
# Replace YOUR_TOKEN with the token from login
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"name\":\"Test Corp\",\"description\":\"A test organization\"}"
```

#### PowerShell
```powershell
$body = @{
    name = "Test Corp"
    description = "A test organization"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$org = Invoke-RestMethod -Uri http://localhost:3000/api/organizations `
  -Method Post -Body $body -Headers $headers

Write-Host "Organization ID: $($org.id)"
$orgId = $org.id
```

### List Organizations

#### cURL
```bash
curl http://localhost:3000/api/organizations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### PowerShell
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$orgs = Invoke-RestMethod -Uri http://localhost:3000/api/organizations `
  -Method Get -Headers $headers

$orgs | ForEach-Object { Write-Host "$($_.name) - $($_.id)" }
```

---

## Organization Admin Endpoints

### Sign Up

#### cURL
```bash
# Replace YOUR_ORG_ID with actual organization ID
curl -X POST http://localhost:3000/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"password123\",\"name\":\"John Admin\",\"organizationId\":\"YOUR_ORG_ID\"}"
```

#### PowerShell
```powershell
$body = @{
    email = "admin@test.com"
    password = "password123"
    name = "John Admin"
    organizationId = $orgId  # From previous step
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri http://localhost:3000/api/auth/admin/signup `
  -Method Post -Body $body -ContentType "application/json"

$adminToken = $adminResponse.token
Write-Host "Admin Token: $adminToken"
```

### Login

#### cURL
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"password123\"}"
```

#### PowerShell
```powershell
$body = @{
    email = "admin@test.com"
    password = "password123"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri http://localhost:3000/api/auth/admin/login `
  -Method Post -Body $body -ContentType "application/json"

$adminToken = $adminResponse.token
```

---

## Feature Flag Endpoints

### Create Feature Flag

#### cURL
```bash
curl -X POST http://localhost:3000/api/feature-flags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d "{\"key\":\"dark_mode\",\"description\":\"Enable dark mode UI\",\"enabled\":true}"
```

#### PowerShell
```powershell
$body = @{
    key = "dark_mode"
    description = "Enable dark mode UI"
    enabled = $true
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$flag = Invoke-RestMethod -Uri http://localhost:3000/api/feature-flags `
  -Method Post -Body $body -Headers $headers

Write-Host "Created flag: $($flag.key)"
```

### List Feature Flags

#### cURL
```bash
curl http://localhost:3000/api/feature-flags \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### PowerShell
```powershell
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

$flags = Invoke-RestMethod -Uri http://localhost:3000/api/feature-flags `
  -Method Get -Headers $headers

$flags | ForEach-Object { 
    Write-Host "$($_.key) - Enabled: $($_.enabled)" 
}
```

### Update Feature Flag

#### cURL
```bash
# Replace FLAG_ID with actual flag ID
curl -X PUT http://localhost:3000/api/feature-flags/FLAG_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d "{\"enabled\":false}"
```

#### PowerShell
```powershell
$flagId = $flag.id  # From create response

$body = @{
    enabled = $false
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$updated = Invoke-RestMethod -Uri "http://localhost:3000/api/feature-flags/$flagId" `
  -Method Put -Body $body -Headers $headers

Write-Host "Flag updated: Enabled = $($updated.enabled)"
```

### Delete Feature Flag

#### cURL
```bash
curl -X DELETE http://localhost:3000/api/feature-flags/FLAG_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### PowerShell
```powershell
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

$result = Invoke-RestMethod -Uri "http://localhost:3000/api/feature-flags/$flagId" `
  -Method Delete -Headers $headers

Write-Host $result.message
```

### Check Feature Status (Public - No Auth)

#### cURL
```bash
curl -X POST http://localhost:3000/api/feature-flags/check \
  -H "Content-Type: application/json" \
  -d "{\"organizationId\":\"YOUR_ORG_ID\",\"featureKey\":\"dark_mode\"}"
```

#### PowerShell
```powershell
$body = @{
    organizationId = $orgId
    featureKey = "dark_mode"
} | ConvertTo-Json

$status = Invoke-RestMethod -Uri http://localhost:3000/api/feature-flags/check `
  -Method Post -Body $body -ContentType "application/json"

Write-Host "Feature: $($status.featureKey)"
Write-Host "Enabled: $($status.enabled)"
Write-Host "Description: $($status.description)"
```

---

## Complete Test Flow (PowerShell Script)

Save this as `test-api.ps1`:

```powershell
# Complete API Test Flow

Write-Host "=== Testing Feature Flag API ===" -ForegroundColor Cyan

# 1. Health Check
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri http://localhost:3000/api/health -Method Get
Write-Host "Status: $($health.status)" -ForegroundColor Green

# 2. Super Admin Login
Write-Host "`n2. Super Admin Login..." -ForegroundColor Yellow
$loginBody = @{
    username = "superadmin"
    password = "Admin@123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri http://localhost:3000/api/auth/super-admin/login `
  -Method Post -Body $loginBody -ContentType "application/json"

$superToken = $loginResponse.token
Write-Host "Logged in as: $($loginResponse.user.username)" -ForegroundColor Green

# 3. Create Organization
Write-Host "`n3. Creating Organization..." -ForegroundColor Yellow
$orgBody = @{
    name = "Test Corp $(Get-Date -Format 'HHmmss')"
    description = "Test organization created via API"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $superToken"
    "Content-Type" = "application/json"
}

$org = Invoke-RestMethod -Uri http://localhost:3000/api/organizations `
  -Method Post -Body $orgBody -Headers $headers

Write-Host "Created: $($org.name)" -ForegroundColor Green
Write-Host "Org ID: $($org.id)" -ForegroundColor Cyan
$orgId = $org.id

# 4. Admin Signup
Write-Host "`n4. Admin Signup..." -ForegroundColor Yellow
$signupBody = @{
    email = "admin@test.com"
    password = "password123"
    name = "Test Admin"
    organizationId = $orgId
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri http://localhost:3000/api/auth/admin/signup `
  -Method Post -Body $signupBody -ContentType "application/json"

$adminToken = $adminResponse.token
Write-Host "Admin created: $($adminResponse.user.name)" -ForegroundColor Green

# 5. Create Feature Flags
Write-Host "`n5. Creating Feature Flags..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# Feature 1: Enabled
$flag1Body = @{
    key = "dark_mode"
    description = "Enable dark mode UI"
    enabled = $true
} | ConvertTo-Json

$flag1 = Invoke-RestMethod -Uri http://localhost:3000/api/feature-flags `
  -Method Post -Body $flag1Body -Headers $headers

Write-Host "  ✓ $($flag1.key) - Enabled: $($flag1.enabled)" -ForegroundColor Green

# Feature 2: Disabled
$flag2Body = @{
    key = "new_dashboard"
    description = "New dashboard redesign"
    enabled = $false
} | ConvertTo-Json

$flag2 = Invoke-RestMethod -Uri http://localhost:3000/api/feature-flags `
  -Method Post -Body $flag2Body -Headers $headers

Write-Host "  ✓ $($flag2.key) - Enabled: $($flag2.enabled)" -ForegroundColor Green

# 6. Check Feature Status (as end user)
Write-Host "`n6. Checking Feature Status (End User)..." -ForegroundColor Yellow

$checkBody1 = @{
    organizationId = $orgId
    featureKey = "dark_mode"
} | ConvertTo-Json

$status1 = Invoke-RestMethod -Uri http://localhost:3000/api/feature-flags/check `
  -Method Post -Body $checkBody1 -ContentType "application/json"

Write-Host "  Feature: $($status1.featureKey)" -ForegroundColor Cyan
Write-Host "  Status: $(if($status1.enabled){'✅ ENABLED'}else{'❌ DISABLED'})" -ForegroundColor $(if($status1.enabled){'Green'}else{'Red'})

$checkBody2 = @{
    organizationId = $orgId
    featureKey = "new_dashboard"
} | ConvertTo-Json

$status2 = Invoke-RestMethod -Uri http://localhost:3000/api/feature-flags/check `
  -Method Post -Body $checkBody2 -ContentType "application/json"

Write-Host "  Feature: $($status2.featureKey)" -ForegroundColor Cyan
Write-Host "  Status: $(if($status2.enabled){'✅ ENABLED'}else{'❌ DISABLED'})" -ForegroundColor $(if($status2.enabled){'Green'}else{'Red'})

# Summary
Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "Organization ID: $orgId" -ForegroundColor Yellow
Write-Host "Admin Email: admin@test.com" -ForegroundColor Yellow
Write-Host "Admin Password: password123" -ForegroundColor Yellow
Write-Host "`nYou can now test the frontends with these credentials!" -ForegroundColor Green
```

Run with:
```powershell
.\test-api.ps1
```

---

## Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Tips

1. **Save tokens**: Store tokens in variables for reuse across multiple requests
2. **Test incrementally**: Test each endpoint individually before running full flows
3. **Check responses**: Always verify the response structure matches expectations
4. **Error handling**: Look at error messages for debugging information
5. **CORS**: Make sure backend is running when testing from browser/frontends
