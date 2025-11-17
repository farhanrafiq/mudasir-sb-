# API Documentation

This document describes the main endpoints for the Union Registry backend API.

## Health Check
- **GET /health**
  - Returns API status and timestamp.
  - Response: `{ status: 'ok', timestamp: string }`

## Auth Endpoints
- **POST /api/auth/login**
  - Login for users (admin, dealer).
  - Body: `{ username, password }`
  - Response: `{ token, user }`

- **POST /api/auth/forgot-password**
  - Request password reset.
  - Body: `{ email }`

## User Endpoints
- **GET /api/users**
  - List all users.
- **GET /api/users/:id**
  - Get user by ID.
- **PUT /api/users/:id**
  - Update user profile.
- **DELETE /api/users/:id**
  - Delete user.

## Dealer Endpoints
- **GET /api/dealer**
  - List all dealers.
- **GET /api/dealer/:id**
  - Get dealer by ID.
- **POST /api/dealer**
  - Create dealer.
- **PUT /api/dealer/:id**
  - Update dealer.
- **DELETE /api/dealer/:id**
  - Delete dealer and related employees/customers.

## Employee Endpoints
- **GET /api/dealer/employees**
  - List all employees for dealer.
- **POST /api/dealer/employees**
  - Create employee.
- **PUT /api/dealer/employees/:id**
  - Update employee.
- **DELETE /api/dealer/employees/:id**
  - Delete employee.
- **POST /api/dealer/employees/:id/terminate**
  - Terminate employee.

## Customer Endpoints
- **GET /api/dealer/customers**
  - List all customers for dealer.
- **POST /api/dealer/customers**
  - Create customer.
- **PUT /api/dealer/customers/:id**
  - Update customer.
- **DELETE /api/dealer/customers/:id**
  - Delete customer.

## Audit Log Endpoints
- **GET /api/dealer/audit-logs**
  - List audit logs for dealer.
- **POST /api/dealer/audit-logs**
  - Create audit log entry.

## Search Endpoints
- **GET /api/search/all**
  - Global search for users, dealers, employees, customers.

---

For request/response details, see the backend validators and models. All endpoints return standardized error responses.
