# SRS Analysis: School Disciplinary Management System (SDMS)

## 1. Functional Requirements Extraction

### 1.1 Authentication and Account Management (FR-AUTH)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| FR-AUTH-01 | System shall allow staff to sign in using approved credentials | Must | Valid credentials grant access; invalid credentials are rejected with safe message |
| FR-AUTH-02 | System shall prevent unapproved staff accounts from accessing protected functions | Must | Unapproved account cannot open protected pages or call protected APIs |
| FR-AUTH-03 | Principal shall be able to approve, reject, deactivate, or reactivate staff accounts | Must | Each account decision is saved with actor and timestamp |
| FR-AUTH-04 | System shall assign each active user one or more authorized roles | Must | Role-specific permissions are enforced on the backend |
| FR-AUTH-05 | System shall provide secure logout and session expiry | Must | Logged-out or expired session cannot access protected data |
| FR-AUTH-06 | System should support password reset or school-approved identity provider | Should | Recovery flow follows configured security policy |

### 1.2 Student Records (FR-STU)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| FR-STU-01 | Authorized users shall be able to search for a student using approved identifier or permitted fields | Must | Search returns only records the user is permitted to view |
| FR-STU-02 | System shall associate each incident with a unique student record | Must | Incident cannot be submitted without valid student reference, unless approved exception workflow is defined |
| FR-STU-03 | System should allow authorized users to view a student's relevant case history | Should | History is restricted to authorized roles and displays only permitted details |
| FR-STU-04 | Student information shall be limited to fields necessary for stated purpose | Must | Implemented student data fields are approved by the school |

### 1.3 Incident Submission and Tracking (FR-INC)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| FR-INC-01 | Teacher shall be able to create an incident report for a student | Must | Valid report is saved with unique case/incident reference |
| FR-INC-02 | Report shall capture incident date/time, student, category, description, reporting user, and submission timestamp | Must | Required fields are validated before submission |
| FR-INC-03 | Report should support optional witnesses, location, attachments, and immediate safety concerns where approved | Should | Optional fields can be added without blocking otherwise valid submission |
| FR-INC-04 | System shall show teacher the list and current status of their submitted reports | Must | Teacher can view their own reports and permitted summaries |
| FR-INC-05 | System shall allow authorized reviewers to request clarification or additional information | Must | Request and subsequent response are recorded in case history |
| FR-INC-06 | System shall validate required fields and prevent accidental duplicate submissions where feasible | Must | Validation errors are clear; potential duplicates can be flagged for review |
| FR-INC-07 | System shall assign each incident a unique reference number | Must | Reference is unique and searchable |

### 1.4 Principal Review and Case Management (FR-CASE)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| FR-CASE-01 | Principal shall be able to view all disciplinary cases within school scope | Must | Principal's case list includes all cases authorized by school's scope |
| FR-CASE-02 | Principal shall be able to review, return for clarification, assign, approve for action, or close a case as permitted by policy | Must | Only valid status transitions are allowed and are logged |
| FR-CASE-03 | System shall distinguish staff-account approval from incident/case review | Must | Approving a teacher account does not automatically approve any incident |
| FR-CASE-04 | Principal shall be able to record a decision, rationale, responsible person, and decision date | Must | Decision details are stored against the relevant case |
| FR-CASE-05 | Principal should be able to assign a case to a counsellor or other authorized reviewer | Should | Assignee is notified or can see the assignment in their dashboard |
| FR-CASE-06 | System shall maintain a chronological case history | Must | Submissions, status changes, decisions, interventions, and closures appear in history |
| FR-CASE-07 | System shall support reopening a closed case only for authorized users and with a reason | Should | Reopening creates an auditable event and preserves prior history |

### 1.5 Counselling and Interventions (FR-INT)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| FR-INT-01 | Counsellor shall be able to view cases authorized by configured access policy | Must | Unauthorized cases and restricted fields are not exposed |
| FR-INT-02 | Counsellor shall be able to record an intervention or counselling session | Must | Each entry includes date, author, intervention type, notes, and next step where applicable |
| FR-INT-03 | System shall support follow-up dates, responsible staff, and completion status | Must | Overdue and completed follow-ups can be identified |
| FR-INT-04 | System should support recording a structured outcome or progress assessment | Should | Outcome is recorded using school-approved fields and does not automatically determine punishment |
| FR-INT-05 | System shall distinguish general case notes from confidential counselling notes where required | Must | Confidential notes are only accessible to specifically authorized roles |
| FR-INT-06 | System shall allow authorized staff to document actions such as warning, suspension, counselling, restorative activity, or other school-approved measures | Must | Action type, rationale, date, responsible staff, and relevant duration are recorded where applicable |

### 1.6 Dashboards, Search, and Notifications (FR-DASH)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| FR-DASH-01 | System shall display a role-appropriate dashboard after sign-in | Must | Each role sees only permitted metrics and records |
| FR-DASH-02 | Principal dashboard shall summarize total cases, pending reviews, cases in progress, follow-ups due, and closed cases | Must | Counts match the underlying authorized case data |
| FR-DASH-03 | Teacher dashboard shall show submitted reports and their statuses | Must | List matches the teacher's permitted records |
| FR-DASH-04 | Counsellor dashboard shall show assigned or otherwise authorized cases and follow-ups | Must | List matches the configured counsellor access rules |
| FR-DASH-05 | Authorized users shall be able to filter case lists by date, status, class, category, and other approved fields | Must | Filters return matching authorized records |
| FR-DASH-06 | System should provide in-app notifications for assignments, clarification requests, and status changes | Should | Notifications are delivered to the intended authorized user |

### 1.7 CSV Export and Reporting (FR-EXP)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| FR-EXP-01 | Principal or other explicitly authorized users shall be able to export filtered records to CSV | Must | Exported rows and fields match applied filters and permissions |
| FR-EXP-02 | System shall allow export by an approved date range and selected filters | Must | Resulting export respects selected filters |
| FR-EXP-03 | System shall exclude fields the exporting user is not authorized to access | Must | Restricted notes and fields do not appear in exported file |
| FR-EXP-04 | CSV files shall use consistent column headings, date formats, character encoding, and documented values | Must | File opens correctly in common spreadsheet software and preserves supported characters |
| FR-EXP-05 | System shall log export activity, including user, timestamp, filters, and record scope where feasible | Must | Audit entry is created for each successful export |
| FR-EXP-06 | System should warn users before exporting sensitive student information | Should | Clear warning appears before the download |
| FR-EXP-07 | System should mitigate CSV formula injection for untrusted text values | Must | Values beginning with spreadsheet formula characters are safely handled in exports |

### 1.8 Audit and Administration (FR-AUD)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| FR-AUD-01 | System shall log significant actions including sign-in events, account approvals, case status changes, decisions, and exports | Must | Audit records include actor, action, target record, and timestamp where applicable |
| FR-AUD-02 | Ordinary users shall not be able to modify or delete audit records | Must | Audit logs are protected from standard application-user changes |
| FR-AUD-03 | System should support approved configuration of incident categories and action types | Should | Only authorized administrators can change configuration |
| FR-AUD-04 | System shall validate data on the server, even when client-side validation exists | Must | Invalid or unauthorized API requests are rejected |

---

## 2. Non-Functional Requirements (NFR)

### 2.1 Security (NFR-SEC)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-SEC-01 | System shall enforce server-side authorization on every protected operation | Must | Direct API requests cannot bypass UI role restrictions |
| NFR-SEC-02 | Production traffic shall be protected using HTTPS/TLS | Must | HTTP is redirected or otherwise blocked for protected production access |
| NFR-SEC-03 | Passwords shall never be stored in plaintext | Must | Password storage uses suitable password hashing mechanism or approved identity provider |
| NFR-SEC-04 | System shall use secure session handling and appropriate protections against common web attacks | Must | Security testing finds no unresolved critical issue in agreed scope |
| NFR-SEC-05 | System shall protect confidential student and counselling data from unauthorized access | Must | Role and field-level access tests pass |

### 2.2 Privacy (NFR-PRV)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-PRV-01 | System shall collect and expose only data necessary for its approved purpose | Must | Fields and exports are reviewed and approved by the school |

### 2.3 Availability (NFR-AVL)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-AVL-01 | System should target 99.5% monthly availability excluding planned maintenance | Should | Availability is monitored against an agreed service definition |

### 2.4 Performance (NFR-PERF)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-PERF-01 | Common pages and searches should respond within 3 seconds at 95th percentile | Should | Load tests use agreed dataset and concurrent-user profile |
| NFR-PERF-02 | CSV export shall complete within an agreed time for expected report size | Should | Maximum export size and performance target are agreed before acceptance |

### 2.5 Usability (NFR-USE)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-USE-01 | System shall provide understandable status labels and validation messages | Must | Representative users can complete core tasks in usability testing |

### 2.6 Accessibility (NFR-ACC)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-ACC-01 | Interface should follow recognized accessibility practices, targeting WCAG 2.2 AA where feasible | Should | Accessibility review covers key workflows |

### 2.7 Reliability (NFR-REL)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-REL-01 | System shall preserve data integrity when saving related records | Must | Failure tests do not leave inconsistent partial records |

### 2.8 Business Continuity (NFR-BCP)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-BCP-01 | Backups shall be performed on school-approved schedule and restoration shall be tested | Must | Documented backup and restore test is completed before production |

### 2.9 Maintainability (NFR-MNT)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-MNT-01 | Application shall separate configuration from source code and provide maintainable documentation | Should | Deployment, configuration, and support instructions are provided |

### 2.10 Compliance (NFR-COMP)
| ID | Requirement | Priority | Acceptance Criteria |
|-----|-------------|----------|---------------------|
| NFR-COMP-01 | System shall be reviewed against applicable school, Ministry, privacy, and records-management requirements before deployment | Must | School records approval or identifies required remediation |

---

## 3. Business Rules

1. **Account Access**: A user must be authenticated and active before accessing protected functionality.
2. **Account Approval**: A staff account must be approved by the principal before it can access the portal, unless an alternate school-approved onboarding method is selected.
3. **Separation of Approvals**: Account approval and incident approval are separate processes.
4. **Incident Requirements**: Every submitted incident must have a unique reference and an identifiable reporting user.
5. **Status Changes**: Only authorized roles may change case status, record formal decisions, or close/reopen cases.
6. **Audit Trail**: Every significant case change must retain its actor and timestamp; previous history must remain available to authorized reviewers.
7. **Multiple Actions**: A case may contain multiple actions, interventions, and follow-up entries.
8. **Fact vs Decision**: An incident report must not be treated as proof that the reported allegation is established; the system should distinguish reported facts, review findings, and decisions.
9. **Export Permissions**: CSV exports must follow the exporter's permissions and the approved purpose for sharing.
10. **No AI Decisions**: The application must not automatically assign punishment or make high-impact disciplinary decisions using AI or reinforcement learning.

---

## 4. User Roles and Responsibilities

### 4.1 Teacher
- **Responsibilities**: Report incidents and monitor submitted complaints
- **Proposed Access**: 
  - Create incident reports
  - View own reports and permitted status/action summaries
  - Add requested clarifications where allowed

### 4.2 Principal / Super Admin
- **Responsibilities**: Manage staff access and oversee all cases
- **Proposed Access**:
  - Approve or deactivate staff accounts
  - View and manage all cases
  - Assign reviewers
  - Record or approve decisions
  - View audit logs
  - Export authorized reports
  - Configure basic system settings

### 4.3 Counsellor
- **Responsibilities**: Review authorized cases and document student support
- **Proposed Access**:
  - View cases permitted by school policy
  - Add intervention and follow-up records
  - Update assigned intervention status
  - View relevant case history

### 4.4 System Administrator (Optional)
- **Responsibilities**: Maintain application availability and configuration
- **Proposed Access**: Technical administration only. Access to student case content should be limited and audited unless explicitly authorized.

---

## 5. Acceptance Criteria Summary

The initial release will be considered ready when:

1. An unapproved staff account cannot access protected system functions, and the principal can approve or reject it.
2. An approved teacher can submit an incident with required fields and receive a unique reference number.
3. The teacher can view the status of their own submitted reports but cannot view unauthorized cases.
4. The principal can see all cases in scope, review them, request clarification, assign cases, record decisions, and close cases according to the approved workflow.
5. The counsellor can access only authorized cases and record interventions and follow-ups.
6. The system retains a chronological history of submissions, reviews, decisions, actions, and closures.
7. Dashboards and filters display correct data for each role.
8. An authorized user can export a filtered CSV with the approved columns, and unauthorized fields are excluded.
9. Successful exports and important administrative/case actions are logged.
10. Security tests verify backend authorization, session handling, and protection of restricted records.
11. Backup and restoration procedures are documented and tested.
12. School stakeholders approve the workflow, data fields, retention policy, access matrix, and export process.

---

## 6. Proposed Case Statuses (from Appendix A)

| Status | Meaning |
|--------|---------|
| Draft | Report is being prepared and has not been submitted |
| Submitted | Report has been submitted and is awaiting initial review |
| Under Review | An authorized reviewer is assessing the report |
| Clarification Required | The reporter or another authorized person must provide more information |
| Assigned | The case has been assigned for investigation, review, or intervention |
| Action Pending | A decision has been recorded or approved action is awaiting implementation |
| Follow-up Pending | An intervention or action has been completed or started, and follow-up remains due |
| Closed | Required review and actions are complete according to policy |
| Reopened | An authorized user has reopened the case with a recorded reason |
| Rejected / No Further Action | The authorized reviewer has determined that no further action is required; rationale must be recorded |

---

## 7. Core Data Entities (from Section 6.1)

| Entity | Key Fields (Proposed) | Notes |
|--------|----------------------|-------|
| User | User ID, name, staff identifier, email/username, role, account status, created/approved timestamps | Credentials should be stored securely or delegated to an approved identity provider |
| Student | Student ID, name, class/grade, active status, minimum approved contact/context fields | Collect only data needed for case management |
| Incident / Case | Case ID, student ID, reporter ID, incident date/time, category, description, location, status, submission timestamp | Case and incident may be separate tables if one case can cover multiple incidents |
| Case Review | Review ID, case ID, reviewer ID, review date, result, clarification request, notes | Review details should be auditable |
| Disciplinary Action | Action ID, case ID, action type, rationale, start/end date if applicable, responsible user, status | Examples are configurable and subject to school policy |
| Intervention | Intervention ID, case ID, counsellor ID, type, date, notes, confidentiality level, outcome | Restrict confidential counselling notes as required |
| Follow-up | Follow-up ID, case ID, due date, assigned user, completion date, result, next step | Supports reminders and overdue reporting |
| Audit Event | Event ID, actor ID, action, target type/ID, timestamp, metadata | Avoid storing unnecessary sensitive content in audit metadata |
| Export Log | Export ID, user ID, timestamp, filters, fields/scope, result | Record successful exports and failures where feasible |
