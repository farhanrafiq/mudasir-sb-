
# Backend Deployment Guide (Render/Node.js + MongoDB)

## Prerequisites
- Node.js 18+ installed locally
- MongoDB Atlas connection string in `.env` as `MONGO_URI`
- GitHub repository (recommended for Render)

## 1. Prepare Your Project
- Ensure all dependencies are listed in `package.json`
- Add a `start` script in `package.json`:
  ```json
  "scripts": {
    "start": "node dist/server.js"
  }
  ```
- Build your project (if using TypeScript):
  ```bash
  npm run build
  ```

## 2. Push to GitHub
- Commit all changes:
  ```bash
  git add .
  git commit -m "Ready for deployment"
  git push origin main
  ```

## 3. Deploy on Render
- Go to [Render.com](https://render.com/)
- Click "New Web Service"
- Connect your GitHub repo
- Set the build command:
  ```bash
  npm install && npm run build
  ```
- Set the start command:
  ```bash
  npm start
  ```
- Add environment variable:
  - `MONGO_URI` (your MongoDB Atlas connection string)
  - `PORT` (default: 8080 or as needed)
- Choose Node version: 18+
- Click "Create Web Service"

## 3a. Environment Variable Configuration (Render/Cloud)

Before deploying, configure these environment variables in your platform's dashboard (do NOT commit .env to your repo):

- `MONGO_URI` — Your MongoDB Atlas connection string
- `PORT` — e.g., 8080
- `NODE_ENV` — e.g., production
- `JWT_SECRET` — Your JWT secret key
- `CORS_ORIGIN` — Your frontend URL (e.g., https://your-frontend.com)
- `ADMIN_PASSWORD` — Admin password for login

**How to set in Render:**
1. Go to your service in Render
2. Click "Environment" or "Environment Variables"
3. Add each variable above
4. Save and redeploy if needed

**Tip:** Never commit secrets to Git. Always use the platform’s environment settings for production secrets.

---
## 4. Production Best Practices

### Environment Variable Management
- Use `.env` for local development only. Never commit secrets to source control.
- Always set secrets (DB, JWT, admin password) in your cloud provider’s dashboard.
- Keep `.env.example` up to date with all required keys.

### HTTPS & CORS
- Always deploy with HTTPS (SSL/TLS) for security.
- Set `CORS_ORIGIN` to your frontend domain in production.

### Rate Limiting & Security
- Use `express-rate-limit` for authentication and sensitive endpoints.
- Consider brute-force protection (e.g., account lockout, IP block).
- Use strong JWT secrets and rotate them periodically.

### Monitoring & Logging
- Integrate Sentry, Prometheus, or similar for error and performance monitoring.
- Use centralized logging for audit and error events (e.g., Winston, Morgan).

### Automated Testing
- Run all tests before deployment: `npm test`
- Add more unit/integration/e2e tests as needed for coverage.

### CI/CD
- Use GitHub Actions, GitLab CI, or similar for automated builds and deployments.
- Ensure secrets are managed securely in CI/CD.

### Documentation
- Document all API endpoints and setup steps for developers and ops.
- Keep `README.md` and this file up to date.

---
## Example Production Command
```bash
NODE_ENV=production PORT=5000 npm start
```

---
## 4. Post-Deployment
- Check Render logs for errors
- Test `/health` and `/test-db` endpoints
- Your backend is now live!

## Troubleshooting
- If you see build errors, check your TypeScript config and dependencies.
- If MongoDB connection fails, verify your Atlas connection string and network access.
- For CORS issues, ensure your frontend URL is allowed in backend config.

---
For further help, see Render docs: https://render.com/docs/deploy-nodejs-app
For deployment assistance or issues, contact the development team.
