# Application Routes and API Endpoints

## 1. Frontend Routes (Next.js App Router)

### 1.1 Public Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Public landing page (if any) |
| `/login` | LoginPage | Login form |
| `/forgot-password` | ForgotPasswordPage | Password reset request (Phase 2) |

### 1.2 Authenticated Routes (Protected by Middleware)

#### Dashboard Routes
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/dashboard` | Dashboard | All roles | Role-specific dashboard |
| `/dashboard/teacher` | TeacherDashboard | Teacher | Teacher's submitted reports |
| `/dashboard/principal` | PrincipalDashboard | Principal | Principal overview |
| `/dashboard/counsellor` | CounsellorDashboard | Counsellor | Counsellor assigned cases |

#### Case Management Routes
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/cases` | CaseList | Principal, Counsellor | List of all cases (filtered by role) |
| `/cases/my-reports` | MyReports | Teacher | Teacher's own reports |
| `/cases/[id]` | CaseDetail | All roles (with permissions) | Case detail view |
| `/cases/[id]/edit` | CaseEdit | Principal, Reporter | Edit case (limited fields) |
| `/cases/new` | NewCase | Teacher | Create new incident report |

#### Review Routes
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/reviews` | ReviewQueue | Principal | Cases pending review |
| `/reviews/[id]` | ReviewDetail | Principal | Review a specific case |

#### Intervention Routes
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/interventions` | InterventionList | Counsellor | List of interventions |
| `/interventions/[id]` | InterventionDetail | Counsellor | Intervention detail |
| `/interventions/new` | NewIntervention | Counsellor | Create new intervention |

#### Follow-up Routes
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/follow-ups` | FollowUpList | Principal, Counsellor | List of follow-ups |
| `/follow-ups/[id]` | FollowUpDetail | Assigned user | Follow-up detail |
| `/follow-ups/[id]/complete` | CompleteFollowUp | Assigned user | Mark follow-up as complete |

#### Admin Routes
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/admin/users` | UserList | Principal, Admin | List of staff accounts |
| `/admin/users/new` | NewUser | Principal, Admin | Create new staff account |
| `/admin/users/[id]` | UserDetail | Principal, Admin | User detail and approval |
| `/admin/configuration` | Configuration | Principal, Admin | System configuration |
| `/admin/audit-log` | AuditLog | Principal, Admin | Audit log viewer |

#### Export Routes
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/export` | ExportPage | Principal, Admin | CSV export interface |

#### Student Routes
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/students` | StudentList | All roles | Student search |
| `/students/[id]` | StudentDetail | All roles (with permissions) | Student detail and case history |

---

## 2. API Endpoints (RESTful)

### 2.1 Authentication Endpoints

#### POST `/api/auth/login`
**Description**: Authenticate user and return session token
**Access**: Public
**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "TEACHER|PRINCIPAL|COUNSELLOR|ADMIN",
      "accountStatus": "ACTIVE"
    },
    "sessionToken": "string"
  }
}
```
**Error Responses**: 401 (invalid credentials), 403 (account not approved)

#### POST `/api/auth/logout`
**Description**: Invalidate user session
**Access**: Authenticated
**Response**: 204 No Content

#### GET `/api/auth/me`
**Description**: Get current user information
**Access**: Authenticated
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "TEACHER|PRINCIPAL|COUNSELLOR|ADMIN",
    "accountStatus": "ACTIVE"
  }
}
```

---

### 2.2 User Management Endpoints

#### GET `/api/users`
**Description**: List all staff accounts
**Access**: Principal, Admin
**Query Params**: `status`, `role`, `search`
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "staffIdentifier": "string",
      "email": "string",
      "role": "TEACHER",
      "accountStatus": "ACTIVE",
      "createdAt": "datetime",
      "approvedAt": "datetime"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

#### POST `/api/users`
**Description**: Create new staff account
**Access**: Principal, Admin
**Request Body**:
```json
{
  "name": "string",
  "staffIdentifier": "string",
  "email": "string",
  "role": "TEACHER",
  "password": "string"
}
```
**Response**: 201 Created with user object

#### GET `/api/users/:id`
**Description**: Get user details
**Access**: Principal, Admin, or own account
**Response**: User object

#### PATCH `/api/users/:id/status`
**Description**: Approve, deactivate, or reactivate account
**Access**: Principal, Admin
**Request Body**:
```json
{
  "status": "ACTIVE|DEACTIVATED|REJECTED"
}
```
**Response**: Updated user object

#### PATCH `/api/users/:id`
**Description**: Update user information
**Access**: Principal, Admin, or own account (limited fields)
**Request Body**: Partial user object
**Response**: Updated user object

---

### 2.3 Student Endpoints

#### GET `/api/students`
**Description**: Search students
**Access**: All authenticated roles
**Query Params**: `studentId`, `name`, `classGrade`, `activeStatus`
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "studentId": "string",
      "name": "string",
      "classGrade": "string",
      "activeStatus": true
    }
  ]
}
```

#### GET `/api/students/:id`
**Description**: Get student details
**Access**: All authenticated roles
**Response**: Student object with case history (if permitted)

#### GET `/api/students/:id/cases`
**Description**: Get student's case history
**Access**: Principal, Counsellor (with policy), Teacher (own reports only)
**Response**: Array of case objects

---

### 2.4 Case/Incident Endpoints

#### GET `/api/cases`
**Description**: List cases with filters
**Access**: All roles (filtered by permissions)
**Query Params**: `status`, `studentId`, `reporterId`, `category`, `incidentDateFrom`, `incidentDateTo`, `page`, `limit`
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "referenceNumber": "string",
      "student": {
        "id": "uuid",
        "studentId": "string",
        "name": "string",
        "classGrade": "string"
      },
      "reporter": {
        "id": "uuid",
        "name": "string"
      },
      "incidentDate": "date",
      "category": "string",
      "status": "SUBMITTED",
      "submittedAt": "datetime"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

#### POST `/api/cases`
**Description**: Create new incident report
**Access**: Teacher
**Request Body**:
```json
{
  "studentId": "uuid",
  "incidentDate": "date",
  "incidentTime": "time",
  "category": "string",
  "description": "string",
  "location": "string?",
  "witnesses": "string?",
  "immediateSafetyConcern": boolean
}
```
**Response**: 201 Created with case object including referenceNumber

#### GET `/api/cases/:id`
**Description**: Get case details
**Access**: All roles (with field-level permissions)
**Response**: Full case object with related entities (reviews, actions, interventions, follow-ups)

#### PATCH `/api/cases/:id`
**Description**: Update case (limited fields)
**Access**: Principal (all fields), Reporter (description, location, witnesses if status allows)
**Request Body**: Partial case object
**Response**: Updated case object

#### PATCH `/api/cases/:id/status`
**Description**: Change case status
**Access**: Principal only
**Request Body**:
```json
{
  "status": "UNDER_REVIEW",
  "reason": "string?"
}
```
**Response**: Updated case object

#### POST `/api/cases/:id/reopen`
**Description**: Reopen a closed case
**Access**: Principal only
**Request Body**:
```json
{
  "reason": "string"
}
```
**Response**: Updated case object

#### GET `/api/cases/:id/history`
**Description**: Get case change history
**Access**: Principal, Counsellor (assigned cases), Reporter (own cases)
**Response**: Array of audit events related to the case

---

### 2.5 Case Review Endpoints

#### GET `/api/cases/:id/reviews`
**Description**: Get all reviews for a case
**Access**: Principal, Counsellor (with permissions)
**Response**: Array of review objects

#### POST `/api/cases/:id/reviews`
**Description**: Create a case review
**Access**: Principal only
**Request Body**:
```json
{
  "result": "APPROVED|RETURNED|ASSIGNED",
  "clarificationRequest": "string?",
  "notes": "string?"
}
```
**Response**: 201 Created with review object

#### POST `/api/cases/:id/clarification`
**Description**: Respond to clarification request
**Access**: Reporter (own case)
**Request Body**:
```json
{
  "response": "string"
}
```
**Response**: Updated case object

---

### 2.6 Disciplinary Action Endpoints

#### GET `/api/cases/:id/actions`
**Description**: Get disciplinary actions for a case
**Access**: Principal, Counsellor (assigned), Reporter (own case)
**Response**: Array of action objects

#### POST `/api/cases/:id/actions`
**Description**: Create disciplinary action
**Access**: Principal only
**Request Body**:
```json
{
  "actionType": "string",
  "rationale": "string",
  "startDate": "date?",
  "endDate": "date?",
  "responsibleUserId": "uuid"
}
```
**Response**: 201 Created with action object

#### PATCH `/api/actions/:id`
**Description**: Update action status
**Access**: Principal, responsible user
**Request Body**:
```json
{
  "status": "IN_PROGRESS|COMPLETED|CANCELLED"
}
```
**Response**: Updated action object

---

### 2.7 Intervention Endpoints

#### GET `/api/cases/:id/interventions`
**Description**: Get interventions for a case
**Access**: Principal, Counsellor (assigned), Reporter (own case - non-confidential only)
**Response**: Array of intervention objects (confidential notes excluded for non-authorized)

#### POST `/api/cases/:id/interventions`
**Description**: Create intervention
**Access**: Counsellor only
**Request Body**:
```json
{
  "type": "string",
  "date": "date",
  "notes": "string",
  "confidentialityLevel": "STANDARD|CONFIDENTIAL",
  "outcome": "string?",
  "nextStep": "string?"
}
```
**Response**: 201 Created with intervention object

#### PATCH `/api/interventions/:id`
**Description**: Update intervention
**Access**: Counsellor who created it, or Principal
**Request Body**: Partial intervention object
**Response**: Updated intervention object

#### POST `/api/interventions/:id/confidential-notes`
**Description**: Add confidential note to intervention
**Access**: Counsellor only
**Request Body**:
```json
{
  "notes": "string"
}
```
**Response**: 201 Created with confidential note object

#### GET `/api/interventions/:id/confidential-notes`
**Description**: Get confidential notes for intervention
**Access**: Counsellor who created it, Principal only
**Response**: Array of confidential note objects

---

### 2.8 Follow-up Endpoints

#### GET `/api/cases/:id/follow-ups`
**Description**: Get follow-ups for a case
**Access**: Principal, Counsellor (assigned), Reporter (own case)
**Response**: Array of follow-up objects

#### POST `/api/cases/:id/follow-ups`
**Description**: Create follow-up
**Access**: Principal, Counsellor
**Request Body**:
```json
{
  "dueDate": "date",
  "assignedUserId": "uuid",
  "nextStep": "string?"
}
```
**Response**: 201 Created with follow-up object

#### PATCH `/api/follow-ups/:id`
**Description**: Update follow-up
**Access**: Assigned user, Principal
**Request Body**:
```json
{
  "completionDate": "date?",
  "result": "string?",
  "nextStep": "string?",
  "status": "COMPLETED|CANCELLED"
}
```
**Response**: Updated follow-up object

#### GET `/api/follow-ups/my-tasks`
**Description**: Get follow-ups assigned to current user
**Access**: All authenticated roles
**Response**: Array of follow-up objects

---

### 2.9 Dashboard Endpoints

#### GET `/api/dashboard/teacher`
**Description**: Get teacher dashboard data
**Access**: Teacher only
**Response**:
```json
{
  "success": true,
  "data": {
    "totalReports": 10,
    "pendingClarification": 2,
    "closed": 5,
    "recentReports": [
      {
        "id": "uuid",
        "referenceNumber": "string",
        "studentName": "string",
        "incidentDate": "date",
        "status": "SUBMITTED"
      }
    ]
  }
}
```

#### GET `/api/dashboard/principal`
**Description**: Get principal dashboard data
**Access**: Principal only
**Response**:
```json
{
  "success": true,
  "data": {
    "totalCases": 150,
    "pendingReview": 12,
    "inProgress": 25,
    "followUpsDue": 8,
    "closed": 105,
    "recentCases": [...],
    "pendingApprovals": 3
  }
}
```

#### GET `/api/dashboard/counsellor`
**Description**: Get counsellor dashboard data
**Access**: Counsellor only
**Response**:
```json
{
  "success": true,
  "data": {
    "assignedCases": 15,
    "pendingInterventions": 5,
    "followUpsDue": 3,
    "recentCases": [...]
  }
}
```

---

### 2.10 Export Endpoints

#### POST `/api/export/cases`
**Description**: Export cases to CSV
**Access**: Principal, Admin
**Request Body**:
```json
{
  "filters": {
    "status": ["SUBMITTED", "CLOSED"],
    "incidentDateFrom": "date",
    "incidentDateTo": "date",
    "category": ["string"]
  },
  "fields": ["referenceNumber", "studentId", "studentName", "incidentDate", "category", "status"]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "exportId": "uuid",
    "downloadUrl": "/api/export/download/:exportId",
    "recordCount": 150
  }
}
```

#### GET `/api/export/download/:exportId`
**Description**: Download exported CSV file
**Access**: User who created the export, Principal, Admin
**Response**: CSV file with appropriate headers

#### GET `/api/export/history`
**Description**: Get export history
**Access**: Principal, Admin
**Response**: Array of export log objects

---

### 2.11 Configuration Endpoints

#### GET `/api/configuration`
**Description**: Get system configuration
**Access**: Principal, Admin
**Query Params**: `category`
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "key": "INCIDENT_CATEGORIES",
      "value": ["Academic Misconduct", "Behavioral Issue"],
      "category": "INCIDENT",
      "description": "Available incident categories"
    }
  ]
}
```

#### PATCH `/api/configuration/:key`
**Description**: Update configuration value
**Access**: Principal, Admin
**Request Body**:
```json
{
  "value": ["new value"]
}
```
**Response**: Updated configuration object

---

### 2.12 Audit Log Endpoints

#### GET `/api/audit-log`
**Description**: Get audit log entries
**Access**: Principal, Admin
**Query Params**: `actorId`, `action`, `targetType`, `targetId`, `from`, `to`, `page`, `limit`
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "actor": {
        "id": "uuid",
        "name": "string"
      },
      "action": "CASE_CREATED",
      "targetType": "CASE",
      "targetId": "uuid",
      "timestamp": "datetime",
      "metadata": {...}
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 50
  }
}
```

---

## 3. Middleware and Interceptors

### 3.1 Authentication Middleware
- Validates session token on all protected routes
- Attaches user object to request context
- Redirects to login if invalid or missing

### 3.2 Authorization Middleware
- Checks user role against required permissions
- Implements field-level access control for sensitive data
- Returns 403 Forbidden if unauthorized

### 3.3 Audit Middleware
- Logs all write operations (POST, PATCH, DELETE)
- Logs sensitive read operations (confidential notes access)
- Captures IP address and user agent

### 3.4 Validation Middleware
- Validates request bodies against Zod schemas
- Returns 400 Bad Request with validation errors
- Sanitizes input to prevent injection attacks

### 3.5 Error Handling Middleware
- Catches and logs errors
- Returns appropriate HTTP status codes
- Avoids exposing sensitive information in error messages

---

## 4. WebSocket Events (Optional Future Enhancement)

If real-time notifications are implemented:

| Event | Description | Access |
|-------|-------------|--------|
| `case:assigned` | Case assigned to user | Assigned user |
| `case:status_changed` | Case status changed | Principal, Reporter, Counsellor (if assigned) |
| `clarification:requested` | Clarification requested | Reporter |
| `follow_up:due` | Follow-up due soon | Assigned user |
| `follow_up:overdue` | Follow-up overdue | Assigned user, Principal |

---

## 5. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST `/api/auth/login` | 5 requests | 15 minutes |
| POST `/api/cases` | 20 requests | 1 hour |
| POST `/api/export/cases` | 10 requests | 1 hour |
| All other endpoints | 100 requests | 1 hour |

---

## 6. Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }  // Optional for paginated endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [ ... ]  // Optional validation errors
  }
}
```

### HTTP Status Codes
- 200 OK - Successful GET, PATCH
- 201 Created - Successful POST
- 204 No Content - Successful DELETE
- 400 Bad Request - Validation error
- 401 Unauthorized - Not authenticated
- 403 Forbidden - Authenticated but not authorized
- 404 Not Found - Resource not found
- 409 Conflict - Duplicate or conflict
- 422 Unprocessable Entity - Business logic error
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Server error
