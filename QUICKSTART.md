# Quick Start Guide

Get MyForms up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn

## Step 1: Clone and Install

```bash
# If not already cloned
git clone https://github.com/swissmarley/myforms.git
cd myforms

# Install all dependencies
npm run install:all
```

## Step 2: Database Setup

1. **Create a PostgreSQL database**:
   ```sql
   CREATE DATABASE myforms;
   ```

2. **Configure environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Edit `backend/.env`**:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/myforms?schema=public"
   JWT_SECRET="change-this-to-a-random-string-min-32-characters"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   ```

## Step 3: Initialize Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed with sample data
npm run prisma:seed
```

## Step 4: Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

## Step 5: Create Your First Form

1. Open http://localhost:5173
2. Register a new account (or use seeded account: `user@myforms.com` / `user123`)
3. Click "New Form"
4. Add questions using the form builder
5. Click "Publish" when ready
6. Share the generated link!

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Test connection: `psql $DATABASE_URL`

### Port Already in Use
- Change `PORT` in `backend/.env`
- Update `FRONTEND_URL` if needed

### Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version: `node --version` (should be 18+)

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [API.md](API.md) for API reference
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Review [FEATURES.md](FEATURES.md) for feature list

## Default Accounts (from seed)

- **Admin**: `admin@myforms.com` / `admin123`
- **User**: `user@myforms.com` / `user123`

**⚠️ Change these passwords in production!**

