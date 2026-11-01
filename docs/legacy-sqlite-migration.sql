-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "staffIdentifier" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "accountStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    CONSTRAINT "User_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classGrade" TEXT NOT NULL,
    "activeStatus" BOOLEAN NOT NULL DEFAULT true,
    "contactInfo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "incidentDate" DATETIME NOT NULL,
    "incidentTime" DATETIME,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "witnesses" TEXT,
    "immediateSafetyConcern" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "closedBy" TEXT,
    "reopenedAt" DATETIME,
    "reopenedBy" TEXT,
    "reopenReason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "assignedAt" DATETIME,
    CONSTRAINT "Case_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    "clarificationRequest" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseReview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisciplinaryAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "responsibleUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DisciplinaryAction_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DisciplinaryAction_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "counsellorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "notes" TEXT NOT NULL,
    "confidentialityLevel" TEXT NOT NULL DEFAULT 'STANDARD',
    "outcome" TEXT,
    "nextStep" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Intervention_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Intervention_counsellorId_fkey" FOREIGN KEY ("counsellorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfidentialNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interventionId" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "ConfidentialNote_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "assignedUserId" TEXT NOT NULL,
    "completionDate" DATETIME,
    "result" TEXT,
    "nextStep" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FollowUp_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FollowUp_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExportLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filters" JSONB NOT NULL,
    "fields" JSONB NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "filePath" TEXT,
    CONSTRAINT "ExportLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_staffIdentifier_key" ON "User"("staffIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_staffIdentifier_idx" ON "User"("staffIdentifier");

-- CreateIndex
CREATE INDEX "User_role_accountStatus_idx" ON "User"("role", "accountStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- CreateIndex
CREATE INDEX "Student_studentId_idx" ON "Student"("studentId");

-- CreateIndex
CREATE INDEX "Student_classGrade_idx" ON "Student"("classGrade");

-- CreateIndex
CREATE INDEX "Student_activeStatus_idx" ON "Student"("activeStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Case_referenceNumber_key" ON "Case"("referenceNumber");

-- CreateIndex
CREATE INDEX "Case_referenceNumber_idx" ON "Case"("referenceNumber");

-- CreateIndex
CREATE INDEX "Case_studentId_idx" ON "Case"("studentId");

-- CreateIndex
CREATE INDEX "Case_reporterId_idx" ON "Case"("reporterId");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- CreateIndex
CREATE INDEX "Case_incidentDate_idx" ON "Case"("incidentDate");

-- CreateIndex
CREATE INDEX "Case_submittedAt_idx" ON "Case"("submittedAt");

-- CreateIndex
CREATE INDEX "Case_assignedToId_idx" ON "Case"("assignedToId");

-- CreateIndex
CREATE INDEX "CaseReview_caseId_idx" ON "CaseReview"("caseId");

-- CreateIndex
CREATE INDEX "CaseReview_reviewerId_idx" ON "CaseReview"("reviewerId");

-- CreateIndex
CREATE INDEX "CaseReview_reviewDate_idx" ON "CaseReview"("reviewDate");

-- CreateIndex
CREATE INDEX "DisciplinaryAction_caseId_idx" ON "DisciplinaryAction"("caseId");

-- CreateIndex
CREATE INDEX "DisciplinaryAction_responsibleUserId_idx" ON "DisciplinaryAction"("responsibleUserId");

-- CreateIndex
CREATE INDEX "DisciplinaryAction_status_idx" ON "DisciplinaryAction"("status");

-- CreateIndex
CREATE INDEX "Intervention_caseId_idx" ON "Intervention"("caseId");

-- CreateIndex
CREATE INDEX "Intervention_counsellorId_idx" ON "Intervention"("counsellorId");

-- CreateIndex
CREATE INDEX "Intervention_date_idx" ON "Intervention"("date");

-- CreateIndex
CREATE INDEX "Intervention_confidentialityLevel_idx" ON "Intervention"("confidentialityLevel");

-- CreateIndex
CREATE INDEX "ConfidentialNote_interventionId_idx" ON "ConfidentialNote"("interventionId");

-- CreateIndex
CREATE INDEX "FollowUp_caseId_idx" ON "FollowUp"("caseId");

-- CreateIndex
CREATE INDEX "FollowUp_assignedUserId_idx" ON "FollowUp"("assignedUserId");

-- CreateIndex
CREATE INDEX "FollowUp_dueDate_idx" ON "FollowUp"("dueDate");

-- CreateIndex
CREATE INDEX "FollowUp_status_idx" ON "FollowUp"("status");

-- CreateIndex
CREATE INDEX "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");

-- CreateIndex
CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");

-- CreateIndex
CREATE INDEX "AuditEvent_targetType_targetId_idx" ON "AuditEvent"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditEvent_timestamp_idx" ON "AuditEvent"("timestamp");

-- CreateIndex
CREATE INDEX "ExportLog_userId_idx" ON "ExportLog"("userId");

-- CreateIndex
CREATE INDEX "ExportLog_timestamp_idx" ON "ExportLog"("timestamp");

-- CreateIndex
CREATE INDEX "ExportLog_status_idx" ON "ExportLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_key_key" ON "Configuration"("key");

-- CreateIndex
CREATE INDEX "Configuration_key_idx" ON "Configuration"("key");

-- CreateIndex
CREATE INDEX "Configuration_category_idx" ON "Configuration"("category");
