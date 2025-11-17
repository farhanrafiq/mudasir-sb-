# Union Registry API Documentation

## Authentication
- `POST /api/auth/login` — Login for admin/dealer
- `POST /api/auth/force-password-change` — Force password change
- `POST /api/auth/forgot-password` — Forgot password
- `POST /api/auth/reset-password` — Reset password

## Users
- `GET /api/users` — List all users
- `GET /api/users/:id` — Get user by ID
- `POST /api/users` — Create user
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

## Dealers
- `GET /api/admin/dealers` — List all dealers (admin)
- `GET /api/dealer/:id` — Get dealer by ID
- `POST /api/admin/dealers` — Create dealer (admin)
- `PUT /api/dealer/:id` — Update dealer
- `DELETE /api/dealer/:id` — Delete dealer

## Employees
- `GET /api/dealer/employees` — List all employees for dealer
- `GET /api/dealer/employees/:id` — Get employee by ID
- `POST /api/dealer/employees` — Create employee
- `PUT /api/dealer/employees/:id` — Update employee
- `DELETE /api/dealer/employees/:id` — Delete employee

## Customers
- `GET /api/dealer/customers` — List all customers for dealer
- `GET /api/dealer/customers/:id` — Get customer by ID
- `POST /api/dealer/customers` — Create customer
- `PUT /api/dealer/customers/:id` — Update customer
- `DELETE /api/dealer/customers/:id` — Delete customer

## Audit Logs
- `GET /api/dealer/audit-logs` — List audit logs for dealer
- `GET /api/dealer/audit-logs/:id` — Get audit log by ID

## Search
- `GET /api/search/employees` — Universal employee search
- `GET /api/search/customers` — Universal customer search

## Health
- `GET /health` — Health check

---

**All endpoints require JWT authentication unless otherwise noted.**

For request/response formats, error codes, and more details, see the README or contact the backend maintainer.