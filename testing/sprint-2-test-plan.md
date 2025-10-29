# Sprint 2 Test Plan

Date: 2025-10-29
Project: StandUP — Sprint 2
Authors: SanMine (primary), QA Team

## Introduction & Scope
This document defines the test cases for Sprint 2 deliverables. It focuses on two core features requested for formal verification in this sprint:

- Feature 1: Head Judge Finalization
- Feature 2: Q Grader Interactive Scoresheet

Each feature contains three test cases: Happy Path, Sad Path, and an Edge Case. For each test case we list Preconditions, Steps, and Expected Results. At the end of each feature we include a test-summary table and a small function/test coverage table mapping feature sub-functions to tests.

---

## Feature 1 — Head Judge Finalization
Description: The Head Judge (HJ) reviews judging sheets/round scores and finalizes the results. Finalization locks scores for a cohort/round, records a finalization timestamp and author, and triggers downstream actions (e.g., publish results, notify participants).

### HJ-001 — Happy Path
- Preconditions
  - User is authenticated and has Head Judge role
  - There are completed judge score entries for the target round
  - No existing finalization for this round
  - Backend and DB are reachable

- Steps
  1. Navigate to the Round Results screen for the target round
  2. Click the `Finalize` button
  3. Confirm the finalization modal (click `Yes, finalize`)
  4. Observe UI while request is processed
  5. After success, inspect round status, finalization metadata and notifications

- Expected Result
  - API returns HTTP 200 with body { success: true, finalized: true, finalizedBy: <HJ id>, finalizedAt: <ISO timestamp> }
  - UI shows the round as `Finalized` and displays the finalization author and timestamp
  - All individual judge scores become read-only / locked in the UI
  - Notifications are queued/sent to participants (or a UI indication shows notifications scheduled)
  - Re-issuing the finalize action returns a safe error/notice (see HJ-002)

### HJ-002 — Sad Path (already finalized / permission denied)
- Preconditions
  - Round is already finalized by another Head Judge OR
  - Current user is not authorized (not Head Judge)

- Steps (case A: already finalized)
  1. As a Head Judge, open the Round Results for an already-finalized round
## Sprint 2 Test Plan — Simple Table (All functions)

Below is a simple test plan table in basic English. "Actual result" is left blank because tests have not been run yet.

| Test ID | Title | Testing type | Expected result | Actual result |
|---------|-------|--------------|-----------------|---------------|
| AUTH-001 | Login (Sign in) | Functional / Smoke | User signs in with email and password. Server returns 200 and session cookie. | |
| AUTH-002 | Sign up (Create account) | Functional | User account is created, server returns success and session cookie. | |
| AUTH-003 | Onboarding save (skills & roles) | Functional | User's selected skills and roles are saved to DB tables (user_skills, career_roadmap). | |
| AUTH-004 | Sign out | Functional | Session is destroyed on server. /api/auth/me returns 401 after sign out. | |
| DASH-001 | Dashboard loads live data | Functional | Dashboard requests /api/users/dashboard and shows real KPIs and lists (no mock data). | |
| JOBS-001 | Jobs list (live) | Functional | /api/jobs returns a list of jobs. Jobs page shows titles, company, skills, and match score. | |
| JOBS-002 | Apply to job (create application) | Functional | User can apply. Server returns 201 and application appears in Applications list. | |
| APPS-001 | Applications list (Kanban) | Functional | /api/applications returns user's applications including job relation. UI shows applications in correct columns. | |
| LEARN-001 | Learning — Coursera proxy | Functional / Integration | GET /api/learning/courses/coursera returns course list and UI shows courses. | |
| HJ-001 | Head Judge finalization | Functional / Security | Finalize action locks scores, sets finalized metadata, and returns success (200). Unauthorized users get 403. | |
| QG-001 | Q Grader — save scores | Functional | Grader saves sub-scores and comments. Server returns success and totals match calculation. | |
| QG-002 | Q Grader — validation & a11y | UX / Accessibility | Form validates required fields and shows clear messages. Keyboard and screen-reader access works. | |
| AUTH-005 | Protected routes check | Security | Pages requiring auth return 401 for anonymous users and 200 for authenticated users. | |
| JOBS-003 | Jobs filtering / search | Functional | Filtering and search return correct subset of jobs and UI updates accordingly. | |
| APPS-002 | Application timeline & notes | Functional | Application entries show timeline and notes. Edits persist. | |

> Notes: Keep the "Actual result" column blank until tests are run. Use simple curl or Postman for API checks, and Cypress or Playwright for end-to-end UI checks.

If you want, I can now:
- fill this table with actual results by running the tests locally (I can run backend and/or frontend tests), or
- convert each row into a GitHub Issue for tracking, or
- export the table to CSV for import into your project tool.
 
| Test ID | Feature | Preconditions | Test Focus | Expected Result |
|---------|---------|---------------|------------|-----------------|
| AUTH-001 | Sign up + onboarding persist | Clean DB / new user | Full flow: signup -> onboarding page -> persist skills/roles | User created, onboarding choices saved in `user_skills`/`career_roadmap` tables |
| AUTH-002 | Sign in / session | Existing user | Session cookie, protected routes | `standup.sid` cookie set, /api/auth/me returns user, protected pages blocked if unauthenticated |
| AUTH-003 | Sign out | Authenticated session | Destroy session | Session invalidated server-side; subsequent /api/auth/me returns 401 |

### Dashboard / Jobs / Applications (high-level)
| Test ID | Feature | Preconditions | Test Focus | Expected Result |
|---------|---------|---------------|------------|-----------------|
| DASH-001 | Dashboard loads live data | Authenticated user | API calls / mapping | Data from `/api/users/dashboard`, `/api/jobs`, `/api/mentors`, `/api/learning/events` displayed correctly |
| JOBS-001 | Jobs list live | Server seeded jobs | Filtering / mapping | Jobs from `/api/jobs` displayed; skills and matchScore normalized |
| APPS-001 | Applications list live | User with applications | Inclusion of job relation | `/api/applications` returns applications including `job` relation and timeline; UI renders kanban columns |

---

## Test Environment & Execution Notes
- Environments
  - Local dev: frontend http://localhost:3002, backend http://localhost:3000
  - Test DB: use seed data or a dedicated test schema

- Data setup
  - Use seeders to create sample users, jobs, applications, courses and grading rubrics
  - Create a Head Judge user and a Grader user for role-based tests

- Test tools
  - Postman / HTTP client for API tests
  - Cypress or Playwright for end-to-end browser flows and accessibility checks
  - Jest for unit tests of computeWeightedTotal and validation functions

- Acceptance criteria
  - All high-priority tests (HJ-001, HJ-002, QG-001, QG-002, AUTH-001..003) must pass before merging Sprint 2 to `main`.

---

## Sign-off
Prepared by: SanMine (QA/Dev)
Date: 2025-10-29

Notes: If you want, I can also convert these tables into a CSV or a checklist in your project management tool (GitHub Issues or Jira) and add example Postman requests for the API tests. Let me know which you'd prefer.

---

## Plain / Easy Test Checklist (function-by-function)
Below is a simplified, step-by-step checklist for the core functions in Sprint 2. Each function includes: Preconditions, Steps (what to do), Quick curl examples when applicable, and Expected result.

Function 1 — Login (quick smoke)
- Preconditions: Backend running (http://localhost:3000), test user exists (email/password).
- Steps:
  1. From browser UI: open Sign In page, enter email/password, click Sign In.
  2. Or use curl to test API:

```bash
curl -i -X POST http://localhost:3000/api/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt
```

- Expected:
  - HTTP 200, response JSON { success: true, user: { ... } }
  - Browser sets session cookie (standup.sid) and subsequent requests to /api/auth/me return the user.

Function 2 — Sign up + Onboarding (save skills/roles)
- Preconditions: Backend running, use a unique email for signup.
- Steps:
  1. From UI: Sign up form -> complete fields -> submit -> you should be redirected to onboarding page.
  2. Choose goals/skills/roles and submit onboarding.
  3. Or use API:

```bash
# 1) signup
curl -i -X POST http://localhost:3000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"new@example.com","password":"P@ssw0rd","name":"New User"}' \
  -c cookies.txt

# 2) onboarding (after cookie preserved)
curl -i -X POST http://localhost:3000/api/users/onboarding \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{"skills":["javascript","react"],"role":"student","company_name":"Acme"}'
```

- Expected:
  - Signup returns success and a session cookie.
  - Onboarding API returns success and DB tables `user_skills`/`career_roadmap` have entries for the new user.

Function 3 — Sign out
- Preconditions: Authenticated session (have cookies.txt)
- Steps:
  1. From UI: click Sign Out.
  2. Or via API:
```bash
curl -i -X POST http://localhost:3000/api/auth/signout -b cookies.txt
```
- Expected: session destroyed server-side; /api/auth/me returns 401 afterwards.

Function 4 — Dashboard (live data)
- Preconditions: Authenticated user with data (dashboard stats present).
- Steps:
  1. Open Dashboard in UI.
  2. Confirm API calls: /api/users/dashboard, /api/jobs, /api/mentors, /api/learning/events.
- Expected: KPI cards and lists render with real data; no mock placeholders.

Function 5 — Jobs list (live)
- Preconditions: Server seeded with jobs.
- Steps:
  1. Open Jobs page in UI.
  2. Verify network request to /api/jobs and that job cards show titles, companies, skills.
  3. Quick curl:
```bash
curl -i http://localhost:3000/api/jobs
```
- Expected: 200 with array of jobs; UI maps skills and matchScore correctly.

Function 6 — Apply to a job (applications)
- Preconditions: Authenticated student user, job exists.
- Steps:
  1. Click Apply on a job in UI and submit notes.
  2. Or API:
```bash
curl -i -X POST http://localhost:3000/api/applications \
  -H 'Content-Type: application/json' -b cookies.txt \
  -d '{"jobId":"<job-id>","notes":"Interested"}'
```
- Expected: 201/200 success and application record created; appears on Applications page.

Function 7 — Applications page (Kanban)
- Preconditions: User has at least one application.
- Steps:
  1. Open Applications page; check columns (Applied, Interview, Offer, Rejected).
  2. Confirm network request to /api/applications returns objects with included `job`.
- Expected: Applications appear in correct columns; timeline and notes visible.

Function 8 — Learning page (Coursera proxied)
- Preconditions: Backend running with new proxied route (GET /api/learning/courses/coursera).
- Steps:
  1. Open Learning page in UI.
  2. Check Network: /api/learning/courses/coursera should be called and return success with data.
  3. Quick curl:
```bash
curl -i http://localhost:3000/api/learning/courses/coursera
```
- Expected: 200 with { success: true, data: [...] } and UI shows live Coursera courses.

Function 9 — Head Judge Finalization (simple)
- Preconditions: Head Judge account, completed judge scores, round not finalized.
- Steps:
  1. As HJ, open Round Results UI -> click Finalize -> confirm.
  2. Or API:
```bash
curl -i -X POST http://localhost:3000/api/rounds/<round-id>/finalize -b cookies.txt
```
- Expected: 200 success, round flagged finalized, scores locked, participants notified.

Function 10 — Q Grader (enter scores)
- Preconditions: Grader account, rubric available.
- Steps:
  1. Open Q Grader UI for a submission.
  2. Enter valid numeric sub-scores, optional comments, click Save.
  3. Quick API check:
```bash
curl -i -X POST http://localhost:3000/api/scores \
  -H 'Content-Type: application/json' -b cookies.txt \
  -d '{"submissionId":"<id>","subScores":[{"criterion":"clarity","score":8}],"comment":"Good"}'
```
- Expected: 200 success, total matches weighted calculation, values persisted.

---

If you'd like, I can now:
- convert each of these functions into GitHub Issues automatically (one per function), or
- create a CSV checklist for import, or
- add two small Cypress tests for Login and Sign-up happy paths to `frontend/cypress` as a starter.

Tell me which of those you'd like next and I'll proceed.
