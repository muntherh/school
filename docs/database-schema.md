# Database Schema and Entity Relationships

## 1. Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     User       │       │     Student     │       │     Case        │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ name            │       │ studentId (U)    │◄──────│ studentId (FK)  │
│ staffIdentifier │       │ name            │       │ reporterId (FK) │
│ email           │       │ classGrade      │       │ incidentDate    │
│ passwordHash    │       │ activeStatus    │       │ category        │
│ role            │       │ contactInfo      │       │ description     │
│ accountStatus   │       │ createdAt       │       │ location        │
│ createdAt       │       │ updatedAt       │       │ status          │
│ updatedAt       │       └─────────────────┘       │ referenceNumber │
│ approvedAt      │                                  │ submittedAt     │
│ approvedBy (FK) │                                  │ updatedAt       │
└─────────────────┘                                  └─────────────────┘
       │                                                    │
       │                                                    │
       │                                                    │
       │              ┌─────────────────┐                   │
       │              │  CaseReview     │                   │
       │              ├─────────────────┤                   │
       └──────────────│ id (PK)         │◄──────────────────┘
                      │ caseId (FK)     │
                      │ reviewerId (FK) │
                      │ reviewDate      │
                      │ result          │
                      │ clarificationReq│
                      │ notes           │
                      │ createdAt       │
                      └─────────────────┘
                             │
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
       │                     │                     │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│DisciplinaryAction│  │  Intervention   │  │    Follow-up    │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ caseId (FK)     │  │ caseId (FK)     │  │ caseId (FK)     │
│ actionType      │  │ counsellorId(FK)│  │ dueDate         │
│ rationale       │  │ type            │  │ assignedUserId  │
│ startDate       │  │ date            │  │ completionDate  │
│ endDate         │  │ notes           │  │ result          │
│ responsibleUser │  │ confidentiality  │  │ nextStep        │
│ status          │  │ outcome         │  │ status          │
│ createdAt       │  │ createdAt       │  │ createdAt       │
│ updatedAt       │  │ updatedAt       │  │ updatedAt       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
       │                     │                     │
       │                     │                     │
       └─────────────────────┴─────────────────────┘
                             │
                             │
┌────────────────────────────┴────────────────────────────┐
│                    AuditEvent                            │
├──────────────────────────────────────────────────────────┤
│ id (PK)                                                  │
│ actorId (FK)                                            │
│ action                                                  │
│ targetType                                              │
│ targetId                                                │
│ timestamp                                               │
│ metadata (JSONB)                                        │
│ ipAddress                                               │
│ userAgent                                               │
└──────────────────────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────┴────────────────────────────┐
│                    ExportLog                             │
├──────────────────────────────────────────────────────────┤
│ id (PK)                                                  │
│ userId (FK)                                             │
│ timestamp                                               │
│ filters (JSONB)                                         │
│ fields (JSONB)                                          │
│ recordCount                                             │
│ status                                                  │
│ filePath                                                │
└──────────────────────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────┴────────────────────────────┐
│                    Configuration                         │
├──────────────────────────────────────────────────────────┤
│ id (PK)                                                  │
│ key (U)                                                  │
│ value (JSONB)                                           │
│ category                                                │
│ description                                             │
│ updatedAt                                               │
└──────────────────────────────────────────────────────────┘
```

## 2. Detailed Table Definitions

### 2.1 User
Stores staff account information and authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Full name of staff member |
| staffIdentifier | VARCHAR(50) | UNIQUE, NOT NULL | Staff ID/employee number |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address (used as username) |
| passwordHash | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| role | ENUM | NOT NULL | TEACHER, PRINCIPAL, COUNSELLOR, ADMIN |
| accountStatus | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, ACTIVE, DEACTIVATED, REJECTED |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| approvedAt | TIMESTAMP | NULLABLE | Account approval timestamp |
| approvedBy | UUID | FK → User.id | Who approved this account |

**Indexes:**
- `idx_user_email` on email
- `idx_user_staffIdentifier` on staffIdentifier
- `idx_user_role_status` on role, accountStatus

### 2.2 Student
Stores student information for incident reporting.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| studentId | VARCHAR(50) | UNIQUE, NOT NULL | Official student identifier |
| name | VARCHAR(255) | NOT NULL | Student name |
| classGrade | VARCHAR(50) | NOT NULL | Class/grade (e.g., "10A", "Grade 9") |
| activeStatus | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether student is currently enrolled |
| contactInfo | VARCHAR(500) | NULLABLE | Minimum approved contact information |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_student_studentId` on studentId
- `idx_student_classGrade` on classGrade
- `idx_student_active` on activeStatus

### 2.3 Case (Incident)
Stores incident reports and case information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| referenceNumber | VARCHAR(20) | UNIQUE, NOT NULL | Human-readable case reference (e.g., INC-2024-0001) |
| studentId | UUID | FK → Student.id, NOT NULL | Associated student |
| reporterId | UUID | FK → User.id, NOT NULL | Who submitted the incident |
| incidentDate | DATE | NOT NULL | Date the incident occurred |
| incidentTime | TIME | NULLABLE | Time the incident occurred |
| category | VARCHAR(100) | NOT NULL | Incident category (from configuration) |
| description | TEXT | NOT NULL | Detailed description |
| location | VARCHAR(255) | NULLABLE | Location of incident |
| witnesses | TEXT | NULLABLE | Witness information |
| immediateSafetyConcern | BOOLEAN | DEFAULT FALSE | Flag for immediate safety issues |
| status | ENUM | NOT NULL, DEFAULT 'SUBMITTED' | DRAFT, SUBMITTED, UNDER_REVIEW, CLARIFICATION_REQUIRED, ASSIGNED, ACTION_PENDING, FOLLOW_UP_PENDING, CLOSED, REOPENED, REJECTED |
| submittedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Submission timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| closedAt | TIMESTAMP | NULLABLE | Case closure timestamp |
| closedBy | UUID | FK → User.id | Who closed the case |
| reopenedAt | TIMESTAMP | NULLABLE | Case reopening timestamp |
| reopenedBy | UUID | FK → User.id | Who reopened the case |
| reopenReason | TEXT | NULLABLE | Reason for reopening |

**Indexes:**
- `idx_case_referenceNumber` on referenceNumber
- `idx_case_studentId` on studentId
- `idx_case_reporterId` on reporterId
- `idx_case_status` on status
- `idx_case_incidentDate` on incidentDate
- `idx_case_submittedAt` on submittedAt

### 2.4 CaseReview
Stores principal review records and clarification requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| caseId | UUID | FK → Case.id, NOT NULL | Associated case |
| reviewerId | UUID | FK → User.id, NOT NULL | Who performed the review |
| reviewDate | TIMESTAMP | NOT NULL, DEFAULT NOW() | Review timestamp |
| result | VARCHAR(50) | NOT NULL | Review outcome (e.g., APPROVED, RETURNED, ASSIGNED) |
| clarificationRequest | TEXT | NULLABLE | Request for additional information |
| notes | TEXT | NULLABLE | Review notes |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_caseReview_caseId` on caseId
- `idx_caseReview_reviewerId` on reviewerId
- `idx_caseReview_reviewDate` on reviewDate

### 2.5 DisciplinaryAction
Stores disciplinary actions taken on a case.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| caseId | UUID | FK → Case.id, NOT NULL | Associated case |
| actionType | VARCHAR(100) | NOT NULL | Type of action (from configuration) |
| rationale | TEXT | NOT NULL | Reason for the action |
| startDate | DATE | NULLABLE | Action start date |
| endDate | DATE | NULLABLE | Action end date (if applicable) |
| responsibleUserId | UUID | FK → User.id, NOT NULL | Person responsible for implementation |
| status | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, IN_PROGRESS, COMPLETED, CANCELLED |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_disciplinaryAction_caseId` on caseId
- `idx_disciplinaryAction_responsibleUserId` on responsibleUserId
- `idx_disciplinaryAction_status` on status

### 2.6 Intervention
Stores counselling and intervention records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| caseId | UUID | FK → Case.id, NOT NULL | Associated case |
| counsellorId | UUID | FK → User.id, NOT NULL | Counsellor who performed intervention |
| type | VARCHAR(100) | NOT NULL | Intervention type (from configuration) |
| date | DATE | NOT NULL | Intervention date |
| notes | TEXT | NOT NULL | Intervention notes |
| confidentialityLevel | ENUM | NOT NULL, DEFAULT 'STANDARD' | STANDARD, CONFIDENTIAL, RESTRICTED |
| outcome | TEXT | NULLABLE | Outcome or progress assessment |
| nextStep | TEXT | NULLABLE | Planned next steps |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_intervention_caseId` on caseId
- `idx_intervention_counsellorId` on counsellorId
- `idx_intervention_date` on date
- `idx_intervention_confidentiality` on confidentialityLevel

### 2.7 ConfidentialNote
Separate table for highly sensitive counselling notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| interventionId | UUID | FK → Intervention.id, NOT NULL | Associated intervention |
| notes | TEXT | NOT NULL | Confidential notes content |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| createdBy | UUID | FK → User.id, NOT NULL | Who created the note |

**Indexes:**
- `idx_confidentialNote_interventionId` on interventionId

### 2.8 FollowUp
Stores follow-up tasks and their completion status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| caseId | UUID | FK → Case.id, NOT NULL | Associated case |
| dueDate | DATE | NOT NULL | Follow-up due date |
| assignedUserId | UUID | FK → User.id, NOT NULL | Person responsible for follow-up |
| completionDate | DATE | NULLABLE | Actual completion date |
| result | TEXT | NULLABLE | Follow-up result |
| nextStep | TEXT | NULLABLE | Next steps after completion |
| status | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, OVERDUE, COMPLETED, CANCELLED |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_followUp_caseId` on caseId
- `idx_followUp_assignedUserId` on assignedUserId
- `idx_followUp_dueDate` on dueDate
- `idx_followUp_status` on status

### 2.9 AuditEvent
Stores audit trail of significant system actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| actorId | UUID | FK → User.id, NOT NULL | Who performed the action |
| action | VARCHAR(100) | NOT NULL | Action type (e.g., CASE_CREATED, STATUS_CHANGED, EXPORT_PERFORMED) |
| targetType | VARCHAR(50) | NOT NULL | Type of target entity (e.g., CASE, USER, INTERVENTION) |
| targetId | UUID | NULLABLE | ID of target entity |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | When the action occurred |
| metadata | JSONB | NULLABLE | Additional context (changes, filters, etc.) |
| ipAddress | VARCHAR(45) | NULLABLE | IP address of actor |
| userAgent | VARCHAR(500) | NULLABLE | Browser/client information |

**Indexes:**
- `idx_auditEvent_actorId` on actorId
- `idx_auditEvent_action` on action
- `idx_auditEvent_target` on targetType, targetId
- `idx_auditEvent_timestamp` on timestamp

### 2.10 ExportLog
Stores records of CSV export activities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| userId | UUID | FK → User.id, NOT NULL | Who performed the export |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | When export was performed |
| filters | JSONB | NOT NULL | Applied filters (date range, status, etc.) |
| fields | JSONB | NOT NULL | Fields included in export |
| recordCount | INTEGER | NOT NULL | Number of records exported |
| status | VARCHAR(50) | NOT NULL | SUCCESS, FAILED, PARTIAL |
| filePath | VARCHAR(500) | NULLABLE | Path to exported file (if stored) |

**Indexes:**
- `idx_exportLog_userId` on userId
- `idx_exportLog_timestamp` on timestamp
- `idx_exportLog_status` on status

### 2.11 Configuration
Stores system configuration values (categories, action types, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Configuration key |
| value | JSONB | NOT NULL | Configuration value |
| category | VARCHAR(50) | NOT NULL | Category (e.g., INCIDENT_CATEGORY, ACTION_TYPE) |
| description | TEXT | NULLABLE | Description of the configuration |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_configuration_key` on key
- `idx_configuration_category` on category

**Example Configuration Values:**
- `INCIDENT_CATEGORIES`: ["Academic Misconduct", "Behavioral Issue", "Attendance", "Bullying", "Other"]
- `ACTION_TYPES`: ["Warning", "Detention", "Suspension", "Counselling", "Restorative Activity", "Parent Meeting"]
- `INTERVENTION_TYPES`: ["Individual Counselling", "Group Session", "Peer Mediation", "Referral to External Services"]

## 3. Relationships Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Case | One-to-Many | A user can report multiple cases |
| Student → Case | One-to-Many | A student can have multiple cases |
| Case → CaseReview | One-to-Many | A case can have multiple reviews |
| Case → DisciplinaryAction | One-to-Many | A case can have multiple actions |
| Case → Intervention | One-to-Many | A case can have multiple interventions |
| Intervention → ConfidentialNote | One-to-Many | An intervention can have multiple confidential notes |
| Case → FollowUp | One-to-Many | A case can have multiple follow-ups |
| User → CaseReview | One-to-Many | A user can perform multiple reviews |
| User → DisciplinaryAction | One-to-Many | A user can be responsible for multiple actions |
| User → Intervention | One-to-Many | A counsellor can perform multiple interventions |
| User → FollowUp | One-to-Many | A user can be assigned multiple follow-ups |
| User → AuditEvent | One-to-Many | A user can perform many audited actions |
| User → ExportLog | One-to-Many | A user can perform multiple exports |
| User → User (approvedBy) | Self-reference | A user can approve another user's account |

## 4. Data Integrity Constraints

### 4.1 Foreign Key Constraints
- All foreign keys have ON DELETE RESTRICT to prevent accidental deletion of referenced records
- Case deletion should be soft delete (add deletedAt column) if deletion is ever needed

### 4.2 Check Constraints
- `endDate` must be >= `startDate` where both are present
- `completionDate` must be >= `dueDate` where both are present
- `closedAt` must be >= `submittedAt` where both are present

### 4.3 Trigger Requirements
- Update `updatedAt` timestamp on all tables before update
- Update case status based on related entity changes (e.g., when all follow-ups are completed)
- Create audit event entries for significant actions

## 5. Prisma Schema Preview

```prisma
enum Role {
  TEACHER
  PRINCIPAL
  COUNSELLOR
  ADMIN
}

enum AccountStatus {
  PENDING
  ACTIVE
  DEACTIVATED
  REJECTED
}

enum CaseStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  CLARIFICATION_REQUIRED
  ASSIGNED
  ACTION_PENDING
  FOLLOW_UP_PENDING
  CLOSED
  REOPENED
  REJECTED
}

model User {
  id               String        @id @default(uuid())
  name             String
  staffIdentifier  String        @unique
  email            String        @unique
  passwordHash     String
  role             Role
  accountStatus    AccountStatus @default(PENDING)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  approvedAt       DateTime?
  approvedBy       String?
  
  // Relations
  reportedCases    Case[]       @relation("Reporter")
  reviews          CaseReview[]
  actions          DisciplinaryAction[]
  interventions    Intervention[]
  assignedFollowUps FollowUp[]   @relation("AssignedTo")
  auditEvents      AuditEvent[]
  exports          ExportLog[]
  approvedUsers    User[]        @relation("Approver")
  approver         User?         @relation("Approver")
  
  @@index([email])
  @@index([staffIdentifier])
  @@index([role, accountStatus])
}

model Student {
  id            String   @id @default(uuid())
  studentId     String   @unique
  name          String
  classGrade    String
  activeStatus  Boolean  @default(true)
  contactInfo   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  cases         Case[]
  
  @@index([studentId])
  @@index([classGrade])
  @@index([activeStatus])
}

model Case {
  id                    String        @id @default(uuid())
  referenceNumber       String        @unique
  studentId             String
  reporterId            String
  incidentDate          DateTime
  incidentTime          DateTime?
  category              String
  description           String        @db.Text
  location              String?
  witnesses             String?       @db.Text
  immediateSafetyConcern Boolean       @default(false)
  status                CaseStatus    @default(SUBMITTED)
  submittedAt           DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  closedAt              DateTime?
  closedBy              String?
  reopenedAt            DateTime?
  reopenedBy            String?
  reopenReason          String?       @db.Text
  
  // Relations
  student               Student       @relation(fields: [studentId], references: [id])
  reporter              User          @relation("Reporter", fields: [reporterId], references: [id])
  reviews               CaseReview[]
  actions               DisciplinaryAction[]
  interventions          Intervention[]
  followUps             FollowUp[]
  
  @@index([referenceNumber])
  @@index([studentId])
  @@index([reporterId])
  @@index([status])
  @@index([incidentDate])
  @@index([submittedAt])
}

model CaseReview {
  id                   String   @id @default(uuid())
  caseId              String
  reviewerId           String
  reviewDate           DateTime @default(now())
  result               String
  clarificationRequest String?  @db.Text
  notes                String?  @db.Text
  createdAt            DateTime @default(now())
  
  // Relations
  case                 Case     @relation(fields: [caseId], references: [id])
  reviewer             User     @relation(fields: [reviewerId], references: [id])
  
  @@index([caseId])
  @@index([reviewerId])
  @@index([reviewDate])
}

model DisciplinaryAction {
  id                String   @id @default(uuid())
  caseId            String
  actionType        String
  rationale         String   @db.Text
  startDate         DateTime?
  endDate           DateTime?
  responsibleUserId String
  status            String   @default("PENDING")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  case              Case     @relation(fields: [caseId], references: [id])
  responsibleUser   User     @relation(fields: [responsibleUserId], references: [id])
  
  @@index([caseId])
  @@index([responsibleUserId])
  @@index([status])
}

model Intervention {
  id                  String   @id @default(uuid())
  caseId              String
  counsellorId        String
  type                String
  date                DateTime
  notes               String   @db.Text
  confidentialityLevel String   @default("STANDARD")
  outcome             String?  @db.Text
  nextStep            String?  @db.Text
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  // Relations
  case                Case     @relation(fields: [caseId], references: [id])
  counsellor          User     @relation(fields: [counsellorId], references: [id])
  confidentialNotes   ConfidentialNote[]
  
  @@index([caseId])
  @@index([counsellorId])
  @@index([date])
  @@index([confidentialityLevel])
}

model ConfidentialNote {
  id             String   @id @default(uuid())
  interventionId  String
  notes          String   @db.Text
  createdAt      DateTime @default(now())
  createdBy      String
  
  // Relations
  intervention    Intervention @relation(fields: [interventionId], references: [id])
  
  @@index([interventionId])
}

model FollowUp {
  id              String   @id @default(uuid())
  caseId          String
  dueDate         DateTime
  assignedUserId  String
  completionDate  DateTime?
  result          String?  @db.Text
  nextStep        String?  @db.Text
  status          String   @default("PENDING")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  case            Case     @relation(fields: [caseId], references: [id])
  assignedUser    User     @relation("AssignedTo", fields: [assignedUserId], references: [id])
  
  @@index([caseId])
  @@index([assignedUserId])
  @@index([dueDate])
  @@index([status])
}

model AuditEvent {
  id         String   @id @default(uuid())
  actorId    String
  action     String
  targetType String
  targetId   String?
  timestamp  DateTime @default(now())
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  
  // Relations
  actor      User     @relation(fields: [actorId], references: [id])
  
  @@index([actorId])
  @@index([action])
  @@index([targetType, targetId])
  @@index([timestamp])
}

model ExportLog {
  id          String   @id @default(uuid())
  userId      String
  timestamp   DateTime @default(now())
  filters     Json
  fields      Json
  recordCount Int
  status      String
  filePath    String?
  
  // Relations
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([timestamp])
  @@index([status])
}

model Configuration {
  id          String   @id @default(uuid())
  key         String   @unique
  value       Json
  category    String
  description String?  @db.Text
  updatedAt   DateTime @updatedAt
  
  @@index([key])
  @@index([category])
}
```
