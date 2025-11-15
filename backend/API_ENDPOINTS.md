# API Endpoints Summary

## Dealer Endpoints
- `POST /api/dealer` - Create dealer
- `GET /api/dealer` - List dealers
- `PUT /api/dealer/:id` - Update dealer
- `DELETE /api/dealer/:id` - Delete dealer

## Employee Endpoints
- `POST /api/employee` - Create employee
- `GET /api/employee` - List employees
- `PUT /api/employee/:id` - Update employee
- `DELETE /api/employee/:id` - Terminate employee

## Customer Endpoints
- `POST /api/customer` - Create customer
- `GET /api/customer` - List customers
- `PUT /api/customer/:id` - Update customer
- `DELETE /api/customer/:id` - Delete customer

## Auth Endpoints
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/dealer-login` - Dealer login
- `POST /api/auth/forgot-password` - Forgot password

## Universal Search
- `GET /api/search/employees` - Search employees
- `GET /api/search/aadhar/:aadhar` - Check employee by Aadhar

## Validation & Error Handling
- All endpoints use Joi validation
- Centralized error handler middleware
