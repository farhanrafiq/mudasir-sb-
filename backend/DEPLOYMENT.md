# Production Deployment Guide

This guide covers deploying the Union Registry Backend API to production.

## Pre-Deployment Checklist

- [ ] PostgreSQL database setup complete
- [ ] All environment variables configured
- [ ] Database schema applied
- [ ] Admin user created
- [ ] API tested locally
- [ ] Build succeeds without errors

## Environment Variables for Production

Create a `.env` file with production values:

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=union_registry
DB_USER=your_db_user
DB_PASSWORD=your_secure_db_password

# JWT (Generate a secure random key)
JWT_SECRET=generate_a_secure_random_key_at_least_32_characters_long
JWT_EXPIRES_IN=8h

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Admin
ADMIN_PASSWORD=change_this_secure_admin_password
```

### Generate Secure JWT Secret
```powershell
# PowerShell command to generate a secure random key
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

## Database Setup for Production

### 1. Create Production Database
```sql
CREATE DATABASE union_registry;
CREATE USER union_registry_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE union_registry TO union_registry_user;
```

### 2. Apply Schema
```bash
psql -h your_db_host -U union_registry_user -d union_registry -f database/schema.sql
```

### 3. Create Admin User
```bash
npm run create-admin
```

## Deployment Options

### Option 1: Traditional VPS/VM Deployment

#### Requirements
- Ubuntu 20.04+ or Windows Server
- Node.js 18+
- PostgreSQL 14+
- Nginx (recommended for reverse proxy)

#### Steps

1. **Clone repository on server**:
```bash
git clone https://github.com/your-repo/union-registry.git
cd union-registry/backend
```

2. **Install dependencies**:
```bash
npm install --production
```

3. **Build application**:
```bash
npm run build
```

4. **Setup PM2 for process management**:
```bash
npm install -g pm2
pm2 start dist/server.js --name "union-registry-api"
pm2 save
pm2 startup
```

5. **Configure Nginx reverse proxy** (`/etc/nginx/sites-available/union-registry`):
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

6. **Enable site and restart Nginx**:
```bash
sudo ln -s /etc/nginx/sites-available/union-registry /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Setup SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

### Option 2: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: union_registry
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    networks:
      - union-network

  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: union_registry
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 8h
      CORS_ORIGIN: ${CORS_ORIGIN}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    depends_on:
      - postgres
    networks:
      - union-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  union-network:
    driver: bridge
```

#### Deploy with Docker
```bash
docker-compose up -d
```

### Option 3: Cloud Platform Deployment

#### Heroku
1. Create Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy via Git:
```bash
heroku git:remote -a your-app-name
git push heroku main
```

#### AWS Elastic Beanstalk
1. Install EB CLI
2. Initialize EB:
```bash
eb init
eb create union-registry-api
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure environment variables
3. Add PostgreSQL database
4. Deploy

#### Azure App Service
1. Create App Service
2. Configure deployment from Git
3. Add PostgreSQL database
4. Set environment variables

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` to version control
- Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate JWT secrets periodically

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access to application servers only
- Regular backups

### 3. API Security
- Enable HTTPS only (no HTTP)
- Use rate limiting (consider adding express-rate-limit)
- Implement request logging
- Set secure HTTP headers (consider helmet.js)

### 4. Network Security
- Use firewall rules
- Restrict database port access
- Use VPC/private networks

## Monitoring and Logging

### Add Logging Library
```bash
npm install winston
```

### Setup Winston Logger
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### Monitoring Tools
- **PM2 Monitoring**: `pm2 monitor`
- **Application Performance**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot, Pingdom

## Backup Strategy

### Database Backups

#### Daily Automated Backup (Cron Job)
```bash
# Add to crontab: crontab -e
0 2 * * * pg_dump -h localhost -U postgres union_registry | gzip > /backups/union_registry_$(date +\%Y\%m\%d).sql.gz
```

#### Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="union_registry"
DB_USER="postgres"

pg_dump -h localhost -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +30 -delete
```

### Application Backups
- Version control for code (Git)
- Regular snapshots of server/container
- Store environment variables securely

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Multiple API instances
- Shared PostgreSQL database
- Session-less JWT authentication (already stateless)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database indexes
- Implement caching (Redis)

### Database Optimization
- Connection pooling (already implemented)
- Query optimization
- Read replicas for heavy read operations
- Database partitioning for large tables

## Update and Maintenance

### Zero-Downtime Deployment
```bash
# With PM2
pm2 reload union-registry-api
```

### Database Migrations
- Use migration tools (node-pg-migrate, Flyway)
- Test migrations on staging first
- Backup before migrations
- Keep rollback scripts ready

### Health Checks
The API includes a health endpoint:
```
GET /health
```

Configure your load balancer/orchestrator to use this for health checks.

## Troubleshooting Production Issues

### Check Logs
```bash
# PM2 logs
pm2 logs union-registry-api

# System logs
journalctl -u union-registry-api -f

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Database Connection Issues
```bash
# Check PostgreSQL status
systemctl status postgresql

# Check connections
psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Performance Issues
```bash
# Check resource usage
top
htop
pm2 monit
```

## Cost Optimization

### Free/Low-Cost Options for Small Scale
- **Database**: PostgreSQL on DigitalOcean ($15/month)
- **Hosting**: DigitalOcean Droplet ($6/month)
- **Domain**: Namecheap (~$10/year)
- **SSL**: Let's Encrypt (free)

### Managed Services
- **Database**: AWS RDS, Azure Database
- **Hosting**: Heroku, AWS Elastic Beanstalk
- **CDN**: CloudFlare (free tier)

## Support and Maintenance

### Regular Tasks
- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Monitor disk space
- [ ] Check backup integrity
- [ ] Review error logs
- [ ] Performance monitoring

### Update Checklist
1. Test updates in staging environment
2. Create database backup
3. Update dependencies: `npm update`
4. Run tests (if available)
5. Build: `npm run build`
6. Deploy with zero downtime
7. Monitor for errors
8. Rollback if issues occur

## Emergency Procedures

### Service Down
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs`
3. Restart service: `pm2 restart union-registry-api`
4. Check database connectivity
5. Review recent deployments

### Database Issues
1. Check PostgreSQL status
2. Review connection settings
3. Check disk space
4. Review slow queries
5. Restore from backup if needed

### Security Breach
1. Immediately rotate all secrets (JWT, passwords)
2. Review audit logs
3. Check for unauthorized access
4. Update all user passwords
5. Investigate root cause
6. Apply security patches

## Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

## Contact

For deployment assistance or issues, contact the development team.
