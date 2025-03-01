# Deployment Guide

This document provides instructions for deploying the Italian Language Learning Portal to various environments.

## Prerequisites

Before deploying the application, ensure you have:

- Node.js (v14 or higher)
- npm (v6 or higher)
- Access to the hosting environment(s)
- Git (for version control)

## Local Deployment

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   PORT=3000
   NODE_ENV=development
   DB_PATH=database.sqlite
   CORS_ORIGIN=http://localhost:5173
   LOG_LEVEL=info
   ```

4. Run database migrations:
   ```bash
   npm run migrate:run
   ```

5. Seed the database:
   ```bash
   npm run seed
   ```

6. Start the server:
   ```bash
   npm start
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Build the application:
   ```bash
   npm run build
   ```

5. Serve the built files:
   ```bash
   npm run preview
   ```

## Production Deployment

### Backend Deployment

#### Option 1: Traditional Server (e.g., VPS, Dedicated Server)

1. SSH into your server:
   ```bash
   ssh user@your-server-ip
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/your-username/italian-language-learning-portal.git
   cd italian-language-learning-portal/backend
   ```

3. Install dependencies:
   ```bash
   npm install --production
   ```

4. Create a `.env` file:
   ```
   PORT=3000
   NODE_ENV=production
   DB_PATH=/path/to/database.sqlite
   CORS_ORIGIN=https://your-frontend-domain.com
   LOG_LEVEL=info
   ```

5. Build the application:
   ```bash
   npm run build
   ```

6. Set up a process manager (e.g., PM2):
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name "italian-learning-backend"
   pm2 save
   pm2 startup
   ```

7. Set up a reverse proxy (e.g., Nginx):
   ```nginx
   server {
       listen 80;
       server_name api.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. Set up SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d api.your-domain.com
   ```

#### Option 2: Cloud Platform (e.g., Heroku, Render, Railway)

1. Create a new app on your chosen platform.

2. Configure environment variables in the platform's dashboard:
   - `PORT`: 3000 (or let the platform assign it)
   - `NODE_ENV`: production
   - `DB_PATH`: Use a database add-on or service instead of SQLite
   - `CORS_ORIGIN`: https://your-frontend-domain.com
   - `LOG_LEVEL`: info

3. Deploy the backend:
   ```bash
   # For Heroku
   heroku git:remote -a your-app-name
   git subtree push --prefix backend heroku main

   # For other platforms, follow their deployment instructions
   ```

### Frontend Deployment

#### Option 1: Static Hosting (e.g., Netlify, Vercel, GitHub Pages)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Create a `.env.production` file:
   ```
   VITE_API_BASE_URL=https://api.your-domain.com/api
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Deploy to your chosen platform:
   ```bash
   # For Netlify
   npx netlify deploy --prod --dir=dist

   # For Vercel
   npx vercel --prod

   # For GitHub Pages, push the dist folder to the gh-pages branch
   ```

#### Option 2: Traditional Server

1. Build the frontend as described above.

2. Copy the `dist` directory to your server:
   ```bash
   scp -r dist/ user@your-server-ip:/var/www/html/
   ```

3. Set up Nginx to serve the static files:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. Set up SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Database Considerations

### SQLite (Development)

SQLite is suitable for development but may not be ideal for production, especially if you expect high traffic or need concurrent access.

### PostgreSQL (Production)

For production, consider migrating to PostgreSQL:

1. Install PostgreSQL on your server or use a managed service.

2. Update the backend to use PostgreSQL:
   - Install the pg package: `npm install pg`
   - Update the database connection code to use PostgreSQL
   - Update migrations to be compatible with PostgreSQL

3. Migrate your data from SQLite to PostgreSQL.

## Continuous Integration/Continuous Deployment (CI/CD)

Consider setting up CI/CD pipelines to automate the deployment process:

1. GitHub Actions:
   - Set up workflows for testing and building
   - Configure deployment to your hosting platform

2. GitLab CI/CD:
   - Set up pipelines for testing, building, and deploying

## Monitoring and Logging

Set up monitoring and logging to track the health of your application:

1. Application Monitoring:
   - New Relic
   - Datadog
   - Sentry

2. Server Monitoring:
   - Prometheus
   - Grafana

3. Logging:
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Papertrail
   - Loggly

## Backup Strategy

Implement a backup strategy for your database:

1. Regular backups:
   ```bash
   # For SQLite
   cp database.sqlite database.sqlite.backup

   # For PostgreSQL
   pg_dump -U username -d database_name > backup.sql
   ```

2. Automated backups using cron jobs:
   ```bash
   # Add to crontab
   0 0 * * * /path/to/backup-script.sh
   ```

## Security Considerations

1. Keep dependencies up to date:
   ```bash
   npm audit
   npm update
   ```

2. Use HTTPS for all communications.

3. Implement rate limiting to prevent abuse.

4. Set up proper CORS configuration.

5. Consider adding authentication and authorization if needed.

## Troubleshooting

### Common Deployment Issues

1. **CORS Errors**:
   - Ensure the `CORS_ORIGIN` environment variable is correctly set
   - Check that the frontend is making requests to the correct API URL

2. **Database Connection Issues**:
   - Verify database credentials
   - Check database file permissions
   - Ensure migrations have been applied

3. **Environment Variables**:
   - Confirm all required environment variables are set
   - Check for typos in variable names

4. **Build Errors**:
   - Check for TypeScript errors
   - Ensure all dependencies are installed
   - Verify Node.js version compatibility 