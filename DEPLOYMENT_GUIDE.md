# SDMS Deployment Guide

**Version:** 1.0.0  
**Last Updated:** October 28, 2026  
**Environment:** School-Approved Pilot Deployment

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Migrations](#migrations)
5. [Seed Data](#seed-data)
6. [Production Deployment](#production-deployment)
7. [Production Configuration](#production-configuration)
8. [Database Backups](#database-backups)
9. [Health Checks & Monitoring](#health-checks--monitoring)
10. [Operational Procedures](#operational-procedures)
11. [User Procedures](#user-procedures)
12. [Acceptance Testing](#acceptance-testing)
13. [Deployment Checklist](#deployment-checklist)

---

## Local Development Setup

### Prerequisites

- **Node.js:** v18.x or higher (LTS recommended)
- **npm:** v9.x or higher
- **PostgreSQL:** v14.x or higher (or Prisma Postgres for development)
- **Git:** For version control

### Installation Steps

```bash
# Clone the repository
git clone <repository-url>
cd SDMS

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed database with test data
npm run prisma:seed

# Start development server
npm run dev
```

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server on http://localhost:3000 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |
| `npm run test:ui` | Run Vitest with UI |
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed database with test data |

---

## Environment Variables

### Required Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/sdms?schema=public"
# OR for Prisma Postgres (development only):
# DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."

# Session Security (CRITICAL - MUST BE SET IN PRODUCTION)
SESSION_SECRET="<cryptographically-secure-random-string-min-32-chars>"
SESSION_MAX_AGE="28800000"  # 8 hours in milliseconds

# Environment
NODE_ENV="development"  # Set to "production" for production deployment

# Optional: Application Configuration
APP_NAME="Student Discipline Management System"
APP_URL="http://localhost:3000"  # Update for production URL
```

### Generating a Secure Session Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

**IMPORTANT:** Never commit the `.env` file to version control. Ensure `.env` is listed in `.gitignore`.

---

## Database Setup

### PostgreSQL Setup (Production Recommended)

#### Using Docker (Development)

```bash
# Start PostgreSQL container
docker run --name sdms-postgres \
  -e POSTGRES_USER=sdms_user \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=sdms \
  -p 5432:5432 \
  -d postgres:14

# Update DATABASE_URL in .env:
# DATABASE_URL="postgresql://sdms_user:secure_password@localhost:5432/sdms?schema=public"
```

#### Using Managed PostgreSQL (Production)

Recommended providers:
- AWS RDS for PostgreSQL
- Google Cloud SQL for PostgreSQL
- Azure Database for PostgreSQL
- Supabase (includes managed PostgreSQL)

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

### Prisma Postgres (Development Only)

For local development, Prisma Postgres is already configured:

```bash
# The existing DATABASE_URL in .env uses Prisma Postgres
# This is suitable for development but NOT for production
```

---

## Migrations

### Creating a New Migration

```bash
# Create migration
npx prisma migrate dev --name <migration-name>

# Example:
npx prisma migrate dev --name add_case_priority
```

### Applying Migrations

```bash
# Development (creates migration and applies it)
npm run prisma:migrate

# Production (apply without creating)
npx prisma migrate deploy
```

### Resetting Database (Development Only)

```bash
# WARNING: This deletes all data
npx prisma migrate reset
```

### Viewing Migration Status

```bash
npx prisma migrate status
```

---

## Seed Data

### Seed Data Safety

**CRITICAL:** Seed data is designed for development and testing only. To prevent accidental loading into production:

1. The seed script checks `NODE_ENV` before running
2. Seed data uses fictional student information only
3. Production deployment must NOT run seed scripts

### Seed Script Location

`prisma/seed.js`

### Running Seed (Development Only)

```bash
# Only runs in development environment
NODE_ENV=development npm run prisma:seed
```

### Seed Data Contents

The seed script creates:
- 1 Principal user (principal@school.edu)
- 2 Teacher users (teacher1@school.edu, teacher2@school.edu)
- 1 Counsellor user (counsellor@school.edu)
- 1 Admin user (admin@school.edu)
- 5 fictional students (STU001 - STU005)
- Sample cases for testing workflow

**All seed data uses fictional information.**

---

## Production Deployment

### Recommended Hosting Platforms

#### Option 1: Vercel (Recommended for Next.js)

**Pros:**
- Native Next.js support
- Automatic HTTPS
- Edge network
- Built-in CI/CD
- Environment variable management

**Deployment Steps:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - SESSION_SECRET
# - NODE_ENV=production
# - APP_URL
```

#### Option 2: Railway

**Pros:**
- Simple deployment
- Built-in PostgreSQL
- Environment variable management
- Automatic HTTPS

**Deployment Steps:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL database
railway add postgresql

# Set environment variables
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set SESSION_SECRET=<your-secret>
railway variables set NODE_ENV=production

# Deploy
railway up
```

#### Option 3: Self-Hosted (VPS or School Infrastructure)

**Requirements:**
- Ubuntu 20.04+ or similar
- Node.js 18+
- PostgreSQL 14+
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt recommended)

**Deployment Steps:**

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 3. Clone and setup application
git clone <repository-url>
cd SDMS
npm install
npm run build

# 4. Set environment variables
sudo nano /etc/sdms/.env
# Add production variables

# 5. Install PM2 for process management
npm install -g pm2

# 6. Start application with PM2
pm2 start npm --name "sdms" -- start
pm2 save
pm2 startup

# 7. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/sdms
# Add SSL configuration with Let's Encrypt
```

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

---

## Production Configuration

### Session Security

**File:** `lib/session.ts`

```typescript
export const sessionOptions = {
  password: process.env.SESSION_SECRET, // MUST be set in production
  cookieName: 'sdms-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,  // Prevents XSS attacks
    sameSite: 'lax',  // CSRF protection
    path: '/',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '28800000'), // 8 hours
  },
}
```

**Production Requirements:**
- `SESSION_SECRET` must be a cryptographically secure random string (32+ characters)
- `NODE_ENV` must be set to `production`
- HTTPS must be enabled (sets `secure: true` on cookies)

### HTTPS Configuration

#### Vercel/Railway (Automatic)
- HTTPS is automatically provided
- SSL certificates managed by platform

#### Self-Hosted (Manual)
```nginx
# Nginx configuration example
server {
    listen 443 ssl http2;
    server_name sdms.school.edu;

    ssl_certificate /etc/letsencrypt/live/sdms.school.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sdms.school.edu/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
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

### Database Access Security

**Production Best Practices:**
1. Use strong database passwords (minimum 32 characters)
2. Restrict database access to application server IP only
3. Enable SSL for database connections
4. Use connection pooling
5. Regularly rotate database credentials

**Connection String with SSL:**
```
postgresql://user:password@host:5432/database?schema=public&sslmode=require
```

---

## Database Backups

### Automated Backup Setup

#### PostgreSQL Native Backups

**Daily Backup Script:**

```bash
#!/bin/bash
# /usr/local/bin/sdms-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sdms"
DB_NAME="sdms"
DB_USER="sdms_user"

mkdir -p $BACKUP_DIR

pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/sdms_backup_$DATE.sql.gz

# Keep last 30 days of backups
find $BACKUP_DIR -name "sdms_backup_*.sql.gz" -mtime +30 -delete
```

**Cron Job:**
```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * /usr/local/bin/sdms-backup.sh
```

#### Cloud Provider Backups

**AWS RDS:**
- Enable automated backups in RDS console
- Set retention period (recommended: 30 days)
- Enable point-in-time recovery

**Google Cloud SQL:**
- Enable automated backups
- Set retention period (recommended: 30 days)

**Railway:**
- Automatic backups included
- Configure retention in dashboard

### Restoration Procedure

#### From SQL Backup

```bash
# Stop application
pm2 stop sdms

# Restore database
gunzip < /var/backups/sdms/sdms_backup_YYYYMMDD_HHMMSS.sql.gz | psql -U sdms_user -h localhost sdms

# Restart application
pm2 start sdms
```

#### Point-in-Time Recovery (AWS RDS)

```bash
# Restore to specific timestamp
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier sdms-restored \
  --db-snapshot-identifier sdms-snapshot-2024-10-28 \
  --db-instance-class db.t3.micro
```

### Backup Verification

**Monthly Verification Steps:**

1. Take a test backup
2. Restore to a test database
3. Run health checks
4. Verify data integrity
5. Document results

---

## Health Checks & Monitoring

### Health Check Endpoint

**File:** `app/api/health/route.ts` (to be created)

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed',
    }, { status: 503 })
  }
}
```

**Access:** `GET /api/health`

### Structured Logging

**File:** `lib/logger.ts` (to be created)

```typescript
export class Logger {
  static info(message: string, meta?: any) {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    }))
  }

  static error(message: string, error?: any, meta?: any) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta,
    }))
  }

  static warn(message: string, meta?: any) {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    }))
  }
}
```

### Error Monitoring

**Recommended Services:**
- Sentry (error tracking)
- LogRocket (session replay)
- Datadog (infrastructure monitoring)
- New Relic (APM)

**Sentry Integration Example:**

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Monitoring Metrics

**Key Metrics to Monitor:**
- Response time (p50, p95, p99)
- Error rate
- Database connection pool usage
- Memory usage
- CPU usage
- Request rate
- Failed authentication attempts

---

## Operational Procedures

### Principal Account Approval

**Step-by-Step Process:**

1. **Staff Member Self-Registration:**
   - Staff member accesses registration page
   - Enters name, staff identifier, email, password
   - Account created with status `PENDING`

2. **Principal Review:**
   - Principal logs into SDMS
   - Navigates to "Pending Approvals" page
   - Reviews new staff account request
   - Verifies staff identity through school records

3. **Approval Action:**
   - Principal clicks "Approve" or "Reject"
   - If approved: status changes to `ACTIVE`, `approvedAt` and `approvedBy` set
   - If rejected: status changes to `REJECTED`
   - Action logged in audit trail

4. **Notification:**
   - Staff member receives email notification (to be implemented)
   - Staff member can now log in if approved

### Role Management

**Changing User Roles:**

1. Principal navigates to "Users" page
2. Selects user to modify
3. Updates role (TEACHER, PRINCIPAL, COUNSELLOR, ADMIN)
4. Changes logged in audit trail
5. User must re-login for role change to take effect

**Role Assignment Guidelines:**
- **TEACHER:** Classroom teachers who submit incident reports
- **PRINCIPAL:** School administrators who review cases and make decisions
- **COUNSELLOR:** School counsellors who document interventions
- **ADMIN:** System administrators (IT staff) for technical management

### Account Deactivation

**Deactivation Process:**

1. Principal navigates to "Users" page
2. Selects user to deactivate
3. Clicks "Deactivate Account"
4. Enters reason for deactivation
5. Account status changes to `DEACTIVATED`
6. User cannot log in
7. Action logged in audit trail

**Reactivation Process:**

1. Principal navigates to "Users" page
2. Selects deactivated user
3. Clicks "Reactivate Account"
4. Account status changes to `ACTIVE`
5. User can log in again
6. Action logged in audit trail

---

## User Procedures

### Incident Reporting (Teacher)

**Step-by-Step Process:**

1. **Login:**
   - Teacher logs into SDMS with credentials
   - Navigates to dashboard

2. **Create New Incident:**
   - Clicks "New Incident" button
   - Selects student from dropdown
   - Enters incident date and time
   - Selects incident category (Behavioral, Academic, Safety, Other)
   - Provides detailed description (minimum 10 characters)
   - Optionally adds location and witnesses
   - Indicates if immediate safety concern exists
   - Clicks "Submit"

3. **Tracking:**
   - Incident appears in teacher's dashboard
   - Teacher can view status: SUBMITTED, UNDER_REVIEW, ASSIGNED, ACTION_PENDING, FOLLOW_UP_PENDING, CLOSED
   - Teacher receives notifications for status changes (to be implemented)
   - Teacher can view case history and audit trail

### Case Review and Decision (Principal)

**Step-by-Step Process:**

1. **Access Pending Cases:**
   - Principal logs into SDMS
   - Navigates to dashboard
   - Views "Pending Review" section

2. **Review Case Details:**
   - Clicks on case to review
   - Reads incident description
   - Views student information
   - Checks incident history

3. **Request Clarification (Optional):**
   - If more information needed:
   - Clicks "Request Clarification"
   - Enters clarification request
   - Case status changes to CLARIFICATION_REQUIRED
   - Teacher receives notification

4. **Assign Case:**
   - Clicks "Assign Case"
   - Selects staff member to assign (optional)
   - Enters rationale for assignment
   - Case status changes to ASSIGNED

5. **Record Decision:**
   - Clicks "Record Decision"
   - Enters decision outcome
   - Provides rationale
   - Case status changes to ACTION_PENDING or CLOSED
   - Decision logged in audit trail

6. **View Case History:**
   - Principal can click "View History" on any case
   - See complete audit trail of all actions
   - View who made changes and when

### Counselling Intervention and Follow-Up (Counsellor)

**Step-by-Step Process:**

1. **Access Assigned Cases:**
   - Counsellor logs into SDMS
   - Navigates to dashboard
   - Views assigned cases

2. **Document Intervention:**
   - Clicks on assigned case
   - Clicks "Add Intervention"
   - Selects intervention type (Counselling, Mediation, Referral, Other)
   - Enters intervention date
   - Provides detailed notes (minimum 10 characters)
   - Sets confidentiality level (STANDARD, CONFIDENTIAL, RESTRICTED)
   - Optionally adds outcome and next steps
   - Clicks "Save"

3. **Add Confidential Notes:**
   - For CONFIDENTIAL or RESTRICTED interventions:
   - Clicks "Add Confidential Note"
   - Enters sensitive counselling notes
   - Notes only visible to Principal and Counsellor who created them

4. **Create Follow-Up:**
   - Clicks "Schedule Follow-Up"
   - Sets due date
   - Assigns to staff member (self or other)
   - Enters next step notes
   - Clicks "Create"

5. **Complete Follow-Up:**
   - When follow-up due date arrives:
   - Clicks on follow-up
   - Enters result of follow-up
   - Adds next steps if needed
   - Marks as completed
   - Case may progress to closure

### Case Closure

**Step-by-Step Process:**

1. **Review Case Status:**
   - Principal or assigned staff reviews case
   - Ensures all required actions completed
   - Verifies follow-ups completed

2. **Close Case:**
   - Principal clicks "Close Case"
   - Enters closure reason
   - Case status changes to CLOSED
   - `closedAt` and `closedBy` fields populated
   - Closure logged in audit trail

3. **Reopen Case (If Needed):**
   - Principal can reopen closed cases
   - Clicks "Reopen Case"
   - Enters reason for reopening
   - Case status changes to REOPENED
   - Reopening logged in audit trail

### CSV Export

**Authorized Users:** Principal, Admin

**Step-by-Step Process:**

1. **Access Export Page:**
   - Principal or Admin logs in
   - Navigates to "Export" page

2. **Configure Export:**
   - Select date range
   - Filter by status, category, class grade
   - Select fields to export (based on role permissions)
   - Choose whether to include confidential notes (Principal/Counsellor only)

3. **Preview Export:**
   - View export statistics
   - See record count (max 10,000)
   - Verify filters are correct

4. **Generate Export:**
   - Click "Generate CSV"
   - System generates CSV file
   - File includes UTF-8 BOM for Excel compatibility
   - Formula injection prevention applied
   - Export logged in audit trail

5. **Download:**
   - CSV file downloads to user's computer
   - Filename format: `sdms-cases-export-YYYY-MM-DDTHH-MM-SS.csv`

**Export Security:**
- Maximum 10,000 records per export
- Role-based field filtering
- Confidential notes require explicit authorization
- All exports logged with user, filters, and record count

---

## Acceptance Testing

### Test Execution

Run the following acceptance tests to verify SRS requirements:

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage
```

### Requirements Traceability Matrix

| SRS Requirement | Implementation | Test Coverage | Status |
|----------------|----------------|---------------|--------|
| REQ-1: User Authentication | AuthService, iron-session | auth.test.ts | ✅ Pass |
| REQ-2: Role-Based Access Control | permissions.ts, middleware | authorization.test.ts | ✅ Pass |
| REQ-3: Incident Reporting | CaseService, case-workflow | case.service.test.ts | ✅ Pass |
| REQ-4: Case Review Workflow | CaseWorkflowService | case-workflow.test.ts | ✅ Pass |
| REQ-5: Counselling Interventions | InterventionService | integration tests | ✅ Pass |
| REQ-6: Follow-Up Management | FollowUpService, FollowUpWorkflowService | integration tests | ✅ Pass |
| REQ-7: Case Closure | CaseService.reopenCase | integration tests | ✅ Pass |
| REQ-8: CSV Export | CSVExportService | csv-export.test.ts | ✅ Pass |
| REQ-9: Audit Logging | AuditService | integration tests | ✅ Pass |
| REQ-10: Confidential Data Protection | permissions.ts, confidential-notes route | authorization.test.ts | ✅ Pass |
| REQ-11: Input Validation | Zod schemas | validation.test.ts | ✅ Pass |
| REQ-12: Error Handling | api-response.ts, error middleware | integration tests | ✅ Pass |

---

## Deployment Checklist

### Pre-Deployment

- [ ] All TypeScript errors resolved
- [ ] All tests passing
- [ ] Security findings reviewed and critical issues addressed
- [ ] SESSION_SECRET generated and configured
- [ ] DATABASE_URL configured for production database
- [ ] NODE_ENV set to "production"
- [ ] HTTPS configured
- [ ] Database backups configured
- [ ] Health check endpoint implemented
- [ ] Monitoring configured
- [ ] Log aggregation configured
- [ ] Error tracking configured (Sentry or similar)
- [ ] SSL certificates valid
- [ ] Firewall rules configured
- [ ] Database access restricted to application IP
- [ ] Production database created and migrated

### Deployment

- [ ] Application built for production
- [ ] Environment variables set in hosting platform
- [ ] Database migrations deployed
- [ ] Application deployed to hosting platform
- [ ] DNS configured (if applicable)
- [ ] SSL certificate verified
- [ ] Health check endpoint responding
- [ ] Smoke tests passed

### Post-Deployment

- [ ] Database backup verified
- [ ] Restoration procedure tested
- [ ] Health checks passing
- [ ] Monitoring dashboards configured
- [ ] Alert rules configured
- [ ] Log aggregation working
- [ ] Error tracking receiving errors
- [ ] Performance baseline established
- [ ] Security scan completed
- [ ] Load testing completed (if applicable)

---

## Unimplemented Requirements

### Outstanding Items

1. **Email Notifications**
   - Status: Not implemented
   - Priority: Medium
   - Impact: Users must manually check for updates
   - Recommendation: Implement email notifications for status changes

2. **Rate Limiting**
   - Status: Not implemented
   - Priority: High
   - Impact: Vulnerable to brute force attacks
   - Recommendation: Implement rate limiting on auth endpoints

3. **Account Lockout**
   - Status: Not implemented
   - Priority: High
   - Impact: Vulnerable to credential stuffing
   - Recommendation: Implement account lockout after failed attempts

4. **Password Complexity Requirements**
   - Status: Partially implemented (8 char minimum only)
   - Priority: Medium
   - Impact: Weak passwords allowed
   - Recommendation: Add complexity requirements

5. **CSRF Token Validation**
   - Status: Not implemented (relies on SameSite cookies)
   - Priority: Low
   - Impact: Minor CSRF risk for older browsers
   - Recommendation: Implement CSRF tokens for additional protection

### Outstanding Bugs

None currently identified.

### Policies Awaiting School Approval

1. **Data Retention Policy**
   - How long to retain closed cases
   - When to archive or delete old records
   - School legal/compliance requirements

2. **Access Review Policy**
   - Frequency of access reviews
   - Process for removing access for departed staff
   - Annual security review procedures

3. **Incident Escalation Policy**
   - When to escalate incidents to external authorities
   - Mandatory reporting requirements
   - Emergency response procedures

4. **Privacy Policy**
   - Data collection and usage
   - Parent/guardian consent requirements
   - Student data handling procedures

---

## Go/No-Go Recommendation

### Current Status: **CONDITIONAL GO**

**Conditions for Go:**

1. **Must Complete Before Go:**
   - [ ] Set cryptographically secure SESSION_SECRET
   - [ ] Configure production database with SSL
   - [ ] Enable HTTPS
   - [ ] Configure automated database backups
   - [ ] Test backup restoration procedure
   - [ ] Implement rate limiting (or accept risk for pilot)
   - [ ] Implement account lockout (or accept risk for pilot)

2. **Recommended Before Go:**
   - [ ] Implement email notifications
   - [ ] Configure monitoring and alerting
   - [ ] Complete security review with school IT
   - [ ] Obtain school policy approvals
   - [ ] Conduct user training sessions

3. **Can Defer to Post-Go:**
   - [ ] Password complexity requirements
   - [ ] CSRF token validation
   - [ ] Advanced monitoring features
   - [ ] Performance optimization

### Risk Assessment

**High Risk Items:**
- Default session secret (if not changed)
- No rate limiting on auth endpoints
- No account lockout mechanism

**Medium Risk Items:**
- Missing email notifications
- No automated monitoring configured
- Database backup procedure not tested

**Low Risk Items:**
- Password complexity
- CSRF protection (SameSite provides reasonable protection)
- Some test coverage gaps

### Recommendation

**Proceed with pilot deployment IF:**

1. All "Must Complete" items are addressed
2. School IT reviews and approves security configuration
3. Database backup and restoration are verified
4. Principal and key staff are trained
5. School policies are documented and approved

**Do NOT proceed if:**

1. SESSION_SECRET is not configured with a secure value
2. HTTPS is not enabled
3. Database backups are not configured
4. School IT has not reviewed the deployment

### Pilot Success Criteria

The pilot will be considered successful if:

1. Teachers can successfully submit incident reports
2. Principals can review and make decisions on cases
3. Counsellors can document interventions and follow-ups
4. Case history is accurately tracked and viewable
5. Authorized users can export appropriate CSV data
6. Unauthorized access is prevented
7. All significant actions are logged and traceable
8. System uptime meets school requirements (target: 99% during pilot)
9. No data loss or corruption occurs
10. User feedback is generally positive

### Post-Pilot Review

After 30 days of pilot operation, conduct review:

1. Review audit logs for security incidents
2. Gather user feedback
3. Analyze system performance
4. Review any bugs or issues encountered
5. Evaluate whether to proceed to full production

---

**Document Version:** 1.0.0  
**Last Updated:** October 28, 2026  
**Next Review:** After pilot completion or 30 days, whichever comes first
