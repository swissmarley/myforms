# Deployment Guide

This guide covers deploying MyForms to various hosting platforms.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (managed or self-hosted)
- Domain name (optional, for custom domains)

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/myforms?schema=public"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL="https://your-frontend-domain.com"

# File Upload (optional)
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"
```

### Frontend

Set the API URL in your frontend build. Update `vite.config.ts` or use environment variables:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Backend (Railway)

1. **Create Railway account** and new project
2. **Add PostgreSQL** service
3. **Deploy from GitHub**:
   - Connect your repository
   - Set root directory to `backend`
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
4. **Set environment variables**:
   - `DATABASE_URL` (from PostgreSQL service)
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
5. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

#### Frontend (Vercel)

1. **Create Vercel account** and new project
2. **Import from GitHub**:
   - Set root directory to `frontend`
   - Framework preset: Vite
3. **Set environment variables**:
   - `VITE_API_URL` (your backend URL)
4. **Deploy**

### Option 2: Docker Deployment

#### Dockerfile (Backend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### Dockerfile (Frontend)

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: myforms
      POSTGRES_PASSWORD: your-password
      POSTGRES_DB: myforms
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://myforms:your-password@postgres:5432/myforms
      JWT_SECRET: your-jwt-secret
      FRONTEND_URL: http://localhost:3000
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Option 3: AWS Deployment

#### Backend (EC2 or Elastic Beanstalk)

1. **Launch EC2 instance** (Ubuntu 22.04)
2. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm postgresql-client
   ```
3. **Clone repository**:
   ```bash
   git clone <your-repo>
   cd myforms/backend
   npm install --production
   ```
4. **Set up environment variables**
5. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```
6. **Use PM2** for process management:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name myforms-backend
   pm2 save
   pm2 startup
   ```

#### Frontend (S3 + CloudFront)

1. **Create S3 bucket** for static hosting
2. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```
3. **Upload dist/** to S3
4. **Enable static website hosting** in S3
5. **Create CloudFront distribution** pointing to S3
6. **Set up custom domain** (optional)

### Option 4: Heroku

#### Backend

1. **Install Heroku CLI**
2. **Create Heroku app**:
   ```bash
   heroku create myforms-backend
   ```
3. **Add PostgreSQL addon**:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```
4. **Set environment variables**:
   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set FRONTEND_URL=https://your-frontend.herokuapp.com
   ```
5. **Deploy**:
   ```bash
   git subtree push --prefix backend heroku main
   ```
6. **Run migrations**:
   ```bash
   heroku run npx prisma migrate deploy
   ```

## Database Setup

### Initial Migration

```bash
cd backend
npx prisma migrate dev --name init
```

### Production Migration

```bash
npx prisma migrate deploy
```

### Seed Data (Optional)

```bash
npx prisma db seed
```

## SSL/HTTPS

For production, always use HTTPS:

- **Vercel/Netlify**: Automatic SSL
- **Railway/Render**: Automatic SSL
- **AWS**: Use CloudFront or ALB with ACM certificate
- **Self-hosted**: Use Let's Encrypt with Certbot

## Monitoring

### Health Check Endpoint

The backend includes a health check at `/health`. Use this for monitoring:

```bash
curl https://your-backend.com/health
```

### Logging

- **Development**: Console logs
- **Production**: Use services like:
  - Logtail
  - Datadog
  - AWS CloudWatch
  - Sentry (for error tracking)

## Performance Optimization

1. **Enable compression** (already configured in backend)
2. **Use CDN** for static assets
3. **Enable caching** headers
4. **Database indexing** (Prisma handles this)
5. **Connection pooling** (Prisma handles this)

## Security Checklist

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Use HTTPS in production
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting (already configured)
- [ ] Regular dependency updates
- [ ] Database backups
- [ ] Environment variables secured
- [ ] CAPTCHA for public forms (to be implemented)

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` format
- Check firewall rules
- Verify database credentials
- Test connection: `psql $DATABASE_URL`

### CORS Errors

- Verify `FRONTEND_URL` matches your frontend domain
- Check CORS configuration in backend

### Build Failures

- Ensure Node.js version matches (18+)
- Clear `node_modules` and reinstall
- Check for TypeScript errors

## Support

For deployment issues, check:
- Platform-specific documentation
- Application logs
- Database connection status
- Environment variables

