# Troubleshooting Guide

Common issues and their solutions for the Union Registry Backend.

## Installation Issues

### Issue: `npm install` fails
**Symptoms**: Errors during dependency installation

**Solutions**:
1. Clear npm cache:
   ```powershell
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

3. Check Node.js version (requires v18+):
   ```powershell
   node --version
   ```

4. Update npm:
   ```powershell
   npm install -g npm@latest
   ```

### Issue: TypeScript compilation errors
**Symptoms**: Red squiggly lines in VS Code, `tsc` errors

**Solutions**:
1. Install type definitions:
   ```powershell
   npm install --save-dev @types/node @types/express @types/pg
   ```

2. Reload VS Code window:
   - Press `Ctrl+Shift+P`
   - Type "Reload Window"
   - Press Enter

3. Check tsconfig.json is present

## Database Issues

### Issue: Cannot connect to PostgreSQL
**Symptoms**: `ECONNREFUSED`, connection timeout errors

**Solutions**:
1. Check if PostgreSQL is running:
   ```powershell
   # Check Windows services
   Get-Service -Name "postgresql*"
   
   # If not running, start it:
   Start-Service -Name "postgresql-x64-14"  # Adjust version number
   ```

2. Verify database exists:
   ```powershell
   psql -U postgres -l
   ```

3. Check connection settings in `.env`:
   - DB_HOST should be `localhost`
   - DB_PORT should be `5432`
   - DB_NAME should be `union_registry`
   - DB_PASSWORD must match your PostgreSQL password

4. Test connection manually:
   ```powershell
   psql -U postgres -d union_registry
   ```

### Issue: Database schema not applied
**Symptoms**: Table does not exist errors

**Solutions**:
1. Apply schema manually:
   ```powershell
   psql -U postgres -d union_registry -f database/schema.sql
   ```

2. Check for errors in schema application:
   ```powershell
   psql -U postgres -d union_registry -f database/schema.sql 2>&1 | Tee-Object schema-errors.log
   ```

3. Drop and recreate database if needed:
   ```powershell
   psql -U postgres -c "DROP DATABASE IF EXISTS union_registry;"
   psql -U postgres -c "CREATE DATABASE union_registry;"
   psql -U postgres -d union_registry -f database/schema.sql
   ```

### Issue: Permission denied errors
**Symptoms**: `permission denied for table`, `must be owner` errors

**Solutions**:
1. Grant proper permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE union_registry TO postgres;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
   ```

2. Use superuser for initial setup:
   ```powershell
   psql -U postgres
   ```

## Server Startup Issues

### Issue: Port already in use
**Symptoms**: `EADDRINUSE: address already in use :::3001`

**Solutions**:
1. Find and kill process using port 3001:
   ```powershell
   # Find process
   Get-NetTCPConnection -LocalPort 3001 | Select-Object -Property OwningProcess
   
   # Kill process (replace PID)
   Stop-Process -Id PID_NUMBER -Force
   ```

2. Change port in `.env`:
   ```env
   PORT=3002
   ```

### Issue: Cannot find module errors
**Symptoms**: `Cannot find module 'express'` or similar

**Solutions**:
1. Install dependencies:
   ```powershell
   npm install
   ```

2. Check if you're in the backend directory:
   ```powershell
   cd backend
   pwd
   ```

3. Clear require cache and reinstall:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

### Issue: Environment variables not loaded
**Symptoms**: `undefined` values for config, connection errors

**Solutions**:
1. Check `.env` file exists in backend root directory
2. Ensure `.env` has proper format (no quotes around values)
3. Restart the server completely
4. Check for typos in variable names

## Authentication Issues

### Issue: Admin login fails
**Symptoms**: 401 Unauthorized, "Invalid admin credentials"

**Solutions**:
1. Check admin password in `.env`:
   ```env
   ADMIN_PASSWORD=Union@2025
   ```

2. Ensure you're using the correct password in request:
   ```json
   {
     "password": "Union@2025"
   }
   ```

3. Create admin user if not exists:
   ```powershell
   npm run create-admin
   ```

### Issue: Dealer login fails
**Symptoms**: 401 Unauthorized for dealer

**Solutions**:
1. Verify dealer exists in database:
   ```sql
   SELECT * FROM users WHERE email = 'dealer@example.com';
   ```

2. Check if using temp password and needs change

3. Verify password is correct

4. Check user role is 'dealer'

### Issue: Token invalid or expired
**Symptoms**: 401 Unauthorized with valid token

**Solutions**:
1. Token may have expired (default 8 hours)
2. Login again to get new token
3. Check JWT_SECRET in `.env` hasn't changed
4. Verify token is sent in Authorization header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

## API Request Issues

### Issue: CORS errors
**Symptoms**: "Access-Control-Allow-Origin" errors in browser

**Solutions**:
1. Update CORS_ORIGIN in `.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

2. Restart server after changing CORS_ORIGIN

3. For multiple origins, modify `src/server.ts`:
   ```typescript
   app.use(cors({
     origin: ['http://localhost:5173', 'http://localhost:3000'],
     credentials: true,
   }));
   ```

### Issue: 400 Bad Request with validation errors
**Symptoms**: Validation error messages in response

**Solutions**:
1. Check request body format matches schema
2. Common validation issues:
   - Phone must be exactly 10 digits (no spaces/dashes)
   - Aadhar must be exactly 12 digits
   - Email must be valid format
   - Dates must be ISO format: YYYY-MM-DD
   - Required fields must be present

3. Example correct formats:
   ```json
   {
     "phone": "9876543210",
     "aadhar": "123456789012",
     "email": "user@example.com",
     "hire_date": "2024-01-15"
   }
   ```

### Issue: 409 Conflict errors
**Symptoms**: "already exists" messages

**Solutions**:
1. For duplicate Aadhar:
   - Use different Aadhar number
   - Or terminate existing employee first

2. For duplicate email/username:
   - Use unique email/username
   - Check existing records

3. For duplicate company name:
   - Use different company name

## Development Issues

### Issue: Hot reload not working
**Symptoms**: Changes not reflected without manual restart

**Solutions**:
1. Check nodemon is running:
   ```powershell
   npm run dev
   ```

2. Restart nodemon:
   - Press `Ctrl+C`
   - Run `npm run dev` again

3. Clear terminal and restart

### Issue: TypeScript watching not working
**Symptoms**: `.ts` file changes not detected

**Solutions**:
1. Use nodemon with ts-node (already configured):
   ```powershell
   npm run dev
   ```

2. Manually compile if needed:
   ```powershell
   npm run build
   ```

## Production Issues

### Issue: 500 Internal Server Error
**Symptoms**: Generic 500 errors

**Solutions**:
1. Check server logs:
   ```powershell
   pm2 logs union-registry-api
   ```

2. Common causes:
   - Database connection lost
   - Undefined environment variables
   - Unhandled promise rejections
   - Database query errors

3. Enable detailed error logging in development

### Issue: Database connection pool exhausted
**Symptoms**: "sorry, too many clients already" errors

**Solutions**:
1. Increase pool size in `src/database/index.ts`:
   ```typescript
   max: 50,  // Increase from 20
   ```

2. Check for connection leaks (unreleased clients)

3. Monitor active connections:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

### Issue: Memory leaks
**Symptoms**: Increasing memory usage over time

**Solutions**:
1. Monitor with PM2:
   ```powershell
   pm2 monit
   ```

2. Restart periodically with PM2:
   ```powershell
   pm2 restart union-registry-api
   ```

3. Check for:
   - Unreleased database clients
   - Global variable accumulation
   - Event listener leaks

## Data Issues

### Issue: Aadhar uniqueness not enforced
**Symptoms**: Duplicate Aadhar numbers in database

**Solutions**:
1. Check unique constraint exists:
   ```sql
   SELECT * FROM pg_constraint WHERE conname = 'employees_aadhar_key';
   ```

2. Add constraint if missing:
   ```sql
   ALTER TABLE employees ADD CONSTRAINT employees_aadhar_key UNIQUE (aadhar);
   ```

3. Clean up duplicates first if needed

### Issue: Audit logs not created
**Symptoms**: No audit log entries

**Solutions**:
1. Check audit_logs table exists:
   ```sql
   SELECT * FROM audit_logs LIMIT 1;
   ```

2. Verify foreign key constraints don't block inserts

3. Check for errors in audit log creation code

## Testing Issues

### Issue: Cannot test with curl/Postman
**Symptoms**: Connection refused, timeout

**Solutions**:
1. Verify server is running:
   ```powershell
   Get-NetTCPConnection -LocalPort 3001
   ```

2. Check firewall settings

3. Use correct URL:
   ```
   http://localhost:3001/api/...
   ```

4. For PowerShell, use proper syntax:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3001/api/auth/admin/login" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{"password":"Union@2025"}'
   ```

## Getting Help

### Enable Debug Mode
Add to `.env`:
```env
NODE_ENV=development
DEBUG=*
```

### Check Logs
```powershell
# Development
# Logs appear in terminal

# Production with PM2
pm2 logs union-registry-api --lines 100
```

### Database Debugging
```sql
-- Check all tables
\dt

-- Check table structure
\d+ employees

-- Check recent audit logs
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;

-- Check active users
SELECT id, role, email, name FROM users;
```

### Test Database Connection
Create test file `test-db.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'union_registry',
  user: 'postgres',
  password: 'your_password',
});

pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err.stack : res.rows[0]);
  pool.end();
});
```

Run: `node test-db.js`

## Still Having Issues?

1. Check all documentation files:
   - README.md
   - SETUP.md
   - API_TESTING.md
   - DEPLOYMENT.md

2. Verify prerequisites:
   - Node.js 18+
   - PostgreSQL 14+
   - All dependencies installed

3. Try clean reinstall:
   ```powershell
   Remove-Item -Recurse -Force node_modules, package-lock.json
   npm install
   ```

4. Check GitHub issues (if applicable)

5. Review error messages carefully - they often indicate the exact problem

## Common Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| ECONNREFUSED | PostgreSQL not running | Start PostgreSQL service |
| EADDRINUSE | Port in use | Change port or kill process |
| relation does not exist | Schema not applied | Run schema.sql |
| Invalid token | Token expired/invalid | Login again |
| Validation error | Invalid input format | Check validation rules |
| permission denied | Database permissions | Grant proper privileges |
| Cannot find module | Missing dependencies | Run npm install |

---

**Note**: Most issues can be resolved by:
1. Checking logs
2. Verifying environment variables
3. Ensuring PostgreSQL is running
4. Confirming dependencies are installed
