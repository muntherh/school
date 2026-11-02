# Requirements Traceability Matrix (RTM)

> This matrix is the original implementation plan. For the verified, current status of every SRS requirement see [srs-compliance-review.md](srs-compliance-review.md).

## 1. Functional Requirements Traceability

### 1.1 Authentication and Account Management (FR-AUTH)

| Req ID | Requirement | Database Tables | API Endpoints | Frontend Components | Unit Tests | Integration Tests | E2E Tests | MVP |
|--------|-------------|-----------------|---------------|---------------------|------------|-------------------|-----------|-----|
| FR-AUTH-01 | Staff sign-in with credentials | User | POST /api/auth/login | LoginPage | AuthService.login | Auth API integration | Teacher login flow | ✅ |
| FR-AUTH-02 | Prevent unapproved account access | User (accountStatus) | All protected routes | Middleware | AuthMiddleware.check | Auth middleware tests | Unapproved user blocked | ✅ |
| FR-AUTH-03 | Principal approve/reject/deactivate accounts | User (accountStatus, approvedAt, approvedBy) | PATCH /api/users/:id/status | UserDetail, UserList | UserService.updateStatus | User management API | Principal account approval | ✅ |
| FR-AUTH-04 | Assign authorized roles | User (role) | POST /api/users | NewUser, UserDetail | UserService.create | User creation API | Role assignment | ✅ |
| FR-AUTH-05 | Secure logout and session expiry | User | POST /api/auth/logout | Layout (logout button) | AuthService.logout | Auth API integration | Session expiry test | ✅ |
| FR-AUTH-06 | Password reset or identity provider | User (resetToken) | POST /api/auth/reset-password | ForgotPasswordPage | AuthService.resetPassword | Password reset API | Password reset flow | ❌ |

### 1.2 Student Records (FR-STU)

| Req ID | Requirement | Database Tables | API Endpoints | Frontend Components | Unit Tests | Integration Tests | E2E Tests | MVP |
|--------|-------------|-----------------|---------------|---------------------|------------|-------------------|-----------|-----|
| FR-STU-01 | Search students by identifier | Student | GET /api/students | StudentList, StudentSearch | StudentService.search | Student API integration | Student search flow | ✅ |
| FR-STU-02 | Associate incident with student | Case (studentId FK) | POST /api/cases | NewCase | CaseService.create | Case creation API | Incident with student | ✅ |
| FR-STU-03 | View student case history | Student, Case | GET /api/students/:id/cases | StudentDetail | StudentService.getCaseHistory | Student history API | Student history view | ✅ |
| FR-STU-04 | Limit student data fields | Student | GET /api/students | StudentDetail | StudentService.sanitizeFields | Field filtering tests | Data exposure check | ✅ |

### 1.3 Incident Submission and Tracking (FR-INC)

| Req ID | Requirement | Database Tables | API Endpoints | Frontend Components | Unit Tests | Integration Tests | E2E Tests | MVP |
|--------|-------------|-----------------|---------------|---------------------|------------|-------------------|-----------|-----|
| FR-INC-01 | Teacher create incident report | Case | POST /api/cases | NewCase | CaseService.create | Case creation API | Teacher submits incident | ✅ |
| FR-INC-02 | Capture required fields | Case (incidentDate, category, description, etc.) | POST /api/cases | NewCase form | CaseValidationSchema | Validation middleware | Required field validation | ✅ |
| FR-INC-03 | Support optional fields | Case (location, witnesses) | POST /api/cases | NewCase form (optional fields) | CaseValidationSchema | Validation middleware | Optional field handling | ❌ |
| FR-INC-04 | Show teacher's submitted reports | Case (reporterId) | GET /api/cases (filter: reporterId) | MyReports | CaseService.getByReporter | Case filtering API | Teacher views reports | ✅ |
| FR-INC-05 | Request clarification | CaseReview | POST /api/cases/:id/reviews | ReviewDetail | CaseReviewService.create | Review API | Principal requests clarification | ✅ |
| FR-INC-06 | Validate and prevent duplicates | Case | POST /api/cases | NewCase | CaseService.checkDuplicates | Duplicate detection API | Duplicate warning | ✅ |
| FR-INC-07 | Assign unique reference number | Case (referenceNumber) | POST /api/cases | NewCase | CaseService.generateReference | Reference generation | Unique reference display | ✅ |

### 1.4 Principal Review and Case Management (FR-CASE)

| Req ID | Requirement | Database Tables | API Endpoints | Frontend Components | Unit Tests | Integration Tests | E2E Tests | MVP |
|--------|-------------|-----------------|---------------|---------------------|------------|-------------------|-----------|-----|
| FR-CASE-01 | Principal view all cases | Case | GET /api/cases | CaseList (Principal) | CaseService.getAll | Case listing API | Principal views all cases | ✅ |
| FR-CASE-02 | Review, return, assign, approve, close | Case (status), CaseReview | PATCH /api/cases/:id/status, POST /api/cases/:id/reviews | ReviewDetail, CaseDetail | CaseService.updateStatus, CaseReviewService.create | Status transition API | Principal case workflow | ✅ |
| FR-CASE-03 | Distinguish account approval from incident approval | User (accountStatus), Case (status) | Separate endpoints | UserDetail, ReviewDetail | Separate services | Separate approval tests | Approval separation | ✅ |
| FR-CASE-04 | Record decision, rationale, responsible person | DisciplinaryAction | POST /api/cases/:id/actions | CaseDetail (decision form) | DisciplinaryActionService.create | Action creation API | Principal records decision | ✅ |
| FR-CASE-05 | Assign case to counsellor | Case (assignedTo), CaseReview | PATCH /api/cases/:id | ReviewDetail (assign button) | CaseService.assign | Assignment API | Principal assigns case | ✅ |
| FR-CASE-06 | Maintain chronological history | AuditEvent, CaseReview, DisciplinaryAction, Intervention, FollowUp | GET /api/cases/:id/history | CaseDetail (history tab) | AuditService.getCaseHistory | History API | Case history display | ✅ |
| FR-CASE-07 | Reopen closed case with reason | Case (reopenedAt, reopenedBy, reopenReason) | POST /api/cases/:id/reopen | CaseDetail (reopen button) | CaseService.reopen | Reopen API | Case reopening | ✅ |

### 1.5 Counselling and Interventions (FR-INT)

| Req ID | Requirement | Database Tables | API Endpoints | Frontend Components | Unit Tests | Integration Tests | E2E Tests | MVP |
|--------|-------------|-----------------|---------------|---------------------|------------|-------------------|-----------|-----|
| FR-INT-01 | Counsellor view authorized cases | Case (assignedTo) | GET /api/cases (filter: assigned) | CounsellorDashboard, CaseList | CaseService.getAssigned | Case filtering API | Counsellor views assigned | ✅ |
| FR-INT-02 | Record intervention session | Intervention | POST /api/cases/:id/interventions | NewIntervention | InterventionService.create | Intervention API | Counsellor records intervention | ✅ |
| FR-INT-03 | Support follow-up dates, responsible staff, completion | FollowUp | POST /api/cases/:id/follow-ups, PATCH /api/follow-ups/:id | FollowUpDetail, CompleteFollowUp | FollowUpService.create, FollowUpService.update | Follow-up API | Follow-up creation and completion | ✅ |
| FR-INT-04 | Record structured outcome | Intervention (outcome) | POST /api/cases/:id/interventions | NewIntervention (outcome field) | InterventionService.create | Intervention API | Outcome recording | ✅ |
| FR-INT-05 | Distinguish confidential notes | Intervention (confidentialityLevel), ConfidentialNote | POST /api/interventions/:id/confidential-notes | InterventionDetail (confidential section) | ConfidentialNoteService.create | Confidential note API | Confidential note access | ✅ |
| FR-INT-06 | Document disciplinary actions | DisciplinaryAction | POST /api/cases/:id/actions | CaseDetail (action form) | DisciplinaryActionService.create | Action API | Action documentation | ✅ |

### 1.6 Dashboards, Search, and Notifications (FR-DASH)

| Req ID | Requirement | Database Tables | API Endpoints | Frontend Components | Unit Tests | Integration Tests | E2E Tests | MVP |
|--------|-------------|-----------------|---------------|---------------------|------------|-------------------|-----------|-----|
| FR-DASH-01 | Role-appropriate dashboard | Multiple | GET /api/dashboard/:role | Dashboard (role-specific) | DashboardService.getData | Dashboard API | Role-specific dashboard | ✅ |
| FR-DASH-02 | Principal dashboard metrics | Case, FollowUp, User | GET /api/dashboard/principal | PrincipalDashboard | DashboardService.getPrincipalData | Dashboard API | Principal dashboard metrics | ✅ |
| FR-DASH-03 | Teacher dashboard metrics | Case (reporterId) | GET /api/dashboard/teacher | TeacherDashboard | DashboardService.getTeacherData | Dashboard API | Teacher dashboard metrics | ✅ |
| FR-DASH-04 | Counsellor dashboard metrics | Case (assignedTo), Intervention, FollowUp | GET /api/dashboard/counsellor | CounsellorDashboard | DashboardService.getCounsellorData | Dashboard API | Counsellor dashboard metrics | ✅ |
| FR-DASH-05 | Filter case lists | Case | GET /api/cases (query params) | CaseList (filters) | CaseService.filter | Filtering API | Case filtering | ✅ |
| FR-DASH-06 | In-app notifications | Notification (future table) | WebSocket events | NotificationBell | NotificationService | Notification API | Notification display | ❌ |

### 1.7 CSV Export and Reporting (FR-EXP)

| Req ID | Requirement | Database Tables | API Endpoints | Frontend Components | Unit Tests | Integration Tests | E2E Tests | MVP |
|--------|-------------|-----------------|---------------|---------------------|------------|-------------------|-----------|-----|
| FR-EXP-01 | Export filtered records to CSV | Case, related tables | POST /api/export/cases | ExportPage | ExportService.generateCSV | Export API | CSV export flow | ✅ |
| FR-EXP-02 | Export by date range and filters | Case | POST /api/export/cases (filters) | ExportPage (filter form) | ExportService.applyFilters | Export API | Filtered export | ✅ |
| FR-EXP-03 | Exclude unauthorized fields | Multiple | POST /api/export/cases (fields param) | ExportPage (field selector) | ExportService.filterFields | Field filtering API | Unauthorized field exclusion | ✅ |
| FR-EXP-04 | Consistent CSV format | N/A | GET /api/export/download/:id | ExportPage (download) | ExportService.formatCSV | CSV formatting tests | CSV format validation | ✅ |
| FR-EXP-05 | Log export activity | ExportLog | POST /api/export/cases | N/A (backend) | ExportService.log | Export logging API | Export log verification | ✅ |
| FR-EXP-06 | Warn before export | N/A | N/A | ExportPage (warning modal) | N/A | N/A | Warning display | ✅ |
| FR-EXP-07 | Mitigate CSV formula injection | N/A | GET /api/export/download/:id | N/A (backend) | ExportService.sanitizeCSV | CSV sanitization tests | Formula injection prevention | ✅ |

### 1.8 Audit and Administration (FR-AUD)

| Req ID | Requirement | Database Tables | API Endpoints | Frontend Components | Unit Tests | Integration Tests | E2E Tests | MVP |
|--------|-------------|-----------------|---------------|---------------------|------------|-------------------|-----------|-----|
| FR-AUD-01 | Log significant actions | AuditEvent | All write endpoints | N/A (middleware) | AuditService.log | Audit middleware | Audit log creation | ✅ |
| FR-AUD-02 | Prevent audit modification | AuditEvent | N/A (no delete endpoint) | N/A | N/A | Audit protection tests | Audit modification blocked | ✅ |
| FR-AUD-03 | Support configuration | Configuration | GET/PATCH /api/configuration | Configuration | ConfigurationService | Configuration API | Configuration management | ✅ |
| FR-AUD-04 | Server-side validation | All | All endpoints | N/A (middleware) | ValidationMiddleware | Validation tests | Server validation | ✅ |

---

## 2. Non-Functional Requirements Traceability

### 2.1 Security (NFR-SEC)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-SEC-01 | Server-side authorization | AuthorizationMiddleware, PermissionService | Authorization tests for all endpoints | ✅ |
| NFR-SEC-02 | HTTPS/TLS | Hosting configuration (environment variables) | SSL certificate verification | ✅ |
| NFR-SEC-03 | Password hashing | bcrypt in AuthService | Password hashing tests | ✅ |
| NFR-SEC-04 | Secure session handling | NextAuth.js or custom session middleware, CSRF protection | Security penetration tests | ✅ |
| NFR-SEC-05 | Protect confidential data | Field-level permissions, ConfidentialNote table | Confidential data access tests | ✅ |

### 2.2 Privacy (NFR-PRV)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-PRV-01 | Collect only necessary data | Minimal database schema, field validation | Data collection audit | ✅ |

### 2.3 Availability (NFR-AVL)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-AVL-01 | 99.5% monthly availability | Hosting setup, monitoring, backup strategy | Uptime monitoring | ✅ |

### 2.4 Performance (NFR-PERF)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-PERF-01 | 3-second response time (95th percentile) | Database indexing, pagination, caching | Load testing with k6 or similar | ✅ |
| NFR-PERF-02 | CSV export within agreed time | Streaming CSV generation, pagination | Export performance tests | ✅ |

### 2.5 Usability (NFR-USE)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-USE-01 | Understandable status labels and messages | Clear UI labels, error messages | Usability testing with representative users | ✅ |

### 2.6 Accessibility (NFR-ACC)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-ACC-01 | WCAG 2.2 AA compliance | ARIA labels, semantic HTML, keyboard navigation | Accessibility audit (axe DevTools) | ❌ |

### 2.7 Reliability (NFR-REL)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-REL-01 | Data integrity on save | Database transactions, Prisma transactions | Transaction rollback tests | ✅ |

### 2.8 Business Continuity (NFR-BCP)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-BCP-01 | Backups and restoration | Database backup scripts, recovery procedures | Backup and restore drill | ✅ |

### 2.9 Maintainability (NFR-MNT)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-MNT-01 | Separate configuration from code | Configuration table, environment variables | Configuration deployment tests | ✅ |

### 2.10 Compliance (NFR-COMP)

| Req ID | Requirement | Implementation | Tests | MVP |
|--------|-------------|----------------|-------|-----|
| NFR-COMP-01 | Review against requirements | Compliance checklist, stakeholder review | Compliance audit | ✅ |

---

## 3. Business Rules Traceability

| Rule ID | Business Rule | Database Tables | API Endpoints | Frontend Components | Tests | MVP |
|---------|---------------|-----------------|---------------|---------------------|-------|-----|
| BR-01 | User must be authenticated and active | User (accountStatus) | All protected routes | Middleware | Auth tests | ✅ |
| BR-02 | Account must be approved before access | User (accountStatus) | All protected routes | Middleware | Auth tests | ✅ |
| BR-03 | Account approval separate from incident approval | User, Case | Separate endpoints | UserDetail, ReviewDetail | Approval separation tests | ✅ |
| BR-04 | Incident must have unique reference and reporter | Case (referenceNumber, reporterId) | POST /api/cases | NewCase | Case creation tests | ✅ |
| BR-05 | Only authorized roles change status | Case (status) | PATCH /api/cases/:id/status | CaseDetail | Status transition tests | ✅ |
| BR-06 | Every change retains actor and timestamp | AuditEvent, updatedAt columns | All write endpoints | N/A | Audit tests | ✅ |
| BR-07 | Case can have multiple actions/interventions/follow-ups | DisciplinaryAction, Intervention, FollowUp | Multiple POST endpoints | CaseDetail | Related entity tests | ✅ |
| BR-08 | Incident not proof of allegation | Case (status, description separate from decision) | Case, DisciplinaryAction tables | CaseDetail | Data separation tests | ✅ |
| BR-09 | CSV exports follow exporter permissions | ExportLog, permission checks | POST /api/export/cases | ExportPage | Export permission tests | ✅ |
| BR-10 | No AI automated disciplinary decisions | N/A (policy) | N/A | N/A | N/A (manual review) | ✅ |

---

## 4. Acceptance Criteria Traceability

| AC ID | Acceptance Criteria | Requirements | Implementation | Tests | MVP |
|-------|-------------------|--------------|----------------|-------|-----|
| AC-01 | Unapproved account cannot access protected functions | FR-AUTH-02, BR-02 | AuthMiddleware | E2E: Unapproved user blocked | ✅ |
| AC-02 | Teacher can submit incident with required fields | FR-INC-01, FR-INC-02 | NewCase, POST /api/cases | E2E: Teacher submits incident | ✅ |
| AC-03 | Teacher can view own reports but not unauthorized cases | FR-INC-04, FR-STU-01 | MyReports, GET /api/cases | E2E: Teacher views own reports | ✅ |
| AC-04 | Principal can review, assign, record decisions, close cases | FR-CASE-01, FR-CASE-02, FR-CASE-04, FR-CASE-05 | ReviewDetail, CaseDetail | E2E: Principal case workflow | ✅ |
| AC-05 | Counsellor can access authorized cases and record interventions | FR-INT-01, FR-INT-02 | CounsellorDashboard, NewIntervention | E2E: Counsellor workflow | ✅ |
| AC-06 | System retains chronological history | FR-CASE-06, FR-AUD-01 | AuditEvent, history tabs | E2E: History display | ✅ |
| AC-07 | Dashboards and filters display correct data | FR-DASH-01, FR-DASH-02, FR-DASH-03, FR-DASH-04, FR-DASH-05 | Dashboard components | E2E: Dashboard accuracy | ✅ |
| AC-08 | Authorized user can export filtered CSV with approved columns | FR-EXP-01, FR-EXP-02, FR-EXP-03 | ExportPage, POST /api/export/cases | E2E: CSV export | ✅ |
| AC-09 | Successful exports and important actions are logged | FR-AUD-01, FR-EXP-05 | AuditEvent, ExportLog | E2E: Audit log verification | ✅ |
| AC-10 | Security tests verify authorization and protection | NFR-SEC-01, NFR-SEC-04, NFR-SEC-05 | Security middleware | Security penetration tests | ✅ |
| AC-11 | Backup and restoration documented and tested | NFR-BCP-01 | Backup scripts | Backup/restore drill | ✅ |
| AC-12 | Stakeholders approve workflow, fields, retention, access, export | All requirements | Documentation review | Stakeholder sign-off | ✅ |

---

## 5. Component-to-Requirements Mapping

### 5.1 Database Tables

| Table | Requirements Covered |
|-------|---------------------|
| User | FR-AUTH-01, FR-AUTH-02, FR-AUTH-03, FR-AUTH-04, FR-AUTH-05, BR-01, BR-02, BR-03 |
| Student | FR-STU-01, FR-STU-02, FR-STU-03, FR-STU-04 |
| Case | FR-INC-01, FR-INC-02, FR-INC-04, FR-INC-07, FR-CASE-01, FR-CASE-02, FR-CASE-03, FR-CASE-06, FR-CASE-07, BR-04, BR-06, BR-08 |
| CaseReview | FR-INC-05, FR-CASE-02, FR-CASE-06 |
| DisciplinaryAction | FR-CASE-04, FR-INT-06, BR-07 |
| Intervention | FR-INT-02, FR-INT-04, FR-INT-05, BR-07 |
| ConfidentialNote | FR-INT-05, NFR-SEC-05 |
| FollowUp | FR-INT-03, BR-07 |
| AuditEvent | FR-AUD-01, FR-AUD-02, BR-06 |
| ExportLog | FR-EXP-05, BR-09 |
| Configuration | FR-AUD-03, NFR-MNT-01 |

### 5.2 API Endpoints

| Endpoint | Requirements Covered |
|----------|---------------------|
| POST /api/auth/login | FR-AUTH-01 |
| POST /api/auth/logout | FR-AUTH-05 |
| GET /api/auth/me | FR-AUTH-04 |
| GET /api/users | FR-AUTH-03 |
| POST /api/users | FR-AUTH-03, FR-AUTH-04 |
| PATCH /api/users/:id/status | FR-AUTH-03 |
| GET /api/students | FR-STU-01, FR-STU-04 |
| GET /api/students/:id | FR-STU-01, FR-STU-04 |
| GET /api/students/:id/cases | FR-STU-03 |
| GET /api/cases | FR-CASE-01, FR-DASH-05 |
| POST /api/cases | FR-INC-01, FR-INC-02, FR-INC-06, FR-INC-07, FR-STU-02 |
| GET /api/cases/:id | FR-CASE-06 |
| PATCH /api/cases/:id | FR-CASE-02 |
| PATCH /api/cases/:id/status | FR-CASE-02 |
| POST /api/cases/:id/reopen | FR-CASE-07 |
| GET /api/cases/:id/history | FR-CASE-06 |
| POST /api/cases/:id/reviews | FR-INC-05, FR-CASE-02 |
| POST /api/cases/:id/actions | FR-CASE-04, FR-INT-06 |
| POST /api/cases/:id/interventions | FR-INT-02, FR-INT-04 |
| POST /api/interventions/:id/confidential-notes | FR-INT-05 |
| POST /api/cases/:id/follow-ups | FR-INT-03 |
| PATCH /api/follow-ups/:id | FR-INT-03 |
| GET /api/dashboard/:role | FR-DASH-01, FR-DASH-02, FR-DASH-03, FR-DASH-04 |
| POST /api/export/cases | FR-EXP-01, FR-EXP-02, FR-EXP-03, FR-EXP-05, FR-EXP-07 |
| GET /api/export/download/:id | FR-EXP-04, FR-EXP-07 |
| GET /api/configuration | FR-AUD-03 |
| PATCH /api/configuration/:key | FR-AUD-03 |
| GET /api/audit-log | FR-AUD-01 |

### 5.3 Frontend Components

| Component | Requirements Covered |
|-----------|---------------------|
| LoginPage | FR-AUTH-01 |
| Dashboard | FR-DASH-01 |
| TeacherDashboard | FR-DASH-03, FR-INC-04 |
| PrincipalDashboard | FR-DASH-02 |
| CounsellorDashboard | FR-DASH-04 |
| NewCase | FR-INC-01, FR-INC-02, FR-INC-06, FR-INC-07, FR-STU-02 |
| MyReports | FR-INC-04 |
| CaseList | FR-CASE-01, FR-DASH-05 |
| CaseDetail | FR-CASE-06, FR-INT-06 |
| ReviewDetail | FR-CASE-02, FR-INC-05 |
| NewIntervention | FR-INT-02, FR-INT-04 |
| InterventionDetail | FR-INT-05 |
| FollowUpDetail | FR-INT-03 |
| CompleteFollowUp | FR-INT-03 |
| UserList | FR-AUTH-03 |
| UserDetail | FR-AUTH-03 |
| Configuration | FR-AUD-03 |
| ExportPage | FR-EXP-01, FR-EXP-02, FR-EXP-03, FR-EXP-06 |
| StudentList | FR-STU-01 |
| StudentDetail | FR-STU-03 |

### 5.4 Test Suites

| Test Suite | Requirements Covered |
|------------|---------------------|
| Auth tests | FR-AUTH-01, FR-AUTH-02, FR-AUTH-05, BR-01, BR-02 |
| User management tests | FR-AUTH-03, FR-AUTH-04 |
| Student tests | FR-STU-01, FR-STU-02, FR-STU-03, FR-STU-04 |
| Case creation tests | FR-INC-01, FR-INC-02, FR-INC-06, FR-INC-07 |
| Case management tests | FR-CASE-01, FR-CASE-02, FR-CASE-03, FR-CASE-04, FR-CASE-05, FR-CASE-07 |
| Intervention tests | FR-INT-01, FR-INT-02, FR-INT-03, FR-INT-04, FR-INT-05, FR-INT-06 |
| Dashboard tests | FR-DASH-01, FR-DASH-02, FR-DASH-03, FR-DASH-04, FR-DASH-05 |
| Export tests | FR-EXP-01, FR-EXP-02, FR-EXP-03, FR-EXP-04, FR-EXP-05, FR-EXP-07 |
| Audit tests | FR-AUD-01, FR-AUD-02 |
| Authorization tests | NFR-SEC-01, NFR-SEC-05 |
| Security tests | NFR-SEC-03, NFR-SEC-04 |
| E2E: Teacher workflow | AC-02, AC-03 |
| E2E: Principal workflow | AC-01, AC-04 |
| E2E: Counsellor workflow | AC-05 |
| E2E: Export workflow | AC-08, AC-09 |

---

## 6. Gap Analysis

### 6.1 Requirements Not Yet Mapped to Components

| Requirement | Gap | Resolution |
|-------------|-----|------------|
| FR-AUTH-06 (password reset) | No implementation planned for MVP | Defer to Phase 2 |
| FR-INC-03 (optional fields) | Optional fields not in MVP schema | Defer to Phase 2 |
| FR-DASH-06 (notifications) | No notification system in MVP | Defer to Phase 2 |
| NFR-ACC-01 (accessibility) | No accessibility testing in MVP | Defer to Phase 2 |
| NFR-PERF-01 (performance targets) | No load testing in MVP | Defer to Phase 2 |

### 6.2 Components Without Clear Requirement Mapping

| Component | Status | Action |
|-----------|--------|--------|
| ForgotPasswordPage | Phase 2 only | Document for future implementation |
| NotificationBell | Phase 2 only | Document for future implementation |
| Attachment upload | Phase 2 only | Document for future implementation |

---

## 7. Test Coverage Summary

### 7.1 Unit Test Coverage Target: 80%

| Module | Target Coverage | Priority |
|--------|----------------|----------|
| AuthService | 90% | High |
| CaseService | 85% | High |
| PermissionService | 90% | High |
| ValidationMiddleware | 85% | High |
| ExportService | 85% | High |
| AuditService | 80% | Medium |
| ConfigurationService | 75% | Medium |

### 7.2 Integration Test Coverage Target: 70%

| API Group | Target Coverage | Priority |
|-----------|----------------|----------|
| Auth endpoints | 90% | High |
| Case endpoints | 80% | High |
| User endpoints | 75% | Medium |
| Export endpoints | 85% | High |
| Dashboard endpoints | 70% | Medium |

### 7.3 E2E Test Coverage Target: Critical Paths

| User Journey | Status | Priority |
|--------------|--------|----------|
| Teacher login and submit incident | Required | High |
| Principal approve account and review case | Required | High |
| Counsellor record intervention | Required | High |
| CSV export by principal | Required | High |
| Unauthorized access blocked | Required | High |

---

## 8. Traceability Summary

### 8.1 Requirements Coverage

| Category | Total Requirements | MVP Coverage | Deferred |
|----------|-------------------|--------------|----------|
| Functional (Must) | 32 | 28 | 4 |
| Functional (Should) | 6 | 0 | 6 |
| Non-Functional (Must) | 8 | 8 | 0 |
| Non-Functional (Should) | 6 | 0 | 6 |
| Business Rules | 10 | 10 | 0 |
| Acceptance Criteria | 12 | 12 | 0 |
| **Total** | **74** | **58** | **16** |

### 8.2 MVP Coverage Percentage

- **Functional Requirements (Must)**: 87.5% (28/32)
- **Non-Functional Requirements (Must)**: 100% (8/8)
- **Business Rules**: 100% (10/10)
- **Acceptance Criteria**: 100% (12/12)
- **Overall MVP Coverage**: 78.4% (58/74)

### 8.3 Deferred Requirements Summary

All deferred requirements are marked as "Should" priority in the SRS, meaning they are important but not required for the initial MVP release:

1. FR-AUTH-06: Password reset or identity provider
2. FR-INC-03: Optional fields (witnesses, location, attachments)
3. FR-DASH-06: In-app notifications
4. NFR-AVL-01: 99.5% availability target
5. NFR-PERF-01: 3-second response time target
6. NFR-PERF-02: CSV export time target
7. NFR-ACC-01: WCAG 2.2 AA compliance
8. NFR-MNT-01: Maintainability documentation
9. NFR-COMP-01: Compliance review (ongoing process)

---

## 9. Verification Checklist

Before MVP release, verify:

- [ ] All 58 MVP requirements are implemented
- [ ] All 12 acceptance criteria are met
- [ ] All 10 business rules are enforced
- [ ] All critical E2E tests pass
- [ ] Unit test coverage ≥ 80% for high-priority modules
- [ ] Integration test coverage ≥ 70% for high-priority APIs
- [ ] Security tests pass (authorization, injection protection, session management)
- [ ] CSV export tests pass (format, permissions, formula injection protection)
- [ ] Audit logging captures all significant actions
- [ ] Database schema matches documented design
- [ ] API endpoints match documented design
- [ ] Frontend components match documented design
- [ ] Permissions matrix is correctly implemented
- [ ] Configuration management works correctly
- [ ] Backup and restore procedures are documented and tested
