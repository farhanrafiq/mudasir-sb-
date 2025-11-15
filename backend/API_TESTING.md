# API Endpoints Reference

## Base URL
```
http://localhost:3001/api
```

## Test Sequence

### 1. Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "password": "Union@2025"
}
```

Save the token from response!

### 2. Create a Dealer (as Admin)
```http
POST /api/admin/dealers
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "company_name": "Kashmir Petroleum Ltd",
  "primary_contact_name": "Ahmed Khan",
  "primary_contact_phone": "9876543210",
  "primary_contact_email": "ahmed@kashmirpetrol.com",
  "address": "123 Main Street, Srinagar, J&K 190001",
  "username": "kashmirpetrol",
  "name": "Ahmed Khan"
}
```

Save the tempPass from response!

### 3. Dealer Login
```http
POST /api/auth/dealer/login
Content-Type: application/json

{
  "email": "ahmed@kashmirpetrol.com",
  "password": "THE_TEMP_PASSWORD_FROM_STEP_2"
}
```

Save the dealer token!

### 4. Change Password (as Dealer)
```http
PUT /api/users/me/password
Authorization: Bearer YOUR_DEALER_TOKEN
Content-Type: application/json

{
  "newPassword": "NewSecurePassword123!"
}
```

### 5. Create an Employee (as Dealer)
```http
POST /api/dealer/employees
Authorization: Bearer YOUR_DEALER_TOKEN
Content-Type: application/json

{
  "first_name": "Fatima",
  "last_name": "Ahmed",
  "phone": "9123456789",
  "email": "fatima@example.com",
  "aadhar": "123456789012",
  "position": "Sales Manager",
  "hire_date": "2024-01-15"
}
```

### 6. Create Another Employee (Should Work)
```http
POST /api/dealer/employees
Authorization: Bearer YOUR_DEALER_TOKEN
Content-Type: application/json

{
  "first_name": "Mohammad",
  "last_name": "Rashid",
  "phone": "9234567890",
  "email": "mohammad@example.com",
  "aadhar": "234567890123",
  "position": "Operations Manager",
  "hire_date": "2024-02-01"
}
```

### 7. Try to Create Duplicate Aadhar (Should Fail with 409)
```http
POST /api/dealer/employees
Authorization: Bearer YOUR_DEALER_TOKEN
Content-Type: application/json

{
  "first_name": "Test",
  "last_name": "User",
  "phone": "9345678901",
  "email": "test@example.com",
  "aadhar": "123456789012",
  "position": "Clerk",
  "hire_date": "2024-03-01"
}
```

### 8. Search for Employee
```http
GET /api/search?q=Fatima
Authorization: Bearer YOUR_DEALER_TOKEN
```

### 9. Check Aadhar
```http
GET /api/employees/check-aadhar?aadhar=123456789012
Authorization: Bearer YOUR_DEALER_TOKEN
```

### 10. Get All Employees (as Dealer)
```http
GET /api/dealer/employees
Authorization: Bearer YOUR_DEALER_TOKEN
```

### 11. Create a Customer
```http
POST /api/dealer/customers
Authorization: Bearer YOUR_DEALER_TOKEN
Content-Type: application/json

{
  "type": "government",
  "name_or_entity": "J&K State Road Transport Corporation",
  "contact_person": "Director Operations",
  "phone": "9456789012",
  "email": "operations@jksrtc.com",
  "official_id": "GSTIN29ABCDE1234F1Z5",
  "address": "Transport Bhawan, Srinagar, J&K"
}
```

### 12. Terminate an Employee
```http
POST /api/dealer/employees/{EMPLOYEE_ID}/terminate
Authorization: Bearer YOUR_DEALER_TOKEN
Content-Type: application/json

{
  "reason": "Resignation - Better opportunity",
  "date": "2024-11-30"
}
```

### 13. Get All Dealers (as Admin)
```http
GET /api/admin/dealers
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 14. Get Audit Logs (as Admin)
```http
GET /api/admin/audit-logs
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 15. Get Dealer Audit Logs (as Dealer)
```http
GET /api/dealer/audit-logs
Authorization: Bearer YOUR_DEALER_TOKEN
```

### 16. Update Dealer Status (as Admin)
```http
PUT /api/admin/dealers/{DEALER_ID}
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "status": "suspended"
}
```

### 17. Reset Dealer Password (as Admin)
```http
POST /api/admin/users/{USER_ID}/reset-password
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 18. Update Profile
```http
PUT /api/users/me/profile
Authorization: Bearer YOUR_DEALER_TOKEN
Content-Type: application/json

{
  "name": "Ahmed Khan Updated",
  "username": "kashmirpetrol_new"
}
```

### 19. Forgot Password (Public)
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "ahmed@kashmirpetrol.com"
}
```

### 20. Health Check (Public)
```http
GET /health
```

## PowerShell Testing Commands

### Admin Login
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/admin/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"password":"Union@2025"}'

$adminToken = $response.token
Write-Host "Admin Token: $adminToken"
```

### Create Dealer
```powershell
$dealerData = @{
    company_name = "Kashmir Petroleum Ltd"
    primary_contact_name = "Ahmed Khan"
    primary_contact_phone = "9876543210"
    primary_contact_email = "ahmed@kashmirpetrol.com"
    address = "123 Main Street, Srinagar, J&K"
    username = "kashmirpetrol"
    name = "Ahmed Khan"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/dealers" `
  -Method POST `
  -Headers @{Authorization = "Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $dealerData

Write-Host "Temp Password: $($response.tempPass)"
```

### Dealer Login
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/dealer/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"ahmed@kashmirpetrol.com","password":"TEMP_PASSWORD_HERE"}'

$dealerToken = $response.token
Write-Host "Dealer Token: $dealerToken"
```

### Get Employees
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/dealer/employees" `
  -Method GET `
  -Headers @{Authorization = "Bearer $dealerToken"}
```

## Expected Response Codes

- **200**: Success (GET, PUT requests)
- **201**: Created (POST requests)
- **204**: No Content (DELETE, forgot password)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error

## Common Validation Rules

- **Phone**: Must be exactly 10 digits
- **Aadhar**: Must be exactly 12 digits
- **Email**: Must be valid email format
- **Password**: Minimum 8 characters
- **Username**: Alphanumeric, 3-30 characters
- **Dates**: ISO format (YYYY-MM-DD)
