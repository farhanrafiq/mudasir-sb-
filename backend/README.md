# Union Registry Backend API

Backend API for the Kashmir Petroleum Dealers Association Union Registry application.

## Features

- **RESTful API** with comprehensive endpoints for dealers, employees, and customers
- **JWT Authentication** with role-based access control (Admin & Dealer)
- **PostgreSQL Database** with proper relational design and indexing
- **Complete Audit Logging** for all critical operations
- **Input Validation** using Joi schemas
- **TypeScript** for type safety
- **Secure Password Handling** with bcrypt

## API Documentation

### Health & Diagnostics
- `GET /health` — Returns API health status
- `GET /test-db` — Returns MongoDB connection status

### Authentication
- `POST /api/auth/admin/login` — Admin login
- `POST /api/auth/dealer/login` — Dealer login
- `POST /api/auth/forgot-password` — Forgot password
- `POST /api/auth/logout` — Logout

### Users
- `GET /api/users` — List all users
- `POST /api/users` — Create user
- `GET /api/users/:id` — Get user by ID
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

### Dealers
- `GET /api/admin/dealers` — List all dealers
- `POST /api/admin/dealers` — Create dealer
- `GET /api/admin/dealers/:id` — Get dealer by ID
- `PUT /api/admin/dealers/:id` — Update dealer
- `DELETE /api/admin/dealers/:id` — Delete dealer

### Employees
- `GET /api/dealer/employees` — List all employees for dealer
- `POST /api/dealer/employees` — Create employee
- `GET /api/dealer/employees/:id` — Get employee by ID
- `PUT /api/dealer/employees/:id` — Update employee
- `DELETE /api/dealer/employees/:id` — Delete employee

### Customers
- `GET /api/dealer/customers` — List all customers for dealer
- `POST /api/dealer/customers` — Create customer
- `GET /api/dealer/customers/:id` — Get customer by ID
- `PUT /api/dealer/customers/:id` — Update customer
- `DELETE /api/dealer/customers/:id` — Delete customer

### Audit Logs
- `GET /api/admin/audit-logs` — List all audit logs

---
For request/response formats, authentication details, and error codes, see inline comments in route/controller files.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Joi
- **CORS**: Enabled for frontend integration

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Clone the repository** (if not already done)

2. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create a `.env` file** based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables** in `.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=union_registry
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=8h
   
   CORS_ORIGIN=http://localhost:5173
   
   ADMIN_PASSWORD=Union@2025
   ```

## Database Setup

1. **Create the PostgreSQL database**:
   ```sql
   CREATE DATABASE union_registry;
   ```

2. **Run the database schema**:
   ```bash
   psql -U postgres -d union_registry -f database/schema.sql
   ```

3. **Create the admin user**:
   ```bash
   npm run create-admin
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### POST `/auth/admin/login`
Admin login endpoint.

**Request Body**:
```json
{
  "password": "Union@2025"
}
```

**Response** (200):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "role": "admin",
    "name": "System Administrator",
    "username": "admin",
    "email": "admin@unionregistry.com"
  }
}
```

#### POST `/auth/dealer/login`
Dealer login endpoint.

**Request Body**:
```json
{
  "email": "dealer@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "role": "dealer",
    "name": "Dealer Name",
    "username": "dealer_username",
    "email": "dealer@example.com"
  }
}
```

#### POST `/auth/forgot-password`
Request password reset.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (204): No content

### User Endpoints

All user endpoints require authentication (Bearer token in Authorization header).

#### PUT `/users/me/password`
Change user password.

**Request Body**:
```json
{
  "newPassword": "newPassword123"
}
```

#### PUT `/users/me/profile`
Update user profile.

**Request Body**:
```json
{
  "name": "New Name",
  "username": "new_username"
}
```

### Admin Endpoints

All admin endpoints require admin authentication.

#### GET `/admin/dealers`
Get all dealers.

#### GET `/admin/audit-logs`
Get all audit logs.

#### POST `/admin/dealers`
Create a new dealer.

**Request Body**:
```json
{
  "company_name": "ABC Petroleum",
  "primary_contact_name": "John Doe",
  "primary_contact_phone": "9876543210",
  "primary_contact_email": "john@abc.com",
  "address": "123 Main St, City",
  "username": "abcpetrol",
  "name": "John Doe"
}
```

#### PUT `/admin/dealers/:dealerId`
Update dealer information.

#### DELETE `/admin/dealers/:dealerId`
Delete a dealer and all associated data.

#### POST `/admin/users/:userId/reset-password`
Reset a user's password.

**Response**:
```json
{
  "tempPass": "generated_password"
}
```

### Dealer Endpoints

All dealer endpoints require dealer authentication.

#### GET `/dealer/employees`
Get all employees for the logged-in dealer.

#### POST `/dealer/employees`
Create a new employee.

**Request Body**:
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "9876543210",
  "email": "jane@example.com",
  "aadhar": "123456789012",
  "position": "Manager",
  "hire_date": "2024-01-15"
}
```

#### PUT `/dealer/employees/:employeeId`
Update an employee (cannot change Aadhar).

#### POST `/dealer/employees/:employeeId/terminate`
Terminate an employee.

**Request Body**:
```json
{
  "reason": "Resignation",
  "date": "2024-12-31"
}
```

#### GET `/dealer/customers`
Get all customers for the logged-in dealer.

#### POST `/dealer/customers`
Create a new customer.

**Request Body**:
```json
{
  "type": "private",
  "name_or_entity": "Customer Name",
  "contact_person": "Contact Person",
  "phone": "9876543210",
  "email": "customer@example.com",
  "official_id": "PAN123456",
  "address": "Customer Address"
}
```

#### PUT `/dealer/customers/:customerId`
Update a customer.

#### GET `/dealer/audit-logs`
Get audit logs for the logged-in dealer.

### Universal Search Endpoints

Requires authentication (Admin or Dealer).

#### GET `/search?q={query}`
Search for employees by name, phone, or Aadhar.

**Response**:
```json
[
  {
    "id": "uuid",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "9876543210",
    "aadhar": "123456789012",
    "position": "Manager",
    "status": "active",
    "hire_date": "2024-01-15",
    "termination_date": null,
    "employer_name": "ABC Petroleum",
    "dealer_id": "uuid"
  }
]
```

#### GET `/employees/check-aadhar?aadhar={aadhar}`
Check if an employee with the given Aadhar exists.

**Response**: Returns employee object if found, or `null`.

## Error Handling

The API uses standard HTTP status codes:

- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error

Error responses have the following format:
```json
{
  "message": "Error message here"
}
```

Validation errors include additional details:
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **JWT Authentication**: Tokens expire after 8 hours by default
- **Role-Based Access Control**: Separate permissions for admin and dealer roles
- **Input Validation**: All request bodies are validated using Joi schemas
- **SQL Injection Protection**: Parameterized queries via pg library
- **CORS Configuration**: Restricts API access to specified origins
- **Audit Logging**: All critical operations are logged with user details

## Database Schema

The database includes the following tables:

- **users**: User accounts (admin and dealer)
- **dealers**: Dealer company information
- **employees**: Employee records
- **customers**: Customer records
- **audit_logs**: System audit trail

See `database/schema.sql` for the complete schema definition.

## Development

### Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── database/        # Database connection
│   ├── middleware/      # Express middleware
│   ├── models/          # Data access layer
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Helper functions
│   ├── validators/      # Joi validation schemas
│   └── server.ts        # Application entry point
├── database/
│   └── schema.sql       # Database schema
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run create-admin`: Create admin user in database

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if the database exists

### Authentication Issues
- Ensure JWT_SECRET is set in `.env`
- Check if the token is being sent in the Authorization header as `Bearer <token>`

### CORS Issues
- Verify CORS_ORIGIN in `.env` matches your frontend URL
- Ensure the frontend is sending requests to the correct API URL

## License

ISC

## Support

For issues or questions, please contact the development team.
