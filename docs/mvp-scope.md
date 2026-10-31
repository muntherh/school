# MVP Scope vs Future Features

## 1. MVP Definition

The Minimum Viable Product (MVP) includes the core functionality required to meet the primary acceptance criteria and enable the basic disciplinary management workflow. Future features will be added based on user feedback and stakeholder priorities.

---

## 2. MVP Features (Phase 1)

### 2.1 Authentication and Access Control
- ✅ Staff login with email/password
- ✅ Role-based access control (Teacher, Principal, Counsellor, Admin)
- ✅ Account approval workflow (Principal approves staff accounts)
- ✅ Session management and logout
- ✅ Account status management (Active, Deactivated, Rejected)
- ❌ Self-service password reset (deferred to Phase 2)
- ❌ External identity provider integration (deferred to Phase 2)

**Requirements Covered**: FR-AUTH-01, FR-AUTH-02, FR-AUTH-03, FR-AUTH-04, FR-AUTH-05

### 2.2 Student Records
- ✅ Student search by student ID, name, class/grade
- ✅ Student profile view
- ✅ Basic student information (ID, name, class, active status)
- ✅ Student case history view (for authorized roles)
- ❌ Bulk student import (deferred to Phase 2)
- ❌ Student record synchronization with external systems (deferred to Phase 2)

**Requirements Covered**: FR-STU-01, FR-STU-02, FR-STU-03, FR-STU-04

### 2.3 Incident Reporting
- ✅ Create incident report with required fields
- ✅ Unique reference number generation
- ✅ Required field validation
- ✅ Teacher can view own submitted reports
- ✅ Teacher can respond to clarification requests
- ✅ Basic duplicate detection warning
- ❌ Attachments and file uploads (deferred to Phase 2)
- ❌ Witness statements as structured data (deferred to Phase 2)
- ❌ Immediate safety concern escalation (deferred to Phase 2)

**Requirements Covered**: FR-INC-01, FR-INC-02, FR-INC-04, FR-INC-05, FR-INC-06, FR-INC-07

### 2.4 Case Management
- ✅ Principal can view all cases
- ✅ Principal can review cases
- ✅ Principal can request clarification
- ✅ Principal can assign cases to counsellors
- ✅ Principal can record decisions
- ✅ Principal can close cases
- ✅ Principal can reopen cases withreason
- ✅ Case status transitions
- ✅ Chronological case history
- ❌ Automated case assignment (deferred to Phase 2)
- ❌ Case templates (deferred to Phase 2)

**Requirements Covered**: FR-CASE-01, FR-CASE-02, FR-CASE-03, FR-CASE-04, FR-CASE-05, FR-CASE-06, FR-CASE-07

### 2.5 Disciplinary Actions
- ✅ Record disciplinary actions
- ✅ Action type configuration
- ✅ Action status tracking
- ✅ Responsible user assignment
- ❌ Automated action reminders (deferred to Phase 2)
- ❌ Action template library (deferred to Phase 2)

**Requirements Covered**: FR-INT-06

### 2.6 Counselling and Interventions
- ✅ Counsellor can view assigned cases
- ✅ Counsellor can record interventions
- ✅ Intervention type and notes
- ✅ Confidential note support (separate table)
- ✅ Follow-up creation and tracking
- ✅ Follow-up status management
- ✅ Outcome recording
- ❌ Outcome assessment templates (deferred to Phase 2)
- ❌ Intervention scheduling (deferred to Phase 2)

**Requirements Covered**: FR-INT-01, FR-INT-02, FR-INT-03, FR-INT-04, FR-INT-05

### 2.7 Dashboards
- ✅ Role-specific dashboards
- ✅ Teacher dashboard (submitted reports, status)
- ✅ Principal dashboard (case counts, pending reviews, follow-ups due)
- ✅ Counsellor dashboard (assigned cases, interventions, follow-ups)
- ✅ Case lists with filters
- ✅ Search and filter functionality
- ❌ In-app notifications (deferred to Phase 2)
- ❌ Email/SMS notifications (deferred to Phase 2)
- ❌ Advanced analytics and charts (deferred to Phase 2)

**Requirements Covered**: FR-DASH-01, FR-DASH-02, FR-DASH-03, FR-DASH-04, FR-DASH-05

### 2.8 CSV Export
- ✅ Principal can export filtered cases to CSV
- ✅ Date range and filter selection
- ✅ Field selection based on permissions
- ✅ CSV formula injection mitigation
- ✅ Export logging
- ✅ Warning before export
- ❌ Multiple export formats (Excel, PDF) (deferred to Phase 2)
- ❌ Scheduled exports (deferred to Phase 2)
- ❌ Export templates (deferred to Phase 2)

**Requirements Covered**: FR-EXP-01, FR-EXP-02, FR-EXP-03, FR-EXP-04, FR-EXP-05, FR-EXP-06, FR-EXP-07

### 2.9 Audit and Administration
- ✅ Audit logging for significant actions
- ✅ Audit log viewer for Principal/Admin
- ✅ Configuration management (incident categories, action types)
- ✅ Server-side validation
- ❌ Advanced audit analytics (deferred to Phase 2)
- ❌ Automated compliance reports (deferred to Phase 2)

**Requirements Covered**: FR-AUD-01, FR-AUD-02, FR-AUD-03, FR-AUD-04

### 2.10 Security
- ✅ Server-side authorization on all operations
- ✅ HTTPS/TLS support
- ✅ Password hashing (bcrypt)
- ✅ Session management
- ✅ Protection against common web attacks (CSRF, XSS, SQL injection)
- ✅ Field-level access control for sensitive data
- ❌ Two-factor authentication (deferred to Phase 2)
- ❌ Advanced threat detection (deferred to Phase 2)

**Requirements Covered**: NFR-SEC-01, NFR-SEC-02, NFR-SEC-03, NFR-SEC-04, NFR-SEC-05, NFR-PRV-01

---

## 3. Future Features (Phase 2+)

### 3.1 High Priority (Phase 2)
Based on SRS "Should" requirements and common user needs:

- **Self-service password reset** (FR-AUTH-06)
- **In-app notifications** for assignments, clarification requests, status changes (FR-DASH-06)
- **Attachments and file uploads** for incident evidence (FR-INC-03)
- **Email notifications** for important case events
- **Advanced dashboard analytics** with charts (Recharts integration)
- **Outcome assessment templates** for interventions (FR-INT-04)
- **Automated follow-up reminders** (overdue notifications)
- **Bulk student import** from CSV
- **Export templates** for different reporting needs

### 3.2 Medium Priority (Phase 3)
- **Parent/student portal** for viewing case status (requires separate approval)
- **Mobile app** (React Native or similar)
- **Integration with school information system**
- **Integration with Ministry reporting system**
- **Advanced search** with full-text search
- **Case templates** for common incident types
- **Automated case assignment** based on rules
- **Two-factor authentication**
- **Scheduled reports** (daily/weekly email summaries)

### 3.3 Low Priority (Phase 4+)
- **AI-powered insights** (for analytics only, NOT for disciplinary decisions)
- **Predictive analytics** for early intervention (with strict privacy controls)
- **Video conferencing integration** for remote counselling
- **Multi-language support** (Arabic, English bilingual interface)
- **Advanced compliance reporting** for regulatory requirements
- **Data anonymization** for research purposes (with explicit consent)

---

## 4. Explicitly Out of Scope (Per SRS)

The following features are explicitly out of scope and will NOT be implemented:

- ❌ **AI-generated punishments** or automated disciplinary decisions
- ❌ **Reinforcement learning** that changes student interventions automatically
- ❌ **Parent/student portal access** (unless separately approved)
- ❌ **Direct integration with Ministry systems** (unless separately specified)
- ❌ **Bulk import from CSV into production database** (security risk)
- ❌ **Legal determination of compliance** (system supports documentation only)
- ❌ **Payroll, attendance, examinations, fees** (general school ERP functions)

---

## 5. MVP Acceptance Criteria

The MVP will be considered complete when:

1. ✅ A teacher can create an incident report with required fields and receive a unique reference number
2. ✅ The principal can approve staff accounts and manage user access
3. ✅ The principal can review, assign, and manage all cases
4. ✅ The principal can record disciplinary decisions and close cases
5. ✅ The counsellor can access assigned cases and record interventions
6. ✅ The counsellor can create and track follow-ups
7. ✅ Each role sees an appropriate dashboard with relevant data
8. ✅ Users can search and filter cases by date, status, category, etc.
9. ✅ The principal can export filtered cases to CSV with proper field restrictions
10. ✅ All significant actions are logged in the audit trail
11. ✅ Server-side authorization is enforced on all operations
12. ✅ Sensitive data (confidential notes) is protected by field-level permissions
13. ✅ The system prevents unauthorized access to restricted data
14. ✅ Basic security measures are in place (HTTPS, password hashing, session management)

---

## 6. Technical MVP Scope

### 6.1 Technology Stack (Confirmed)
- **Frontend**: Next.js 14+ with TypeScript, App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Charts**: Recharts (for Phase 2 analytics)
- **Testing**: Vitest (unit tests), Playwright (E2E tests)
- **Authentication**: Session-based with secure cookies

### 6.2 MVP Architecture Components
- ✅ Next.js App Router structure
- ✅ API routes for backend logic
- ✅ Prisma schema with all core entities
- ✅ Middleware for authentication and authorization
- ✅ Server-side validation with Zod
- ✅ Role-based permission checking
- ✅ Audit logging middleware
- ✅ CSV generation with formula injection protection
- ✅ Basic error handling and logging
- ❌ WebSocket/real-time features (deferred to Phase 2)
- ❌ File storage service (deferred to Phase 2)
- ❌ Email service (deferred to Phase 2)

### 6.3 MVP Test Coverage
- ✅ Unit tests for business logic services
- ✅ Integration tests for API endpoints
- ✅ E2E tests for critical user journeys:
  - Teacher login and incident submission
  - Principal account approval and case review
  - Counsellor intervention recording
  - CSV export functionality
- ❌ Performance/load tests (deferred to Phase 2)
- ❌ Security penetration tests (deferred to pre-production)

---

## 7. MVP Timeline Estimate

**Phase 1: MVP Development (8-10 weeks)**

| Week | Milestone |
|------|-----------|
| 1-2 | Project setup, database schema, authentication |
| 3-4 | User management, student records, incident reporting |
| 5-6 | Case management, principal review workflow |
| 7 | Counsellor interventions and follow-ups |
| 8 | Dashboards, search, and filters |
| 9 | CSV export and audit logging |
| 10 | Testing, bug fixes, documentation |

**Phase 2: Enhancement (4-6 weeks)**
- Notifications
- Attachments
- Advanced analytics
- Performance optimization

---

## 8. MVP Risk Mitigation

### 8.1 Technical Risks
| Risk | Mitigation |
|------|------------|
| Complexity of permission logic | Implement clear permission service with comprehensive tests |
| CSV export security | Use established libraries, validate all outputs |
| Database schema changes | Use Prisma migrations, version control |
| Performance with large datasets | Implement pagination, add indexes, test with realistic data |

### 8.2 Business Risks
| Risk | Mitigation |
|------|------------|
| Unclear school policies | Document assumptions, get explicit approval before implementation |
| Changing requirements during MVP | Strict scope control, change request process |
| User adoption | Provide training materials, intuitive UI design |

### 8.3 Security Risks
| Risk | Mitigation |
|------|------------|
| Data breach | Server-side authorization, encryption at rest, audit logging |
| Unauthorized access | Multi-layer permission checks, session management |
| CSV injection | Sanitize all outputs, use safe CSV generation libraries |

---

## 9. Success Metrics for MVP

### 9.1 Functional Metrics
- All 14 MVP acceptance criteria met
- Zero critical bugs
- All core workflows tested and working
- Audit logging captures all significant events

### 9.2 Performance Metrics
- Page load time < 3 seconds (95th percentile)
- API response time < 500ms (95th percentile)
- CSV export of 1,000 records < 10 seconds

### 9.3 Security Metrics
- All API endpoints protected by authorization
- No sensitive data in logs or error messages
- Password hashing implemented correctly
- Session timeout working as expected

### 9.4 Usability Metrics
- Teachers can submit incident in < 5 minutes
- Principal can review and assign case in < 3 minutes
- Counsellor can record intervention in < 5 minutes
- Zero training required for basic tasks (intuitive UI)
