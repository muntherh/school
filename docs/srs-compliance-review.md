# SRS Compliance Review

Verified on 2 November 2026 against **School_Disciplinary_Management_System_SRS_1.docx** (v1.0) and **School_Disciplinary_Management_System_Prompts_1.docx**.

The two uploaded documents are word-for-word identical to `docs/school-srs-source.txt` and `docs/school-prompts-source.txt` (only list numbering and one space differ), so the repository already tracks the approved sources.

Status key: ✅ implemented and verified · ⚠️ partially implemented (explained) · ⏳ not implemented (Should/Could priority or awaiting a school decision).

"Verified" means the behaviour is exercised by automated tests (`npm test`, `npm run test:e2e`) or by the browser walkthrough recorded in the pull request that introduced this review.

## 4.1 Authentication and Account Management

| ID | Status | Where |
|----|--------|-------|
| FR-AUTH-01 Sign in with approved credentials | ✅ | `app/login`, `POST /api/auth/login`, rate-limited; e2e login test |
| FR-AUTH-02 Unapproved accounts blocked | ✅ | `lib/route-access.ts`, `lib/session.ts`, `/pending-approval`; security tests |
| FR-AUTH-03 Approve, reject, deactivate, reactivate | ✅ | Staff page with confirmation dialogs; actor and timestamp audited |
| FR-AUTH-04 Backend-enforced roles | ✅ | `routeAccess` on every API route; authorization tests |
| FR-AUTH-05 Secure logout and session expiry | ✅ | iron-session HTTP-only cookie, `SESSION_MAX_AGE`; e2e deactivation test |
| FR-AUTH-06 Password reset / identity provider (Should) | ⏳ | Needs a school decision on the identity provider or email service |

## 4.2 Student Records

| ID | Status | Where |
|----|--------|-------|
| FR-STU-01 Search by identifier or permitted fields | ✅ | Student search on the incident form and students page (`query` searches ID or name) |
| FR-STU-02 Every incident linked to a valid student | ✅ | Student picker; server resolves and validates the student |
| FR-STU-03 Authorized case history per student | ✅ | Student record page lists only cases the viewer may access |
| FR-STU-04 Minimal student fields | ⚠️ | ID, name, class, status, one contact field; the school must approve this field list |

## 4.3 Incident Submission and Tracking

| ID | Status | Where |
|----|--------|-------|
| FR-INC-01 Teacher creates a report with a unique reference | ✅ | `app/cases/new` |
| FR-INC-02 Date/time, student, category, description, reporter, timestamp | ✅ | Incident time field added; reporter and submission time set by the server |
| FR-INC-03 Witnesses, location, safety concern, attachments (Should) | ⚠️ | Witnesses, location and immediate safety concern are implemented; attachments need an approved storage location |
| FR-INC-04 Teacher sees own reports and status | ✅ | Teacher dashboard and cases list are scoped to the reporter |
| FR-INC-05 Clarification request and response in history | ✅ | Case page; recorded as audit events in the case history |
| FR-INC-06 Validation and duplicate prevention | ✅ | Same student, category and day returns a warning; a confirmed duplicate is flagged in the case history |
| FR-INC-07 Unique, searchable reference | ✅ | `INC-YYYY-<uuid>`; searchable from the cases list |

## 4.4 Principal Review and Case Management

| ID | Status | Where |
|----|--------|-------|
| FR-CASE-01 Principal sees all cases | ✅ | Cases list and dashboard |
| FR-CASE-02 Review, clarify, assign, approve, close via valid transitions | ✅ | `lib/workflow/case-workflow.ts`; workflow tests; confirmation before close or reject |
| FR-CASE-03 Account approval separate from case approval | ✅ | Separate pages, APIs and audit actions |
| FR-CASE-04 Decision, rationale, responsible person, date | ✅ | Review form; disciplinary action records the responsible staff member and dates |
| FR-CASE-05 Assign to counsellor (Should) | ✅ | Assign from the case page or directly when approving; visible on the counsellor dashboard |
| FR-CASE-06 Chronological history | ✅ | Case history timeline (submission, decisions, interventions, follow-ups, closure) |
| FR-CASE-07 Reopen with reason (Should) | ✅ | Reopen page; audited |

## 4.5 Counselling and Interventions

| ID | Status | Where |
|----|--------|-------|
| FR-INT-01 Counsellor sees permitted cases only | ✅ | Assigned cases only; cross-user access tests |
| FR-INT-02 Date, author, type, notes, next step | ✅ | Intervention form (types come from Settings) |
| FR-INT-03 Follow-up dates, responsible staff, completion | ✅ | Follow-up form and completion; overdue shown on the case page and counsellor dashboard |
| FR-INT-04 Structured outcome (Should) | ✅ | Outcome / progress field; it does not decide any sanction |
| FR-INT-05 Confidential counselling notes | ⚠️ | Confidentiality level per intervention and restricted confidential-note API; confidential-note export stays disabled pending school approval |
| FR-INT-06 Actions with type, rationale, date, responsible staff, duration | ✅ | Action form with responsible staff, start and end date (types come from Settings) |

## 4.6 Dashboards, Search and Notifications

| ID | Status | Where |
|----|--------|-------|
| FR-DASH-01 Role-appropriate dashboard | ✅ | Principal, teacher and counsellor dashboards; data scoped server-side |
| FR-DASH-02 Principal: total, pending reviews, in progress, follow-ups due, closed | ✅ | Plus actions pending, trends by month, category, class and status, and pending staff approvals (Prompt 4) |
| FR-DASH-03 Teacher: reports and statuses | ✅ | Submitted, awaiting review, requiring clarification, processed and closed |
| FR-DASH-04 Counsellor: assigned cases and follow-ups | ✅ | Assigned cases, upcoming and overdue follow-ups, interventions, completion rate |
| FR-DASH-05 Filter by date, status, class, category | ✅ | Cases list filters plus search and sorting; integration tests |
| FR-DASH-06 In-app notifications (Should) | ⏳ | Assignments and clarification requests appear on dashboards; a notification inbox is not built |

## 4.7 CSV Export

| ID | Status | Where |
|----|--------|-------|
| FR-EXP-01 to FR-EXP-07 | ✅ | `app/export`, `services/csv-export.service.ts`: filters, field restrictions, UTF-8, export log, sensitive-data warning, formula-injection protection; CSV tests |

## 4.8 Audit and Administration

| ID | Status | Where |
|----|--------|-------|
| FR-AUD-01 Significant actions logged | ✅ | Sign-ins, account decisions, case changes, decisions, exports |
| FR-AUD-02 Audit records protected | ✅ | No update or delete endpoints for audit events |
| FR-AUD-03 Configurable categories and action types (Should) | ✅ | Settings page; incident, action and intervention forms now read these lists |
| FR-AUD-04 Server-side validation | ✅ | Zod schemas on every write |

## Prompt 4 (frontend) specific checks

| Item | Status |
|------|--------|
| Clean blue-and-white interface, clear status badges, responsive tables | ✅ Navy-blue and white with a restrained gold accent for the school identity |
| Public school homepage with staff login (school details in `lib/school.ts`) | ✅ |
| Shared pages: login, unauthorized, pending approval, profile and logout | ✅ |
| Loading states, empty states, error messages, confirmation dialogs | ✅ |
| Charts and counts from real database queries | ✅ |
| Pagination, sorting and filters on the case table | ✅ |
| No fake controls (the unused "Status" fields on the action and follow-up forms were removed) | ✅ |

## Remaining items that need a school decision

1. Password reset or identity provider (FR-AUTH-06).
2. Attachment storage location and allowed file types (FR-INC-03).
3. In-app notification inbox (FR-DASH-06).
4. Approval of student fields (FR-STU-04) and of confidential-note access and export (FR-INT-05).
5. Display time zone, record retention, archival and deletion policy (SRS 6.2, 6.3).
