# Disciplinary Incident and Case Management Workflow Implementation

## Overview

This document describes the complete implementation of the disciplinary incident and case management workflow for the School Disciplinary Management System (SDMS). The implementation follows the approved SRS and implements explicit status transitions, role-based permissions, audit logging, and concurrent update prevention.

## Status Transition Flow

```
SUBMITTED → UNDER_REVIEW → CLARIFICATION_REQUIRED → SUBMITTED (resubmit)
SUBMITTED → UNDER_REVIEW → ASSIGNED → ACTION_PENDING → FOLLOW_UP_PENDING → CLOSED
SUBMITTED → UNDER_REVIEW → ACTION_PENDING → CLOSED
SUBMITTED → UNDER_REVIEW → REJECTED
CLOSED → REOPENED → UNDER_REVIEW
```

## Database Schema Changes

### Case Model Enhancements
- **version**: Integer field for optimistic locking (prevents concurrent update conflicts)
- **assignedToId**: Foreign key to User for case assignment
- **assignedAt**: Timestamp when case was assigned
- **assignedTo**: Relation to User model

### FollowUp Model Enhancements
- **completedBy**: Foreign key to User who completed the follow-up
- **completionDate**: Renamed from completedAt for consistency

## Backend Implementation

### CaseWorkflowService (`lib/workflow/case-workflow.ts`)

Provides validated case status transitions and workflow operations:

#### Methods
- **transitionStatus()**: Transitions case status with validation and optimistic locking
- **assignCase()**: Assigns case to staff member with rationale
- **requestClarification()**: Requests clarification from reporter
- **respondToClarification()**: Allows teacher to respond to clarification
- **recordDecision()**: Records principal decision with rationale and optional assignment
- **validateTransition()**: Validates if a transition is allowed
- **getAllowedTransitions()**: Returns allowed next statuses for a case

#### Features
- **Optimistic Locking**: Uses version field to prevent concurrent updates
- **Role-Based Validation**: Only principals can change status (except teacher resubmit)
- **Audit Logging**: Every workflow event is logged with actor, timestamp, and metadata
- **Status-Specific Fields**: Automatically sets closedAt, closedBy, reopenedAt, reopenedBy

### FollowUpWorkflowService (`lib/workflow/follow-up-workflow.ts`)

Manages follow-up assignment and completion:

#### Methods
- **assignFollowUp()**: Creates and assigns follow-up to staff member
- **completeFollowUp()**: Marks follow-up as completed with result and next steps
- **getOverdueFollowUps()**: Retrieves and updates overdue follow-ups
- **getUpcomingFollowUps()**: Retrieves follow-ups due within 7 days

#### Features
- **Automatic Case Status Update**: Updates case to FOLLOW_UP_PENDING when follow-ups exist
- **Auto-Close Logic**: Closes case when all follow-ups are completed
- **Overdue Detection**: Automatically marks overdue follow-ups

## API Endpoints

### Case Status
- **PATCH /api/cases/[id]/status**: Update case status with version checking
  - Body: `{ status, reason, version }`
  - Uses CaseWorkflowService for validation

### Case Assignment
- **POST /api/cases/[id]/assign**: Assign case to staff member
  - Body: `{ assignedToId, rationale }`
  - Principal only
  - Transitions to ASSIGNED status

### Clarification Workflow
- **POST /api/cases/[id]/clarification**: Request clarification (Principal only)
  - Body: `{ clarificationRequest }`
  - Transitions to CLARIFICATION_REQUIRED
- **PATCH /api/cases/[id]/clarification**: Respond to clarification (Teacher only)
  - Body: `{ clarificationResponse }`
  - Transitions back to SUBMITTED

### Follow-Up Management
- **POST /api/cases/[id]/follow-ups**: Create follow-up with assignment
  - Body: `{ dueDate, assignedUserId, notes }`
  - Transitions case to FOLLOW_UP_PENDING
- **POST /api/follow-ups/[id]/complete**: Mark follow-up as completed
  - Body: `{ result, nextStep }`
  - May auto-close case if all follow-ups complete

## Frontend Implementation

### Case Details Page (`app/cases/[id]/page.tsx`)

Enhanced with workflow actions:

#### Workflow Actions Section
- **Request Clarification** (Principal): Opens form to request clarification
- **Respond to Clarification** (Teacher): Opens form when status is CLARIFICATION_REQUIRED
- **Assign Case** (Principal): Opens form to assign to staff member with rationale

#### Features
- **Dynamic Action Visibility**: Shows only actions permitted for user role and case status
- **In-Place Forms**: Forms expand inline without page navigation
- **Real-Time Updates**: Refreshes case data after workflow actions
- **Assignment Badge**: Shows assigned staff member when case is assigned
- **Enhanced Status Badges**: Includes all workflow statuses (ACTION_PENDING, FOLLOW_UP_PENDING, REJECTED)

### Follow-Up Form (`app/cases/[id]/follow-up/page.tsx`)

Enhanced with staff assignment:

#### New Fields
- **Assign To**: Select staff member (Principal, Counsellor, Teacher)
- **Due Date**: When follow-up is due
- **Status**: Initial status (defaults to PENDING)
- **Notes**: Description of follow-up activity

#### Features
- **Staff Selection**: Dropdown with active staff members
- **Role Filtering**: Shows appropriate staff for follow-up assignment
- **API Integration**: Uses FollowUpWorkflowService for assignment

## Role-Based Workflows

### Teacher Workflow
1. **Search Student**: Use student search with approved identifier (studentId)
2. **Submit Incident**: Create case with required fields (date, category, description)
3. **Receive Reference**: Get unique case reference number (e.g., CASE-2024-001)
4. **View Status**: Track case status through dashboard and case details
5. **Respond to Clarification**: Provide additional information when requested
6. **View Updates**: See permitted updates after review or action

### Principal Workflow
1. **View New Cases**: Dashboard shows submitted cases awaiting review
2. **Review Details**: Access full case information and history
3. **Request Clarification**: Ask for more information if needed
4. **Assign Case**: Delegate to counsellor or other staff with rationale
5. **Record Decision**: Document decision rationale and responsible staff
6. **Approve Actions**: Authorize disciplinary measures
7. **Monitor Progress**: Track interventions and follow-ups
8. **Close/Reopen**: Close resolved cases or reopen with reason

### Counsellor Workflow
1. **View Assigned Cases**: Dashboard shows cases assigned by principal
2. **Record Interventions**: Document counselling sessions and plans
3. **Assign Follow-ups**: Schedule follow-up dates and responsible staff
4. **Track Progress**: Record outcomes and next steps
5. **Complete Follow-ups**: Mark as completed with results
6. **Identify Support**: Flag cases needing additional support

## Security Features

### Confidentiality
- **Confidential Notes**: Counselling notes have separate permissions
- **Role-Based Access**: Only principals and creating counsellor can view confidential notes
- **Audit Trail**: All access to sensitive data is logged

### Authorization
- **Role Permissions**: Enforced at API level using middleware
- **Status Validation**: Workflow service validates all transitions
- **Assignment Restrictions**: Only principals can assign cases
- **Clarification Control**: Only principals can request, only teachers can respond

### Audit Logging
Every important event records:
- **Acting User**: User ID who performed the action
- **Timestamp**: When the action occurred
- **Affected Case**: Case ID and reference number
- **Change Details**: Before/after status, rationale, assigned staff
- **Event Type**: CASE_STATUS_TRANSITION, CASE_ASSIGNED, CLARIFICATION_REQUESTED, etc.

## Concurrent Update Prevention

### Optimistic Locking
- **Version Field**: Each case has a version number incremented on update
- **Version Check**: API requires current version for updates
- **Conflict Detection**: Returns error if version mismatch occurs
- **User Feedback**: Frontend displays "modified by another user" message

### Example Flow
1. User A loads case (version 5)
2. User B loads case (version 5)
3. User B updates case (version becomes 6)
4. User A attempts update with version 5
5. System rejects update with conflict error
6. User A must refresh and reload latest data

## Test Data

### Seed Script (`prisma/seed-workflow-demo.ts`)

Creates demonstration data for testing:

#### Users
- Principal: principal@school.edu / password123
- Teacher: teacher@school.edu / password123
- Counsellor: counsellor@school.edu / password123

#### Cases
- **CASE-2024-001**: Submitted (awaiting review)
- **CASE-2024-002**: Under Review
- **CASE-2024-003**: Clarification Required (with request)
- **CASE-2024-004**: Assigned to Counsellor
- **CASE-2024-005**: Action Pending (with disciplinary action)
- **CASE-2024-006**: Follow-up Pending (with intervention)
- **CASE-2024-007**: Closed (resolved)

#### Students
- STU001: Alex Thompson (10A)
- STU002: Jordan Martinez (10B)
- STU003: Taylor Kim (11A)

## Testing

### Integration Tests (`tests/integration/case-workflow.test.ts`)

Comprehensive test coverage:

#### Status Transition Tests
- Valid transitions (SUBMITTED → UNDER_REVIEW, etc.)
- Invalid transitions (direct to CLOSED, etc.)
- Unauthorized role attempts
- Optimistic locking (version mismatch)
- Status-specific fields (closedAt, reopenedAt)

#### Assignment Tests
- Successful assignment
- Assignment to inactive user (rejected)
- Assignment of closed case (rejected)

#### Clarification Tests
- Request clarification
- Respond to clarification
- Clarification for closed case (rejected)

#### Decision Recording Tests
- Record with rationale
- Decision with assignment
- Decision to close

#### Audit Logging Tests
- Status transition events logged
- Assignment events logged
- Clarification events logged

## Important Principles Implemented

### No Automatic Guilt
- **Allegation ≠ Finding**: Reported incidents are not automatically established findings
- **Decision Required**: Principal must review and decide on each case
- **Rationale Recording**: All decisions must include reasoning
- **No Auto-Punishment**: System does not automatically determine sanctions

### Account vs Case Approval
- **Separate Workflows**: Account approval (staff access) separate from case approval (incident review)
- **Independent Status**: User account status doesn't affect case workflow
- **Role-Based**: Case decisions based on role, not account status

### Confidentiality Protection
- **Separate Permissions**: Confidential notes have dedicated permission checks
- **Counsellor Control**: Only counsellors can create and view their own confidential notes
- **Principal Override**: Principals can view all confidential notes for oversight
- **Audit Trail**: Access to confidential notes is logged

## Running the Application

### Development Server
```bash
npm run dev
```
Access at http://localhost:3000

### Seed Test Data
```bash
npx tsx prisma/seed-workflow-demo.ts
```
(Note: Requires database to be running)

### Run Tests
```bash
npm test
```

## Future Enhancements

### Potential Additions
- Email notifications for case assignments and follow-up due dates
- Dashboard alerts for overdue follow-ups
- Export functionality for case reports
- Advanced filtering and search on case lists
- Mobile app for teachers to submit incidents on-the-go
- Integration with student information system
- Document attachments for evidence
- Parent portal for viewing case status (with appropriate permissions)

### Performance Considerations
- Database indexes on frequently queried fields
- Caching for dashboard statistics
- Pagination for large case lists
- Optimized queries for case history

## Conclusion

The complete disciplinary incident and case management workflow has been implemented with:
- ✅ Explicit status transitions with validation
- ✅ Role-based permissions and authorization
- ✅ Clarification request/response workflow
- ✅ Case assignment with rationale recording
- ✅ Follow-up assignment and tracking
- ✅ Optimistic locking for concurrent updates
- ✅ Comprehensive audit logging
- ✅ Frontend integration with workflow actions
- ✅ Test data and integration tests
- ✅ Confidentiality protection for sensitive notes

The implementation follows the approved SRS and ensures that allegations are not automatically treated as findings, that account approval is separate from case approval, and that decisions are recorded with proper rationale without assuming guilt or automatically determining sanctions.
