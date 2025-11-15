# Quick Setup Guide for Union Registry Backend

## Step-by-Step Setup

### 1. Install Dependencies
```powershell
cd backend
npm install
```

### 2. Setup PostgreSQL Database

#### Install PostgreSQL
If you don't have PostgreSQL installed, download and install it from:
https://www.postgresql.org/download/windows/

#### Create Database
Open PowerShell or Command Prompt and run:
```powershell
# Connect to PostgreSQL (you'll be prompted for password)
psql -U postgres

# In the psql prompt, create the database:
CREATE DATABASE union_registry;

# Exit psql
\q
```

#### Run Database Schema
```powershell
# From the backend directory
psql -U postgres -d union_registry -f database/schema.sql
```

You'll be prompted for the PostgreSQL password.

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:
```powershell
Copy-Item .env.example .env
```

Edit `.env` with your settings (especially DB_PASSWORD):
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=union_registry
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

JWT_SECRET=change_this_to_a_random_secret_key_min_32_chars
JWT_EXPIRES_IN=8h

CORS_ORIGIN=http://localhost:5173

ADMIN_PASSWORD=Union@2025
```

### 4. Create Admin User
```powershell
npm run create-admin
```

This will create an admin user with:
- Email: `admin@unionregistry.com`
- Password: `Union@2025`

### 5. Start the Development Server
```powershell
npm run dev
```

The server will start on http://localhost:3001

### 6. Test the API

Open a new PowerShell window and test the health endpoint:
```powershell
curl http://localhost:3001/health
```

Or test admin login:
```powershell
curl -X POST http://localhost:3001/api/auth/admin/login `
  -H "Content-Type: application/json" `
  -d '{"password":"Union@2025"}'
```

## Production Build

To build for production:
```powershell
npm run build
npm start
```

## Troubleshooting

### Issue: Cannot connect to PostgreSQL
- Ensure PostgreSQL service is running
- Check Windows Services (services.msc) for "postgresql-x64-XX"
- Verify DB_PASSWORD in .env matches your PostgreSQL password

### Issue: Port 3001 already in use
- Change PORT in .env to another port (e.g., 3002)
- Or stop the application using that port

### Issue: TypeScript errors
- Ensure you ran `npm install`
- TypeScript errors will be resolved when dependencies are installed

### Issue: CORS errors from frontend
- Ensure CORS_ORIGIN in .env matches your frontend URL
- Default is http://localhost:5173 for Vite

## API Testing with Postman or Thunder Client

1. Import the API base URL: `http://localhost:3001/api`
2. Test authentication endpoints first
3. Copy the JWT token from login response
4. Add it to subsequent requests as: `Authorization: Bearer YOUR_TOKEN`

## Default Admin Credentials

- **Email**: admin@unionregistry.com
- **Password**: Union@2025

⚠️ **Important**: Change the admin password in production!
