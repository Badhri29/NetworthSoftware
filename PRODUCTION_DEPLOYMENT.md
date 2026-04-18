# Production Deployment Guide

## Pre-Deployment Checklist

### Database Setup
- [ ] Create a MySQL database on your cloud provider (AWS RDS, Azure Database, DigitalOcean, Heroku, Railway, etc.)
- [ ] Obtain the database connection string (DATABASE_URL)
- [ ] Test database connection before deploying
- [ ] Ensure SSL is enabled for database connection (required parameter)

### Environment Variables
- [ ] Copy `.env.example` to `.env`
- [ ] Update all environment variables:
  - `DATABASE_URL`: Your cloud MySQL connection string
  - `JWT_SECRET`: Generate a secure random key:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
  - `NODE_ENV`: Set to `production`
  - `PORT`: Usually set by cloud provider (8080, 3000, etc.)

### Code Quality
- [x] Prisma schema is properly configured
- [x] All migrations are created and tested
- [x] No hardcoded localhost references in code
- [x] API calls use relative paths (work on any domain)
- [x] .gitignore includes `.env` and `node_modules/`
- [x] Error handling is implemented

## Deployment Steps

### 1. For Railway, Render, Vercel, Heroku, etc.

```bash
# 1. Push code to GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main

# 2. Connect your cloud platform to your GitHub repo
# - Go to your cloud platform (Railway, Render, etc.)
# - Create new project
# - Connect to GitHub repository

# 3. Set environment variables in cloud platform:
#    DATABASE_URL = your-mysql-connection-string
#    JWT_SECRET = your-secure-random-key
#    NODE_ENV = production

# 4. Cloud platform will automatically:
#    - Run: npm install
#    - Run: npm run postinstall (generates Prisma client)
#    - Run: npx prisma migrate deploy (applies migrations)
#    - Run: npm start (starts the server)
```

### 2. Running Migrations on Cloud

Migrations automatically run through the `postinstall` script:
- Package.json has: `"postinstall": "npx prisma generate"`
- Package.json has: `"prisma:migrate:deploy": "npx prisma migrate deploy"`

For initial deployment, you may need to manually run:
```bash
npx prisma migrate deploy
```

### 3. Database Connection String Format

For different providers:

**AWS RDS:**
```
mysql://username:password@database.region.rds.amazonaws.com:3306/dbname?sslmode=require
```

**Azure Database for MySQL:**
```
mysql://username@servername:password@servername.mysql.database.azure.com:3306/dbname?sslmode=require
```

**DigitalOcean Managed Database:**
```
mysql://username:password@host:25060/dbname?sslmode=require
```

**Railway:**
```
mysql://username:password@host:port/dbname
```

## Post-Deployment Verification

- [ ] Server starts without errors
- [ ] Database connection is working
- [ ] User authentication works (login/registration)
- [ ] Can view Holdings page
- [ ] Can add new Assets/Liabilities
- [ ] Can edit existing Assets/Liabilities
- [ ] Can delete Assets/Liabilities
- [ ] Real-time sync works across pages
- [ ] API endpoints respond correctly
- [ ] Error handling displays proper messages

## Database Backup

- [ ] Set up automated daily backups in cloud provider
- [ ] Test backup/restore process
- [ ] Store backup credentials securely

## Monitoring & Logs

- [ ] Set up error logging in cloud platform
- [ ] Monitor database connection errors
- [ ] Monitor API response times
- [ ] Set up alerts for critical errors

## Security Checklist

- [ ] DATABASE_URL is secret (not in git)
- [ ] JWT_SECRET is random and secure
- [ ] .env file is in .gitignore
- [ ] CORS is properly configured (if needed)
- [ ] helmet middleware is enabled (✓ already done)
- [ ] Rate limiting is considered
- [ ] HTTPS is enforced by cloud provider

## Important Files for Production

- `src/config/env.js` - Configuration from environment
- `src/server.js` - Main server with middleware
- `src/routes/` - All API endpoints
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Database migrations
- `package.json` - Dependencies and scripts
- `.env.example` - Template for environment variables

## Rollback Plan

If something goes wrong:

1. Check cloud provider logs for errors
2. Verify DATABASE_URL is correct
3. Ensure all environment variables are set
4. Check database connection:
   ```bash
   npx prisma db pull  # See current schema
   ```
5. If migrations failed:
   ```bash
   npx prisma migrate reset  # ⚠️ Only if needed - wipes database
   npx prisma migrate deploy  # Reapply migrations
   ```

## Performance Tips

- [ ] Enable database connection pooling
- [ ] Use CDN for static assets
- [ ] Compress responses (helmet handles this)
- [ ] Monitor database query time
- [ ] Consider pagination for large datasets

## Support Resources

- Prisma Docs: https://www.prisma.io/docs/
- Express Docs: https://expressjs.com/
- Your cloud provider's documentation
