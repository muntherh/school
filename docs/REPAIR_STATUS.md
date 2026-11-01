# Implementation and verification status

The supplied SRS and prompt text are preserved in school-srs-source.txt and school-prompts-source.txt. See REPAIR_REPORT_AR.md for the Arabic repair inventory and school deployment inputs. This document supersedes earlier acceptance/security reports for this revision.

Implemented: restored dependency manifest/scripts; source-tree cleanup; PostgreSQL initial migration; local Compose service and environment template; safe first-principal bootstrap; centralized API authentication and record access; current-account session validation; same-origin mutations; per-process login limiting; isolated test safeguards; corrected form contracts and accessible IDs; scoped database dashboards; student/staff details and profile display; case history; follow-up completion; persisted configuration catalogs; real case search; CSV escaping, formula safety and export routing; collision-resistant case references; transactional principal decisions, assignments, status transitions and clarification; no automatic case closure by a counsellor; technical-admin audit redaction and matching UI controls; CI and role-based Playwright tests.

## Verification

- Verified application commit: `496dfa9fc2abdaa51cb554e1df3cee5b0e56ae79`.
- [GitHub Actions run 41264182754](https://github.com/muntherh/school/actions/runs/41264182754) completed successfully: clean install, PostgreSQL 16 migration, Prisma generation, TypeScript, **174 unit/integration/security tests**, production Next.js build, and **5 Playwright browser tests**.
- Local TypeScript and 62 unit tests also passed. Earlier browser failures exposed discarded explicit field IDs and an insufficient wait for first-route development compilation; both were fixed before the successful run.
- The subsequent documentation commit only records these results; no application or test code changed after the verified commit.
- npm audit after the scoped deepmerge-ts 8.0.0 override reported zero known vulnerabilities. This is a dependency advisory check, not a security certification.
- Browser tests cover login, own-case access, principal review/closure through the form, role-based denials, audit redaction and session invalidation after deactivation. They are a bounded regression suite, not full school acceptance.

## Remaining before a school pilot

- Validate all workflows, roles, closure policy and confidential-note access with the school; the SRS is a draft.
- Configure hosting, HTTPS origin, production secrets, shared ingress rate limiting, backup encryption/destination/retention, and test restoration. No production service or credentials were provisioned.
- Separately migrate existing SQLite records if preservation is required; the supplied migration initializes fresh PostgreSQL only.
- Complete school acceptance on synthetic data, including mobile layouts, accessibility, load, concurrency and recovery testing.
- Confidential export stays disabled pending policy. Password recovery, invitations, notifications and attachments remain optional follow-on integrations.
- Decisions, assignments, status transitions and clarification now keep audit records transactionally. Other CRUD/follow-up flows still use best-effort audit writes and require further hardening if strict all-or-nothing audit guarantees are mandated.
- Deactivation/role changes are checked against the database on each request. Per-device session inventories, revocation of an already copied cookie after logout and shared rate-limit storage are not implemented.

The revision is not declared ready for real student records solely because automated checks pass.
