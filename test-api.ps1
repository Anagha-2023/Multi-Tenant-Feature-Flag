# Complete API Test Flow
# Run this script to test all endpoints

Write-Host "=== Testing Feature Flag API ===" -ForegroundColor Cyan

# 1. Health Check
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri http://localhost:3000/api/health -Method Get
    Write-Host "Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "Error: Cannot connect to API. Is the server running?" -ForegroundColor Red
    exit
}

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

# 6. List Feature Flags
Write-Host "`n6. Listing All Feature Flags..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

$flags = Invoke-RestMethod -Uri http://localhost:3000/api/feature-flags `
  -Method Get -Headers $headers

$flags | ForEach-Object {
    $status = if($_.enabled){"✅ ENABLED"}else{"❌ DISABLED"}
    Write-Host "  $($_.key): $status" -ForegroundColor $(if($_.enabled){'Green'}else{'Red'})
}

# 7. Check Feature Status (as end user)
Write-Host "`n7. Checking Feature Status (End User - No Auth)..." -ForegroundColor Yellow

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

# 8. Update Feature Flag
Write-Host "`n8. Toggling Feature Flag..." -ForegroundColor Yellow
$updateBody = @{
    enabled = $false
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$updated = Invoke-RestMethod -Uri "http://localhost:3000/api/feature-flags/$($flag1.id)" `
  -Method Put -Body $updateBody -Headers $headers

Write-Host "  $($updated.key) now: $(if($updated.enabled){'✅ ENABLED'}else{'❌ DISABLED'})" -ForegroundColor Yellow

# Summary
Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nCredentials for frontend testing:" -ForegroundColor White
Write-Host "  Organization ID: " -NoNewline -ForegroundColor White
Write-Host "$orgId" -ForegroundColor Yellow
Write-Host "  Admin Email: " -NoNewline -ForegroundColor White
Write-Host "admin@test.com" -ForegroundColor Yellow
Write-Host "  Admin Password: " -NoNewline -ForegroundColor White
Write-Host "password123" -ForegroundColor Yellow
Write-Host "`nYou can now test the frontends with these credentials!" -ForegroundColor Green
Write-Host "`nTo open frontends:" -ForegroundColor White
Write-Host "  1. Super Admin: Open super-admin-frontend\index.html" -ForegroundColor Cyan
Write-Host "  2. Org Admin: Open admin-frontend\index.html" -ForegroundColor Cyan
Write-Host "  3. End User: Open user-frontend\index.html" -ForegroundColor Cyan
