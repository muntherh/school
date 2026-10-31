# School Disciplinary Management System (SDMS)

A secure, role-based web application for incident reporting, case management, student support interventions, and authorized reporting.

## Overview

The School Disciplinary Management System (SDMS) provides an authenticated web portal through which authorized school staff can document student-related incidents, review and manage cases, record decisions and support interventions, monitor follow-ups, and export authorized records for administrative or official reporting.

## Technology Stack

- **Frontend**: Next.js 14+ with TypeScript, App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Charts**: Recharts (Phase 2)
- **Testing**: Vitest (unit tests), Playwright (E2E tests)
- **Authentication**: Session-based with secure cookies

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Hooks      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Next.js API Routes)          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │  │  Middleware  │  │  Services    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer (Prisma)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Models     │  │  Queries     │  │  Migrations  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
sdms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes group
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/       # Dashboard routes group
│   │   │   ├── dashboard/
│   │   │   ├── cases/
│   │   │   ├── students/
│   │   │   ├── admin/
│   │   │   └── export/
│   │   ├── api/                # API routes
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── students/
│   │   │   ├── cases/
│   │   │   ├── interventions/
│   │   │   ├── export/
│   │   │   └── audit/
│   │   └── layout.tsx
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── cases/             # Case-related components
│   │   ├── forms/             # Form components
│   │   └── tables/            # Table components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── permissions.ts     # Permission checking
│   │   ├── validation.ts      # Zod schemas
│   │   └── csv.ts             # CSV generation
│   ├── services/              # Business logic services
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── case.service.ts
│   │   ├── intervention.service.ts
│   │   ├── export.service.ts
│   │   └── audit.service.ts
│   └── middleware.ts          # Next.js middleware
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── tests/
│   ├── unit/                  # Vitest unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # Playwright E2E tests
├── docs/                      # Documentation
│   ├── srs-analysis.md
│   ├── ambiguities-and-open-questions.md
│   ├── database-schema.md
│   ├── api-routes.md
│   ├── permissions-matrix.md
│   ├── mvp-scope.md
│   ├── requirements-traceability-matrix.md
│   └── implementation-plan.md
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

## Database Schema

The system uses PostgreSQL with the following core entities:

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

See [docs/database-schema.md](docs/database-schema.md) for detailed schema documentation.

## User Roles

### Teacher
- Submit incident reports
- View own submitted reports
- Respond to clarification requests
- Track report status

### Principal / Super Admin
- Approve or deactivate staff accounts
- View and manage all cases
- Review cases and request clarifications
- Assign cases to counsellors
- Record disciplinary decisions
- Close or reopen cases
- Export authorized reports
- View audit logs
- Configure system settings

### Counsellor
- View assigned cases
- Record interventions and counselling sessions
- Create and track follow-ups
- Document outcomes
- Access confidential notes (restricted)

### System Administrator (Optional)
- Technical administration only
- Limited access to student case content

See [docs/permissions-matrix.md](docs/permissions-matrix.md) for detailed permission mappings.

## Case Workflow

1. **Staff Access**: Teacher account created, principal approves access
2. **Report Submitted**: Teacher submits incident report with unique reference
3. **Initial Review**: Principal reviews case, can request clarification or assign
4. **Investigation/Support**: Principal assigns to counsellor for intervention
5. **Decision**: Authorized staff records decision and action plan
6. **Follow-up**: Responsible staff tracks completion of follow-ups
7. **Closure**: Principal closes case when actions complete
8. **Reporting**: Authorized users export records for reporting

## API Endpoints

The system provides RESTful API endpoints for:

- Authentication (login, logout, session management)
- User management (create, approve, deactivate accounts)
- Student records (search, view, case history)
- Case management (create, update, status changes)
- Case reviews (create reviews, clarification requests)
- Disciplinary actions (create, update status)
- Interventions (create, update, confidential notes)
- Follow-ups (create, update, complete)
- Dashboards (role-specific metrics)
- CSV export (filtered exports with permissions)
- Configuration (system settings)
- Audit logging (view audit trail)

See [docs/api-routes.md](docs/api-routes.md) for complete API documentation.

## Security

### Authentication & Authorization
- Server-side session management with secure cookies
- Role-based access control (RBAC)
- Field-level permissions for sensitive data
- Account approval workflow
- Session expiry and secure logout

### Data Protection
- Password hashing with bcrypt
- HTTPS/TLS for all production traffic
- Protection against common web attacks (CSRF, XSS, SQL injection)
- Confidential notes stored in separate table with restricted access
- No sensitive data in logs or error messages
- CSV formula injection mitigation

### Audit Trail
- All significant actions logged (actor, action, target, timestamp)
- Audit logs protected from modification
- Export activity logged with filters and scope

## MVP Scope

The MVP includes:

- ✅ Authentication with account approval
- ✅ Student search and case history
- ✅ Incident reporting with validation
- ✅ Principal case review and management
- ✅ Counsellor interventions and follow-ups
- ✅ Role-specific dashboards
- ✅ Case search and filtering
- ✅ CSV export with permissions
- ✅ Audit logging
- ✅ Configuration management

Deferred to Phase 2:
- Self-service password reset
- In-app notifications
- Attachments and file uploads
- Advanced analytics and charts
- Email/SMS notifications
- Multi-language support

See [docs/mvp-scope.md](docs/mvp-scope.md) for complete MVP definition.

## Documentation

- [SRS Analysis](docs/srs-analysis.md) - Extracted requirements from SRS
- [Ambiguities and Open Questions](docs/ambiguities-and-open-questions.md) - Identified gaps and decisions needed
- [Database Schema](docs/database-schema.md) - Detailed database design
- [API Routes](docs/api-routes.md) - Complete API endpoint documentation
- [Permissions Matrix](docs/permissions-matrix.md) - Role and field-level permissions
- [MVP Scope](docs/mvp-scope.md) - MVP features vs future enhancements
- [Requirements Traceability Matrix](docs/requirements-traceability-matrix.md) - Mapping requirements to components
- [Implementation Plan](docs/implementation-plan.md) - Step-by-step implementation roadmap

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rabi064/School_Disciplinary_Sys.git
cd School_Disciplinary_Sys
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Default Account Credentials

After running the database seed, you can use the following credentials to log in:

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Principal | principal@school.edu | principal123 | Active |
| Teacher | teacher@school.edu | teacher123 | Active |
| Counsellor | counsellor@school.edu | counsellor123 | Active |
| Admin | admin@school.edu | admin123 | Active |

**Note:** These are default test credentials. Change them immediately after first login in a production environment.

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sdms"

# Authentication
SESSION_SECRET="your-secret-key"
SESSION_MAX_AGE="28800000"  # 8 hours in milliseconds

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Email (Phase 2)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
```

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm test
```

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Database Migrations
```bash
npx prisma migrate deploy
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

Proprietary - Confidential school system

## Support

For technical support or questions, contact the development team.

## Version

Current Version: 1.0.0 (MVP)
