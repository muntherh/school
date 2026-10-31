# Ambiguities, Contradictions, and Missing Decisions

## 1. Open Questions from SRS (Section 14)

The SRS explicitly identifies 14 open decisions that must be resolved before baselining requirements:

| ID | Question / Decision Needed | Proposed Starting Point | Impact |
|-----|---------------------------|------------------------|--------|
| OD-01 | Can the counsellor view a submitted case immediately, or only after principal review? | Counsellor can see a case after submission only if school policy permits; principal review remains a separate workflow step | Affects counsellor dashboard, access control logic, and workflow design |
| OD-02 | Can teachers see only their own reports or all cases concerning students they teach? | Own reports only, with carefully limited status and action summaries | Affects teacher permissions, dashboard, and search functionality |
| OD-03 | Who may formally approve a disciplinary action or close a case? | Principal, or another role explicitly delegated by school policy | Affects role permissions, workflow states, and approval matrix |
| OD-04 | Which fields in counselling notes are confidential and who can access them? | Restrict detailed notes to the counsellor and explicitly authorized school leadership | Affects database schema, field-level permissions, and export logic |
| OD-05 | What student information will be stored locally versus obtained from an existing school system? | Store the minimum required data and use an authoritative student identifier | Affects student entity design, potential integration points, and data synchronization |
| OD-06 | What are the required retention and deletion periods? | School to confirm with applicable Ministry and privacy requirements before launch | Affects archival policies, database cleanup jobs, and compliance |
| OD-07 | Which government bodies or staff may receive CSV exports, and which columns are required? | Create approved export templates and log every export | Affects export feature design, audit logging, and compliance |
| OD-08 | Are attachments, photographs, witness statements, or incident evidence required? | Optional in the first release unless the school confirms otherwise; if included, define access and retention controls | Affects incident entity design, file storage, and security |
| OD-09 | Are email, SMS, or in-app notifications required? | In-app notifications as the baseline; external channels are optional pending approval | Affects notification system architecture and implementation scope |
| OD-10 | What are expected user counts, peak usage, hosting budget, and availability needs? | Confirm before finalizing performance and hosting targets | Affects infrastructure sizing, performance targets, and cost planning |
| OD-11 | Is there a required technology stack or existing school IT environment? | Select after technical review; proposed stack is not binding | Affects technology choices and deployment strategy |
| OD-12 | Does the Ministry prescribe a specific reporting format or template? | Obtain the official template and map approved fields before export implementation | Affects CSV export schema and compliance |
| OD-13 | Is there a requirement for Arabic, English, or bilingual interfaces and reports? | Confirm language and right-to-left layout requirements before UI design | Affects UI/UX design, internationalization, and localization |
| OD-14 | How will staff accounts be created and identities verified? | Principal-approved invitation or school-approved identity provider | Affects authentication flow, account management, and security |

---

## 2. Additional Ambiguities Identified

### 2.1 Case vs Incident Separation
**Ambiguity**: Section 6.1 states "Case and incident may be separate tables if one case can cover multiple incidents" but does not clarify whether this is required for MVP.
**Impact**: Affects database schema complexity and workflow design.
**Recommendation**: For MVP, treat incident and case as 1:1 relationship. If multiple incidents per case are needed later, this can be refactored.

### 2.2 Status Transition Rules
**Ambiguity**: Appendix A lists 10 proposed statuses but does not define the complete state machine (which states can transition to which states, and by which roles).
**Impact**: Could lead to inconsistent workflow implementation.
**Recommendation**: Define explicit state transition matrix before implementation.

### 2.3 "Assigned" Status Semantics
**Ambiguity**: The "Assigned" status could mean assigned to a counsellor, assigned to a teacher for clarification, or assigned to another reviewer. The SRS does not clarify.
**Impact**: Affects dashboard logic and assignment workflow.
**Recommendation**: Clarify whether assignment is role-specific or generic, and whether multiple assignments are allowed per case.

### 2.4 Counsellor Access Policy
**Ambiguity**: FR-INT-01 states counsellor can view "cases authorized by the configured access policy" but the policy is not defined. OD-01 proposes a starting point but this is not confirmed.
**Impact**: Cannot implement counsellor permissions without clear policy.
**Recommendation**: Define explicit counsellor access rules (e.g., all cases, only assigned cases, only cases after principal review, etc.).

### 2.5 Confidential Note Implementation
**Ambiguity**: FR-INT-05 requires distinguishing general case notes from confidential counselling notes but does not specify whether this is a field-level flag, separate table, or separate entity.
**Impact**: Affects database schema and permission logic.
**Recommendation**: Define data model for confidential notes (e.g., separate `ConfidentialNote` entity with restricted access).

### 2.6 Dashboard Metrics Definition
**Ambiguity**: FR-DASH-02 lists "total cases, pending reviews, cases in progress, follow-ups due, and closed cases" but does not define what "pending reviews" or "in progress" mean in terms of status values.
**Impact**: Dashboard counts may be inconsistent.
**Recommendation**: Map each dashboard metric to specific case statuses.

### 2.7 Export Field Authorization
**Ambiguity**: FR-EXP-03 requires excluding unauthorized fields but does not specify which fields are considered sensitive or which roles can export which fields.
**Impact**: Export logic cannot be implemented without explicit field-to-role mapping.
**Recommendation**: Create export permission matrix defining which roles can export which fields.

### 2.8 CSV Formula Injection Mitigation
**Ambiguity**: FR-EXP-07 requires mitigating CSV formula injection but does not specify the exact method (e.g., prefixing with tab, escaping, using safe libraries).
**Impact**: Security implementation detail.
**Recommendation**: Define specific mitigation approach (e.g., prefix cells starting with `=`, `+`, `-`, `@` with a tab character).

### 2.9 Audit Log Scope
**Ambiguity**: FR-AUD-01 lists "sign-in events, account approvals, case status changes, decisions, and exports" but does not specify if all reads/views should be logged or only writes.
**Impact**: Affects audit log volume and performance.
**Recommendation**: Clarify whether read access to sensitive records should be logged (recommended for compliance) or only writes.

### 2.10 Configuration Management
**Ambiguity**: FR-AUD-03 mentions "approved configuration of incident categories and action types" but does not specify whether these are database-stored configuration or code-based enums.
**Impact**: Affects flexibility and deployment requirements.
**Recommendation**: For MVP, use database-stored configuration to allow runtime changes without code deployment.

### 2.11 Student Identifier Format
**Ambiguity**: SRS mentions "student identifier" but does not specify the format (e.g., student ID number, enrollment number, national ID).
**Impact**: Affects validation rules and integration potential.
**Recommendation**: Define student identifier format and validation rules.

### 2.12 Staff Identifier Format
**Ambiguity**: User entity includes "staff identifier" but format is not specified.
**Impact**: Affects validation and reporting.
**Recommendation**: Define staff identifier format (e.g., employee ID).

### 2.13 Password Reset Implementation
**Ambiguity**: FR-AUTH-06 is a "Should" requirement for password reset but does not specify the mechanism (email link, security questions, admin reset).
**Impact**: Affects authentication flow and security.
**Recommendation**: For MVP, implement admin-initiated password reset. Email-based self-service can be added later.

### 2.14 Session Expiry Duration
**Ambiguity**: FR-AUTH-05 requires session expiry but does not specify the duration (e.g., 30 minutes, 8 hours, 24 hours).
**Impact**: Affects user experience and security.
**Recommendation**: Define session timeout duration based on security requirements.

### 2.15 Time Zone Handling
**Ambiguity**: Section 6.2 mentions "displayed in the school's configured time zone" but does not specify how to handle users in different time zones or daylight saving time.
**Impact**: Affects timestamp display and reporting accuracy.
**Recommendation**: Define time zone policy (e.g., all times in school's local time, or user-selectable time zone).

### 2.16 Maximum Export Size
**Ambiguity**: NFR-PERF-02 mentions "maximum export size" but does not specify what it is.
**Impact**: Affects performance targets and potential pagination/limit requirements.
**Recommendation**: Define maximum row count for CSV exports (e.g., 10,000 rows) with pagination if needed.

### 2.17 Concurrent User Profile
**Ambiguity**: NFR-PERF-01 mentions "concurrent-user profile" for load testing but does not specify expected concurrency.
**Impact**: Cannot set realistic performance targets.
**Recommendation**: Define expected concurrent users (e.g., 50 simultaneous users).

### 2.18 Backup Frequency
**Ambiguity**: NFR-BCP-01 mentions "school-approved schedule" but does not propose a frequency.
**Impact**: Affects RPO (Recovery Point Objective).
**Recommendation**: Define backup frequency (e.g., daily full backups, hourly incremental).

### 2.19 Data Validation Rules
**Ambiguity**: Section 6.2 mentions "reasonable length limits" for free-text fields but does not specify actual limits.
**Impact**: Cannot implement validation without specific limits.
**Recommendation**: Define maximum lengths for all text fields (e.g., description: 2000 chars, notes: 5000 chars).

### 2.20 Attachment Size Limits
**Ambiguity**: If attachments are included (OD-08), size limits are not specified.
**Impact**: Affects storage requirements and performance.
**Recommendation**: If attachments are included, define maximum file size (e.g., 10MB per file).

---

## 3. Potential Contradictions

### 3.1 Counsellor Access Timing
**Issue**: OD-01 proposes counsellor can see cases after submission, but FR-INT-01 says "authorized by configured access policy" which could restrict access until after principal review.
**Resolution Needed**: Clarify whether counsellor access is immediate or post-review.

### 3.2 Teacher Access Scope
**Issue**: OD-02 proposes teachers see only their own reports, but FR-STU-03 (Should) suggests viewing student case history, which could imply seeing other teachers' reports about the same student.
**Resolution Needed**: Define whether teachers can see other reports for students they teach.

### 3.3 MVP vs Optional Features
**Issue**: Several "Should" priority requirements (e.g., FR-AUTH-06 password reset, FR-DASH-06 notifications) may be essential for usability but are marked as optional.
**Resolution Needed**: Review "Should" items and confirm which are actually required for MVP.

---

## 4. Missing Decisions Required Before Implementation

### 4.1 Critical Path Decisions (Block Implementation)
1. **Counsellor access policy** (OD-01, OD-04)
2. **Teacher access scope** (OD-02)
3. **Case approval authority** (OD-03)
4. **Student data source and fields** (OD-05)
5. **Export templates and recipients** (OD-07)
6. **Status transition matrix** (not in SRS but required)
7. **Field-level permission matrix** (not in SRS but required)
8. **Dashboard metric definitions** (not in SRS but required)

### 4.2 Important but Non-Blocking Decisions
1. **Retention policy** (OD-06) - can use default archival initially
2. **Attachments** (OD-08) - can defer to Phase 2
3. **Notification channels** (OD-09) - in-app is sufficient for MVP
4. **Performance targets** (OD-10) - can use reasonable defaults
5. **Technology stack** (OD-11) - Next.js/PostgreSQL is proposed and acceptable
6. **Ministry reporting format** (OD-12) - can use generic CSV initially
7. **Language requirements** (OD-13) - can start with English, add i18n later
8. **Account creation flow** (OD-14) - admin-created accounts acceptable for MVP

### 4.3 Implementation Detail Decisions
1. **Case vs Incident table structure**
2. **Confidential note data model**
3. **CSV formula injection mitigation method**
4. **Audit log scope (reads vs writes)**
5. **Configuration storage (database vs code)**
6. **Identifier formats**
7. **Session expiry duration**
8. **Time zone handling**
9. **Export size limits**
10. **Field length limits**
11. **Backup frequency**

---

## 5. Recommendations for Resolution

### 5.1 Immediate Actions (Before Architecture Finalization)
1. **Schedule stakeholder workshop** to resolve OD-01 through OD-05 (critical path decisions)
2. **Define status transition matrix** with explicit role permissions for each transition
3. **Create field-level permission matrix** for all entities
4. **Define dashboard metrics** with status mappings
5. **Confirm student data fields** with school administration

### 5.2 MVP Scoping Recommendations
Based on the SRS and identified ambiguities, the following approach is recommended:

**Include in MVP:**
- Core authentication with admin-created accounts (defer self-service signup)
- Teacher incident submission with required fields only
- Principal review workflow with basic status transitions
- Counsellor intervention recording (access limited to assigned cases)
- Basic dashboards for each role
- CSV export with predefined template
- Audit logging for all write operations
- In-app notifications (defer email/SMS)

**Defer to Phase 2:**
- Attachments and file uploads
- Self-service password reset
- Email/SMS notifications
- Advanced reporting and analytics
- Bulk operations
- Student/parent portals
- External system integrations

### 5.3 Default Assumptions for Architecture Design
If immediate stakeholder resolution is not possible, the following defaults are proposed for architecture design:

| Decision Area | Proposed Default for Architecture | Rationale |
|---------------|-----------------------------------|-----------|
| Counsellor access | View all cases after principal review only | Balances access need with oversight |
| Teacher access | View only own reports | Simplest permission model |
| Case approvalPrincipal only | Clear authority chain | |
| Confidential notes | Separate table, accessible only to counsellor and principal | Maximum security |
| Case/Incident | 1:1 relationship in MVP | Simpler schema, can extend later |
| Status transitions | Linear flow with principal-controlled branches | Easier to implement and validate |
| Configuration | Database-stored | Flexibility without code changes |
| Time zone | School local time only | Avoids complexity in MVP |
| Session expiry | 8 hours inactivity | Balance of security and usability |
| Export limit | 10,000 rows per export | Prevents performance issues |
