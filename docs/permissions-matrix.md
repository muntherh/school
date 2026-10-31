# Permissions Matrix

## 1. Role-Based Access Control (RBAC) Matrix

### Legend
- ✅ = Full access (create, read, update, delete where applicable)
- 👁 = Read-only access
- ➕ = Create only
- ✏ = Update only (limited fields)
- 🚫 = No access
- 🔒 = Access only to own records
- 📋 = Access only to assigned records

### 1.1 User Management

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| List all users | 🚫 | ✅ | 🚫 | ✅ |
| Create user | 🚫 | ✅ | 🚫 | ✅ |
| View user details | 🔒 | ✅ | 🚫 | ✅ |
| Update own profile | ✏ | ✅ | ✏ | ✏ |
| Update other users | 🚫 | ✅ | 🚫 | ✅ |
| Approve account | 🚫 | ✅ | 🚫 | ✅ |
| Deactivate account | 🚫 | ✅ | 🚫 | ✅ |
| View account status | 🔒 | ✅ | 🔒 | ✅ |

### 1.2 Student Records

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| Search students | 👁 | ✅ | 👁 | 👁 |
| View student details | 👁 | ✅ | 👁 | 👁 |
| View student case history | 🔒 | ✅ | 👁* | 🔒 |
| Create student | 🚫 | ✅ | 🚫 | ✅ |
| Update student | 🚫 | ✅ | 🚫 | ✅ |
| Delete student | 🚫 | 🚫 | 🚫 | 🚫 |

*Note: Counsellor can view case history only for students in cases they are assigned to, per school policy.

### 1.3 Case/Incident Management

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| Create incident | ➕ | ➕ | 🚫 | 🚫 |
| View all cases | 🚫 | ✅ | 🚫 | 🚫 |
| View own cases | ✅ | ✅ | 🚫 | 🚫 |
| View assigned cases | 🚫 | ✅ | 📋 | 🚫 |
| View case details | 🔒 | ✅ | 📋 | 🔒 |
| Update own case (limited) | ✏* | ✅ | 🚫 | 🚫 |
| Update any case | 🚫 | ✅ | 🚫 | 🚫 |
| Change case status | 🚫 | ✅ | 🚫 | 🚫 |
| Reopen closed case | 🚫 | ✅ | 🚫 | 🚫 |
| Request clarification | 🚫 | ✅ | 🚫 | 🚫 |
| Respond to clarification | ✏ | ✅ | 🚫 | 🚫 |
| Delete case | 🚫 | 🚫 | 🚫 | 🚫 |

*Note: Teacher can only update description, location, witnesses if case status allows (e.g., CLARIFICATION_REQUIRED).

### 1.4 Case Review

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| View reviews | 🔒 | ✅ | 📋 | 🚫 |
| Create review | 🚫 | ✅ | 🚫 | 🚫 |
| Update review | 🚫 | ✅ | 🚫 | 🚫 |
| Delete review | 🚫 | 🚫 | 🚫 | 🚫 |

### 1.5 Disciplinary Actions

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| View actions (own cases) | 👁 | ✅ | 📋 | 🚫 |
| View actions (all cases) | 🚫 | ✅ | 🚫 | 🚫 |
| Create action | 🚫 | ✅ | 🚫 | 🚫 |
| Update action status | 🚫 | ✅ | 📋 | 🚫 |
| Update any action | 🚫 | ✅ | 🚫 | 🚫 |
| Delete action | 🚫 | 🚫 | 🚫 | 🚫 |

### 1.6 Interventions

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| View interventions (own cases) | 👁* | ✅ | 📋 | 🚫 |
| View interventions (all cases) | 🚫 | ✅ | 🚫 | 🚫 |
| Create intervention | 🚫 | ✅ | ➕ | 🚫 |
| Update own intervention | 🚫 | ✅ | ✏ | 🚫 |
| Update any intervention | 🚫 | ✅ | 🚫 | 🚫 |
| View confidential notes | 🚫 | ✅ | 🔒 | 🚫 |
| Create confidential note | 🚫 | 🚫 | ➕ | 🚫 |
| Delete intervention | 🚫 | 🚫 | 🚫 | 🚫 |

*Note: Teacher can view non-confidential intervention details only for their own cases.

### 1.7 Follow-ups

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| View follow-ups (own cases) | 👁 | ✅ | 📋 | 🚫 |
| View follow-ups (all cases) | 🚫 | ✅ | 🚫 | 🚫 |
| View assigned follow-ups | 📋 | ✅ | 📋 | 📋 |
| Create follow-up | 🚫 | ✅ | ➕ | 🚫 |
| Update assigned follow-up | ✏ | ✏ | ✏ | ✏ |
| Update any follow-up | 🚫 | ✅ | 🚫 | 🚫 |
| Delete follow-up | 🚫 | 🚫 | 🚫 | 🚫 |

### 1.8 Dashboard

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| View teacher dashboard | ✅ | 🚫 | 🚫 | 🚫 |
| View principal dashboard | 🚫 | ✅ | 🚫 | ✅ |
| View counsellor dashboard | 🚫 | 🚫 | ✅ | 🚫 |
| View admin dashboard | 🚫 | 🚫 | 🚫 | ✅ |

### 1.9 CSV Export

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| Export cases | 🚫 | ✅ | 🚫 | ✅ |
| Export with all fields | 🚫 | ✅ | 🚫 | ✅ |
| Export with limited fields | 🚫 | ✅ | 🚫 | ✅ |
| View export history | 🚫 | ✅ | 🚫 | ✅ |
| Download own export | 🚫 | ✅ | 🚫 | ✅ |

### 1.10 Configuration

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| View configuration | 🚫 | ✅ | 🚫 | ✅ |
| Update configuration | 🚫 | ✅ | 🚫 | ✅ |
| Add incident category | 🚫 | ✅ | 🚫 | ✅ |
| Add action type | 🚫 | ✅ | 🚫 | ✅ |

### 1.11 Audit Log

| Resource | Teacher | Principal | Counsellor | Admin |
|----------|---------|-----------|------------|-------|
| View audit log | 🚫 | ✅ | 🚫 | ✅ |
| View own audit entries | 🔒 | ✅ | 🔒 | 🔒 |
| Delete audit entries | 🚫 | 🚫 | 🚫 | 🚫 |
| Modify audit entries | 🚫 | 🚫 | 🚫 | 🚫 |

---

## 2. Field-Level Permissions

### 2.1 Case Entity Fields

| Field | Teacher (Own) | Teacher (Others) | Principal | Counsellor (Assigned) |
|-------|---------------|------------------|-----------|----------------------|
| id | 👁 | 🚫 | 👁 | 👁 |
| referenceNumber | 👁 | 🚫 | 👁 | 👁 |
| studentId | 👁 | 🚫 | 👁 | 👁 |
| student.name | 👁 | 🚫 | 👁 | 👁 |
| student.classGrade | 👁 | 🚫 | 👁 | 👁 |
| reporterId | 👁 | 🚫 | 👁 | 👁 |
| reporter.name | 👁 | 🚫 | 👁 | 👁 |
| incidentDate | 👁 | 🚫 | 👁 | 👁 |
| incidentTime | 👁 | 🚫 | 👁 | 👁 |
| category | 👁 | 🚫 | 👁 | 👁 |
| description | 👁/✏ | 🚫 | 👁 | 👁 |
| location | 👁/✏ | 🚫 | 👁 | 👁 |
| witnesses | 👁/✏ | 🚫 | 👁 | 👁 |
| immediateSafetyConcern | 👁 | 🚫 | 👁 | 👁 |
| status | 👁 | 🚫 | 👁/✏ | 👁 |
| submittedAt | 👁 | 🚫 | 👁 | 👁 |
| closedAt | 👁 | 🚫 | 👁 | 👁 |
| closedBy | 👁 | 🚫 | 👁 | 👁 |
| reopenReason | 👁 | 🚫 | 👁 | 👁 |

### 2.2 Intervention Entity Fields

| Field | Teacher (Own) | Principal | Counsellor (Own) | Counsellor (Others) |
|-------|---------------|-----------|------------------|---------------------|
| id | 👁 | 👁 | 👁 | 👁 |
| caseId | 👁 | 👁 | 👁 | 👁 |
| counsellorId | 👁 | 👁 | 👁 | 👁 |
| type | 👁 | 👁 | 👁 | 👁 |
| date | 👁 | 👁 | 👁 | 👁 |
| notes | 👁 | 👁 | 👁/✏ | 👁 |
| confidentialityLevel | 👁 | 👁 | 👁/✏ | 👁 |
| outcome | 👁 | 👁 | 👁/✏ | 👁 |
| nextStep | 👁 | 👁 | 👁/✏ | 👁 |
| confidentialNotes | 🚫 | 👁 | 👁 | 🚫 |

### 2.3 Student Entity Fields

| Field | Teacher | Principal | Counsellor | Admin |
|-------|---------|-----------|------------|-------|
| id | 👁 | 👁 | 👁 | 👁 |
| studentId | 👁 | 👁 | 👁 | 👁 |
| name | 👁 | 👁 | 👁 | 👁 |
| classGrade | 👁 | 👁 | 👁 | 👁 |
| activeStatus | 👁 | 👁 | 👁 | 👁 |
| contactInfo | 👁 | 👁 | 👁 | 👁 |

### 2.4 User Entity Fields

| Field | Self | Principal | Admin |
|-------|------|-----------|-------|
| id | 👁 | 👁 | 👁 |
| name | 👁/✏ | 👁 | 👁 |
| staffIdentifier | 👁 | 👁 | 👁 |
| email | 👁 | 👁 | 👁 |
| passwordHash | 🚫 | 🚫 | 🚫 |
| role | 👁 | 👁/✏ | 👁/✏ |
| accountStatus | 👁 | 👁/✏ | 👁/✏ |
| createdAt | 👁 | 👁 | 👁 |
| approvedAt | 👁 | 👁 | 👁 |
| approvedBy | 👁 | 👁 | 👁 |

---

## 3. Status Transition Permissions

### 3.1 Case Status Transitions

| From | To | Teacher | Principal | Counsellor | Admin |
|------|----|---------|-----------|------------|-------|
| DRAFT | SUBMITTED | ✅ | ✅ | 🚫 | 🚫 |
| SUBMITTED | UNDER_REVIEW | 🚫 | ✅ | 🚫 | 🚫 |
| SUBMITTED | CLARIFICATION_REQUIRED | 🚫 | ✅ | 🚫 | 🚫 |
| SUBMITTED | ASSIGNED | 🚫 | ✅ | 🚫 | 🚫 |
| SUBMITTED | REJECTED | 🚫 | ✅ | 🚫 | 🚫 |
| UNDER_REVIEW | CLARIFICATION_REQUIRED | 🚫 | ✅ | 🚫 | 🚫 |
| UNDER_REVIEW | ASSIGNED | 🚫 | ✅ | 🚫 | 🚫 |
| UNDER_REVIEW | ACTION_PENDING | 🚫 | ✅ | 🚫 | 🚫 |
| UNDER_REVIEW | REJECTED | 🚫 | ✅ | 🚫 | 🚫 |
| CLARIFICATION_REQUIRED | SUBMITTED | ✅ | ✅ | 🚫 | 🚫 |
| CLARIFICATION_REQUIRED | UNDER_REVIEW | 🚫 | ✅ | 🚫 | 🚫 |
| ASSIGNED | ACTION_PENDING | 🚫 | ✅ | 🚫 | 🚫 |
| ACTION_PENDING | FOLLOW_UP_PENDING | 🚫 | ✅ | ✅ | 🚫 |
| ACTION_PENDING | CLOSED | 🚫 | ✅ | 🚫 | 🚫 |
| FOLLOW_UP_PENDING | CLOSED | 🚫 | ✅ | ✅ | 🚫 |
| CLOSED | REOPENED | 🚫 | ✅ | 🚫 | 🚫 |
| REOPENED | UNDER_REVIEW | 🚫 | ✅ | 🚫 | 🚫 |

### 3.2 Disciplinary Action Status Transitions

| From | To | Principal | Responsible User |
|------|----|-----------|------------------|
| PENDING | IN_PROGRESS | ✅ | ✅ |
| PENDING | CANCELLED | ✅ | ✅ |
| IN_PROGRESS | COMPLETED | ✅ | ✅ |
| IN_PROGRESS | CANCELLED | ✅ | ✅ |
| COMPLETED | CANCELLED | ✅ | 🚫 |

### 3.3 Follow-up Status Transitions

| From | To | Assigned User | Principal |
|------|----|---------------|-----------|
| PENDING | COMPLETED | ✅ | ✅ |
| PENDING | CANCELLED | ✅ | ✅ |
| OVERDUE | COMPLETED | ✅ | ✅ |
| OVERDUE | CANCELLED | ✅ | ✅ |

---

## 4. Export Field Permissions

### 4.1 Standard Export Fields (All Authorized Exporters)

| Field | Principal | Admin |
|-------|-----------|-------|
| referenceNumber | ✅ | ✅ |
| studentId | ✅ | ✅ |
| studentName | ✅ | ✅ |
| classGrade | ✅ | ✅ |
| incidentDate | ✅ | ✅ |
| category | ✅ | ✅ |
| status | ✅ | ✅ |
| submittedAt | ✅ | ✅ |
| reporterName | ✅ | ✅ |

### 4.2 Extended Export Fields (Principal Only)

| Field | Principal | Admin |
|-------|-----------|-------|
| description | ✅ | ✅ |
| location | ✅ | ✅ |
| decision | ✅ | ✅ |
| decisionDate | ✅ | ✅ |
| actionType | ✅ | ✅ |
| actionStartDate | ✅ | ✅ |
| actionEndDate | ✅ | ✅ |
| interventionType | ✅ | ✅ |
| interventionDate | ✅ | ✅ |
| followUpStatus | ✅ | ✅ |
| closedAt | ✅ | ✅ |

### 4.3 Restricted Fields (Never in CSV Export)

| Field | Exportable? | Reason |
|-------|-------------|--------|
| confidentialNotes | 🚫 | Highly sensitive counselling data |
| contactInfo | 🚫 | Personal contact information |
| passwordHash | 🚫 | Security credential |
| ipAddress | 🚫 | Security metadata |
| userAgent | 🚫 | Security metadata |

---

## 5. Implementation Notes

### 5.1 Permission Enforcement Strategy

1. **Middleware Layer**: Role-based route protection
2. **Service Layer**: Business logic permission checks
3. **Data Layer**: Query filtering based on permissions
4. **Response Layer**: Field-level filtering before sending to client

### 5.2 Permission Checking Order

1. Check if user is authenticated
2. Check if user account is active
3. Check if user has required role
4. Check if user has specific permission for the resource
5. Check if user has access to the specific record (ownership/assignment)
6. Check field-level permissions for sensitive data

### 5.3 Audit Trail for Permission Violations

Log all permission denials with:
- User ID and role
- Attempted action
- Resource type and ID
- Timestamp
- Reason for denial

### 5.4 Permission Caching

- Cache user roles and permissions in session
- Invalidate cache on role change or account status update
- Use short TTL (5 minutes) for permission caches

---

## 6. Default Assumptions for MVP

If school policy is not yet defined, the following defaults apply:

1. **Counsellor Access**: Can only view cases assigned to them by the principal
2. **Teacher Access**: Can only view their own submitted cases
3. **Case Assignment**: Only principal can assign cases to counsellors
4. **Confidential Notes**: Only accessible to the counsellor who created them and the principal
5. **Export**: Only principal and admin can export, with field restrictions as defined above
6. **Status Changes**: Only principal can change case status (except teacher resubmitting after clarification)
