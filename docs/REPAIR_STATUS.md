# Implementation and verification status

This revision repairs the uploaded source tree. The supplied SRS and prompt text are preserved in school-srs-source.txt and school-prompts-source.txt. It supersedes the previous acceptance and security reports for verification claims.

Implemented: restored dependency manifest and scripts; PostgreSQL initial migration; environment template; central API authentication and record-access boundary; current-account session validation; same-origin mutation checks; per-process login rate limiting; isolated test safeguards; corrected form contracts; real scoped dashboard aggregates; student and staff detail pages; profile display; follow-up completion control; configuration editing; export URL and CSV escaping fixes; collision-resistant case references; atomic status version update; no automatic case closure by a counsellor; CI and Playwright smoke tests.

Local checks: TypeScript passed; production Next.js build passed; 60 unit tests passed. PostgreSQL integration execution is still pending a supported database environment. An experimental PGlite wire-server attempt failed with connectivity/protocol errors and is not an acceptance result. GitHub Actions provisions PostgreSQL 16 to run the full suite. Do not describe database or browser acceptance as passed before those checks finish.

Remaining before a school pilot:
- Review every workflow against the school-approved permissions and closure policy. The SRS is explicitly a draft requiring stakeholder validation.
- Configure hosting, HTTPS origin, production secrets, a shared ingress rate limiter, backup destination and retention; verify restoration on an isolated database. No production service or secrets were provisioned.
- Migrate existing SQLite records separately if they need preservation; this change initializes fresh PostgreSQL only.
- Run the full role-by-role browser acceptance suite. The Playwright suite currently covers login and unauthenticated record access only.
- Confidential export remains disabled pending an approved policy. Password recovery, invitations, notifications and attachments remain follow-on work; do not present their settings as functioning features.
- Detailed history presentation, transactional audit guarantees across all multi-record workflows, distributed session revocation and responsive/mobile acceptance require further verification and hardening.

The application is not declared ready for real student records by this revision.
