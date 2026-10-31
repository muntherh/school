# SDMS Backend Setup Guide

This guide provides step-by-step instructions for setting up the School Disciplinary Management System (SDMS) backend foundation.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager
- Git (optional, for version control)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Prisma ORM and PostgreSQL client
- Zod for validation
- bcryptjs for password hashing
- Vitest for testing

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sdms"

# Authentication
SESSION_SECRET="your-secret-key-change-this-in-production"
SESSION_MAX_AGE="28800000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Important:** Generate a secure `SESSION_SECRET` for production. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE sdms;
\q
```

Or use your preferred PostgreSQL management tool.

### 4. Run Database Migrations

Generate Prisma client and apply migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This will:
- Generate the Prisma client based on the schema
- Create all database tables and relationships
- Set up indexes and constraints

### 5. Seed the Database (Optional)

Populate the database with test data:

```bash
npm run prisma:seed
```

This creates:
- 4 test users (principal, teachers, counsellor, admin)
- 5 test students
- Configuration data (incident categories, action types, intervention types)

**Default test credentials:**
- Principal: `principal@school.edu` / `password123`
- Teacher 1: `teacher1@school.edu` / `password123`
- Teacher 2: `teacher2@school.edu` / `password123`
- Counsellor: `counsellor@school.edu` / `password123`
- Admin: `admin@school.edu` / `password123`

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in UI Mode

```bash
npm run test:ui
```

### Test Coverage

Current test coverage includes:
- Unit tests for authentication service
- Unit tests for permission system
- Unit tests for validation schemas
- Unit tests for case service

## Database Schema

The database includes the following entities:

- **User**: Staff accounts with roles and approval status
- **Student**: Student records for incident reporting
- **Case**: Incident reports and case management
- **CaseReview**: Principal review records
- **DisciplinaryAction**: Disciplinary actions taken
- **Intervention**: Counselling and intervention records
- **ConfidentialNote**: Highly sensitive counselling notes
- **FollowUp**: Follow-up tasks and completion tracking
- **AuditEvent**: Audit trail of significant actions
- **ExportLog**: CSV export activity logs
- **Configuration**: System configuration values

See `docs/database-schema.md` for detailed schema documentation.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PATCH /api/users/[id]` - Update user
- `PATCH /api/users/[id]/status` - Update user account status

### Students
- `GET /api/students` - Search students
- `POST /api/students` - Create student
- `GET /api/students/[id]` - Get student by ID
- `PATCH /api/students/[id]` - Update student

### Cases
- `GET /api/cases` - Get cases with filters
- `POST /api/cases` - Create new case
- `GET /api/cases/[id]` - Get case by ID
- `PATCH /api/cases/[id]` - Update case
- `PATCH /api/cases/[id]/status` - Update case status
- `POST /api/cases/[id]/reopen` - Reopen closed case
- `GET /api/cases/[id]/reviews` - Get case reviews
- `POST /api/cases/[id]/reviews` - Create case review
- `GET /api/cases/[id]/actions` - Get disciplinary actions
- `POST /api/cases/[id]/actions` - Create disciplinary action
- `PATCH /api/actions/[id]` - Update action status
- `GET /api/cases/[id]/interventions` - Get interventions
- `POST /api/cases/[id]/interventions` - Create intervention
- `PATCH /api/interventions/[id]` - Update intervention
- `GET /api/interventions/[id]/confidential-notes` - Get confidential notes
- `POST /api/interventions/[id]/confidential-notes` - Create confidential note
- `GET /api/cases/[id]/follow-ups` - Get follow-ups
- `POST /api/cases/[id]/follow-ups` - Create follow-up
- `PATCH /api/follow-ups/[id]` - Update follow-up

### Audit & Configuration
- `GET /api/audit-log` - Get audit log
- `GET /api/configuration` - Get configuration
- `GET /api/configuration/[key]` - Get configuration by key
- `PATCH /api/configuration/[key]` - Update configuration

See `docs/api-routes.md` for complete API documentation.

## Security Considerations

### Authentication
- Passwords are hashed using bcrypt with 10 rounds
- Session-based authentication with secure cookies
- Account approval workflow for new staff accounts

### Authorization
- Role-Based Access Control (RBAC) enforced server-side
- Field-level permissions for sensitive data
- Status transition validation

### Data Protection
- Confidential notes stored in separate table
- No sensitive data in logs or error messages
- CSV export with formula injection mitigation (to be implemented)

### Audit Trail
- All significant actions logged
- Audit logs protected from modification
- Export activity tracked

## Security Configuration

### Session Management

The application uses `iron-session` for secure session management with HTTP-only cookies.

**Environment Variables:**
```env
SESSION_SECRET="your-secure-random-secret-at-least-32-characters"
SESSION_MAX_AGE="28800000"  # 8 hours in milliseconds
```

**Generating a Secure Session Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important Security Notes:**
- Never use the default session secret in production
- Generate a new random secret for each deployment
- Keep the SESSION_SECRET environment variable secure
- Use a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault) in production

### Authentication Flow

1. **Login (`POST /api/auth/login`)**
   - Validates credentials against database
   - Checks account status (ACTIVE only)
   - Creates secure HTTP-only session cookie
   - Logs successful/failed login attempts to audit log

2. **Logout (`POST /api/auth/logout`)**
   - Destroys session cookie
   - Logs logout event to audit log

3. **Session Validation**
   - All protected API routes require valid session
   - Sessions expire after SESSION_MAX_AGE
   - Inactive accounts cannot access protected routes

### Role-Based Access Control (RBAC)

**Roles and Permissions:**

| Permission | Teacher | Principal | Counsellor | Admin |
|------------|---------|-----------|------------|-------|
| Create users | ❌ | ✅ | ❌ | ✅ |
| Approve users | ❌ | ✅ | ❌ | ✅ |
| View all users | ❌ | ✅ | ❌ | ✅ |
| Create cases | ✅ | ✅ | ❌ | ❌ |
| View all cases | ❌ | ✅ | ❌ | ❌ |
| View own cases | ✅ | ✅ | ❌ | ❌ |
| Change case status | ❌ | ✅ | ❌ | ❌ |
| Reopen cases | ❌ | ✅ | ❌ | ❌ |
| Create reviews | ❌ | ✅ | ❌ | ❌ |
| Create actions | ❌ | ✅ | ❌ | ❌ |
| View interventions | ❌ | ✅ | ✅ | ❌ |
| Create interventions | ❌ | ✅ | ✅ | ❌ |
| View confidential notes | ❌ | ✅ | ✅ | ❌ |
| Create follow-ups | ❌ | ✅ | ✅ | ❌ |
| Export data | ❌ | ✅ | ❌ | ✅ |
| View audit log | ❌ | ✅ | ❌ | ✅ |
| Configure system | ❌ | ✅ | ❌ | ✅ |

### Account Approval Workflow

1. **New Account Creation**
   - Created with `PENDING` status
   - Cannot login until approved
   - Requires Principal or Admin approval

2. **Account Approval**
   - Only Principal or Admin can approve
   - Approved accounts get `ACTIVE` status
   - Approval is logged to audit log

3. **Account Deactivation**
   - Principal or Admin can deactivate accounts
   - Deactivated accounts cannot login
   - Status change is logged to audit log

### Audit Logging

All security-sensitive operations are logged:
- Login attempts (success and failure)
- User creation and status changes
- Case creation and status changes
- Permission changes
- Configuration updates

Audit logs include:
- Actor ID and name
- Action performed
- Target entity type and ID
- Timestamp
- IP address
- User agent

### Security Best Practices

1. **Never hardcode credentials**
   - All secrets in environment variables
   - Use secrets manager in production
   - Rotate secrets regularly

2. **HTTPS in Production**
   - Set `secure: true` for cookies in production
   - Use valid SSL certificates
   - Enable HSTS headers

3. **Session Security**
   - HTTP-only cookies prevent XSS attacks
   - SameSite=lax prevents CSRF attacks
   - Session expiration limits exposure time

4. **Password Security**
   - bcrypt with 10 rounds for hashing
   - Never store plain text passwords
   - Enforce minimum password length (8 characters)

5. **Input Validation**
   - All inputs validated with Zod schemas
   - Type-safe database queries with Prisma
   - SQL injection prevention through ORM

6. **Authorization**
   - Server-side permission checks on all protected routes
   - Never rely on frontend-only checks
   - Record-level access control for cases

### Testing Security

Run security tests:
```bash
npm test
```

Security test coverage includes:
- Authentication (login with invalid credentials, inactive accounts)
- Authorization (permission checks, role restrictions)
- Cross-user access prevention
- Password security (hashing, verification)

### Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running:
```bash
# Windows
net start postgresql-x64-14

# Linux/Mac
brew services start postgresql
# or
sudo systemctl start postgresql
```

2. Check DATABASE_URL in `.env` is correct
3. Ensure the database exists
4. Verify user credentials

### Prisma Issues

If Prisma commands fail:

```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Port Already in Use

If port 3000 is in use:

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9
```

Then run:
```bash
npm run dev
```

## Next Steps

After completing the backend setup:

1. **Implement authentication middleware** - Add session management and user context to API routes
2. **Add authorization checks** - Implement permission checks on all protected endpoints
3. **Create frontend pages** - Build the UI for incident reporting, case management, etc.
4. **Implement CSV export** - Add secure CSV export functionality
5. **Add comprehensive tests** - Increase test coverage to meet targets (80% unit, 70% integration)
6. **Set up CI/CD** - Configure automated testing and deployment

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zod Documentation](https://zod.dev)
- [Vitest Documentation](https://vitest.dev)

## Support

For issues or questions:
1. Check the documentation in the `docs/` directory
2. Review the SRS analysis and architecture documents
3. Consult the implementation plan in `docs/implementation-plan.md`
