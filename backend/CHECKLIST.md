# Backend Setup Checklist

Complete this checklist to ensure your Union Registry Backend is properly set up.

## Pre-Installation Checklist

- [ ] **Node.js installed** (v18 or higher)
  ```powershell
  node --version
  ```
  Expected: v18.x.x or higher

- [ ] **PostgreSQL installed** (v14 or higher)
  ```powershell
  psql --version
  ```
  Expected: psql 14.x or higher

- [ ] **npm available**
  ```powershell
  npm --version
  ```

- [ ] **Git installed** (optional, for version control)
  ```powershell
  git --version
  ```

## Installation Checklist

- [ ] **Navigate to backend directory**
  ```powershell
  cd backend
  ```

- [ ] **Install dependencies**
  ```powershell
  npm install
  ```
  Expected: No errors, all packages installed

- [ ] **Verify package.json scripts**
  Check that these scripts exist:
  - `dev` - Development server
  - `build` - Production build
  - `start` - Production server
  - `create-admin` - Admin user creation

## Database Setup Checklist

- [ ] **PostgreSQL service running**
  ```powershell
  Get-Service -Name "postgresql*"
  ```
  Status should be "Running"

- [ ] **Create database**
  ```powershell
  psql -U postgres -c "CREATE DATABASE union_registry;"
  ```
  Expected: CREATE DATABASE

- [ ] **Apply schema**
  ```powershell
  psql -U postgres -d union_registry -f database/schema.sql
  ```
  Expected: No errors, all tables created

- [ ] **Verify tables created**
  ```powershell
  psql -U postgres -d union_registry -c "\dt"
  ```
  Expected: List of 5 tables (users, dealers, employees, customers, audit_logs)

- [ ] **Check UUID extension**
  ```powershell
  psql -U postgres -d union_registry -c "SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';"
  ```
  Expected: UUID extension installed

## Configuration Checklist

- [ ] **.env file created**
  ```powershell
  Test-Path .env
  ```
  Expected: True

- [ ] **Database credentials configured**
  In `.env`, verify:
  - DB_HOST=localhost
  - DB_PORT=5432
  - DB_NAME=union_registry
  - DB_USER=postgres
  - DB_PASSWORD=your_actual_password

- [ ] **JWT secret configured**
  In `.env`, verify:
  - JWT_SECRET is set (minimum 32 characters)
  - JWT_EXPIRES_IN=8h

- [ ] **Server port configured**
  In `.env`, verify:
  - PORT=3001 (or your preferred port)

- [ ] **CORS origin configured**
  In `.env`, verify:
  - CORS_ORIGIN=http://localhost:5173 (or your frontend URL)

- [ ] **Admin password configured**
  In `.env`, verify:
  - ADMIN_PASSWORD=Union@2025 (or your preferred password)

## Admin User Setup Checklist

- [ ] **Create admin user**
  ```powershell
  npm run create-admin
  ```
  Expected: "Admin user created successfully"

- [ ] **Verify admin user in database**
  ```powershell
  psql -U postgres -d union_registry -c "SELECT email, role FROM users WHERE role = 'admin';"
  ```
  Expected: admin@unionregistry.com | admin

## Server Startup Checklist

- [ ] **Start development server**
  ```powershell
  npm run dev
  ```
  Expected output:
  - "Database connected successfully"
  - "Server running on port 3001"
  - "Environment: development"

- [ ] **Verify server is listening**
  In a new PowerShell window:
  ```powershell
  Get-NetTCPConnection -LocalPort 3001
  ```
  Expected: Connection in LISTENING state

- [ ] **Test health endpoint**
  ```powershell
  curl http://localhost:3001/health
  ```
  Expected: {"status":"ok","timestamp":"..."}

## API Testing Checklist

- [ ] **Test admin login**
  ```powershell
  $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/admin/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"password":"Union@2025"}'
  
  $response.token
  ```
  Expected: JWT token returned

- [ ] **Save admin token**
  ```powershell
  $adminToken = $response.token
  ```

- [ ] **Test authenticated endpoint**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3001/api/admin/dealers" `
    -Method GET `
    -Headers @{Authorization = "Bearer $adminToken"}
  ```
  Expected: Empty array [] (no dealers yet)

- [ ] **Test dealer creation**
  ```powershell
  $dealerData = @{
      company_name = "Test Petroleum Ltd"
      primary_contact_name = "Test User"
      primary_contact_phone = "9876543210"
      primary_contact_email = "test@testpetrol.com"
      address = "123 Test Street"
      username = "testpetrol"
      name = "Test User"
  } | ConvertTo-Json

  $dealer = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/dealers" `
    -Method POST `
    -Headers @{Authorization = "Bearer $adminToken"} `
    -ContentType "application/json" `
    -Body $dealerData
  
  Write-Host "Dealer created! Temp password: $($dealer.tempPass)"
  ```
  Expected: Dealer object returned with tempPass

- [ ] **Test dealer login**
  ```powershell
  $dealerLogin = @{
      email = "test@testpetrol.com"
      password = $dealer.tempPass
  } | ConvertTo-Json

  $dealerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/dealer/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $dealerLogin
  
  $dealerToken = $dealerResponse.token
  Write-Host "Dealer logged in successfully!"
  ```
  Expected: JWT token returned

- [ ] **Test employee creation**
  ```powershell
  $employeeData = @{
      first_name = "John"
      last_name = "Doe"
      phone = "9123456789"
      email = "john@example.com"
      aadhar = "123456789012"
      position = "Manager"
      hire_date = "2024-01-15"
  } | ConvertTo-Json

  $employee = Invoke-RestMethod -Uri "http://localhost:3001/api/dealer/employees" `
    -Method POST `
    -Headers @{Authorization = "Bearer $dealerToken"} `
    -ContentType "application/json" `
    -Body $employeeData
  
  Write-Host "Employee created: $($employee.first_name) $($employee.last_name)"
  ```
  Expected: Employee object returned

- [ ] **Test duplicate Aadhar prevention**
  ```powershell
  # Try to create another employee with same Aadhar
  $duplicateEmployee = @{
      first_name = "Jane"
      last_name = "Smith"
      phone = "9234567890"
      email = "jane@example.com"
      aadhar = "123456789012"  # Same as above
      position = "Clerk"
      hire_date = "2024-02-01"
  } | ConvertTo-Json

  try {
      Invoke-RestMethod -Uri "http://localhost:3001/api/dealer/employees" `
        -Method POST `
        -Headers @{Authorization = "Bearer $dealerToken"} `
        -ContentType "application/json" `
        -Body $duplicateEmployee
  } catch {
      Write-Host "✓ Duplicate Aadhar correctly rejected"
  }
  ```
  Expected: 409 Conflict error

- [ ] **Test search functionality**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=John" `
    -Method GET `
    -Headers @{Authorization = "Bearer $dealerToken"}
  ```
  Expected: Array with John Doe employee

- [ ] **Test audit logs**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3001/api/admin/audit-logs" `
    -Method GET `
    -Headers @{Authorization = "Bearer $adminToken"}
  ```
  Expected: Array of audit log entries

## File Structure Verification Checklist

- [ ] **Check all source files exist**
  ```powershell
  $files = @(
      "src/server.ts",
      "src/config/index.ts",
      "src/types/index.ts",
      "src/database/index.ts",
      "src/middleware/auth.ts",
      "src/middleware/validation.ts",
      "src/middleware/errorHandler.ts",
      "src/utils/auth.ts",
      "src/utils/jwt.ts",
      "src/models/User.ts",
      "src/models/Dealer.ts",
      "src/models/Employee.ts",
      "src/models/Customer.ts",
      "src/models/AuditLog.ts",
      "src/controllers/authController.ts",
      "src/controllers/userController.ts",
      "src/controllers/adminController.ts",
      "src/controllers/dealerController.ts",
      "src/controllers/searchController.ts",
      "src/routes/authRoutes.ts",
      "src/routes/userRoutes.ts",
      "src/routes/adminRoutes.ts",
      "src/routes/dealerRoutes.ts",
      "src/routes/searchRoutes.ts",
      "src/validators/schemas.ts",
      "src/scripts/createAdmin.ts"
  )
  
  foreach ($file in $files) {
      if (Test-Path $file) {
          Write-Host "✓ $file"
      } else {
          Write-Host "✗ $file MISSING"
      }
  }
  ```

- [ ] **Check documentation files exist**
  ```powershell
  $docs = @(
      "README.md",
      "SETUP.md",
      "API_TESTING.md",
      "DEPLOYMENT.md",
      "TROUBLESHOOTING.md",
      "IMPLEMENTATION_SUMMARY.md"
  )
  
  foreach ($doc in $docs) {
      if (Test-Path $doc) {
          Write-Host "✓ $doc"
      } else {
          Write-Host "✗ $doc MISSING"
      }
  }
  ```

- [ ] **Check configuration files exist**
  ```powershell
  $configs = @(
      "package.json",
      "tsconfig.json",
      "nodemon.json",
      ".env",
      ".env.example",
      ".gitignore",
      "database/schema.sql"
  )
  
  foreach ($config in $configs) {
      if (Test-Path $config) {
          Write-Host "✓ $config"
      } else {
          Write-Host "✗ $config MISSING"
      }
  }
  ```

## Security Checklist

- [ ] **JWT secret is secure** (not the default)
- [ ] **Database password is strong**
- [ ] **Admin password changed** (if production)
- [ ] **.env not committed to git**
  ```powershell
  git check-ignore .env
  ```
  Expected: .env (if using git)

- [ ] **CORS origin matches frontend**
- [ ] **No sensitive data in logs**

## Production Readiness Checklist

- [ ] **Build succeeds without errors**
  ```powershell
  npm run build
  ```
  Expected: dist/ folder created

- [ ] **Production environment variables set**
- [ ] **Database backups configured**
- [ ] **SSL/HTTPS configured** (for production)
- [ ] **Monitoring setup** (PM2, logs, etc.)
- [ ] **Documentation reviewed**

## Troubleshooting Checklist

If something doesn't work:

- [ ] Check server is running
- [ ] Check PostgreSQL is running
- [ ] Check .env file has correct values
- [ ] Check no firewall blocking ports
- [ ] Review logs for errors
- [ ] Consult TROUBLESHOOTING.md

## Final Verification

Run this comprehensive test:

```powershell
Write-Host "=== Union Registry Backend Verification ==="
Write-Host ""

# 1. Check Node.js
Write-Host "1. Node.js version:"
node --version

# 2. Check PostgreSQL
Write-Host "2. PostgreSQL service:"
Get-Service -Name "postgresql*" | Select-Object Name, Status

# 3. Check database
Write-Host "3. Database tables:"
psql -U postgres -d union_registry -c "\dt" -t

# 4. Check .env
Write-Host "4. Configuration file:"
if (Test-Path .env) { Write-Host "✓ .env exists" } else { Write-Host "✗ .env missing" }

# 5. Check server
Write-Host "5. Server health:"
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health"
    Write-Host "✓ Server is healthy"
    Write-Host "   Status: $($health.status)"
} catch {
    Write-Host "✗ Server not responding"
}

Write-Host ""
Write-Host "=== Verification Complete ==="
```

## Success Criteria

✅ All checkboxes checked
✅ No errors in any step
✅ Server responds to health check
✅ Admin login works
✅ Dealer creation works
✅ Employee creation works
✅ Audit logs are created

## Next Steps After Successful Setup

1. Review API documentation (README.md)
2. Test all endpoints (API_TESTING.md)
3. Connect frontend to backend
4. Plan for production deployment (DEPLOYMENT.md)

---

**Congratulations! Your Union Registry Backend is ready!** 🎉

For issues, see: TROUBLESHOOTING.md
For deployment: DEPLOYMENT.md
For API details: README.md
