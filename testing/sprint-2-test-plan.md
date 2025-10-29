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
  2. Click the `Finalize` button (if shown) or attempt finalize via API

- Expected Result (case A)
  - Frontend should show `Finalize` disabled or a confirmation that round is already finalized
  - If API is called, it should return HTTP 409 or 400 with { success: false, message: 'Round already finalized', finalizedBy: <id>, finalizedAt: <ts> }
  - No changes to stored scores or metadata

- Steps (case B: unauthorized user)
  1. Log in as a regular judge (non-HJ)
  2. Attempt to access the finalize action in UI or call API endpoint

- Expected Result (case B)
  - UI should not show finalize controls to non-HJ users
  - API returns HTTP 403 with { success: false, message: 'Forbidden' }
  - No finalization created

### HJ-003 — Edge Case (partial failures / network interruption)
- Preconditions
  - Head Judge is authenticated
  - Backend transient error or DB write partially completes (simulate by forcing an error in the DB layer or by killing DB connection mid-request)

- Steps
  1. Start finalization action from UI
  2. Simulate network loss or backend error during the operation
  3. Retry or inspect the round state after recovery

- Expected Result
  - The API should respond with a clear error (HTTP 500/502) indicating a transient failure
  - The system must remain in a consistent state: either finalization did not occur (no partial locks) or finalized state was fully applied
  - If partial application is detected, a manual reconciliation flag appears for admins OR an automatic rollback occurs
  - The UI shows a friendly error and suggests retrying; the retry should succeed when the backend is healthy

### Feature 1 — Test Summary Table
| Test ID | Title | Priority | Type | Preconditions | Expected Outcome |
|---------|-------|----------|------|---------------|------------------|
| HJ-001 | Head Judge Finalization — Happy Path | High | Functional | HJ auth, completed scores, not finalized | Round becomes finalized, scores locked, notifications queued |
| HJ-002 | Head Judge Finalization — Sad Path | High | Security/Permission | Already finalized OR unauthorized user | Proper 403/409; no state change; UI hides/blocks action |
| HJ-003 | Head Judge Finalization — Edge Case | Medium | Reliability | Transient backend or network failure | Consistent result (all-or-nothing), clear error, retry possible |

### Feature 1 — Function / Coverage Mapping
| Function | Description | Tests covering it |
|----------|-------------|-------------------|
| POST /api/rounds/:id/finalize | Server endpoint to finalize a round | HJ-001, HJ-002, HJ-003 |
| authorizeRole('HEAD_JUDGE') | Middleware to guard finalize action | HJ-002 |
| finalizeRoundTransaction | DB transaction that sets finalized flag, writes metadata, sends notifications | HJ-001, HJ-003 |
| notifyParticipants | Enqueues notifications (email/push) upon finalization | HJ-001 |

---

## Feature 2 — Q Grader Interactive Scoresheet
Description: Q Grader is an interactive judging sheet UI where graders enter scores, optional comments, and sub-scores. The component validates input, computes aggregate scores, and persists them to the DB. The UI must be responsive and accessible.

### QG-001 — Happy Path
- Preconditions
  - User is authenticated and has `Grader` role
  - The scoring rubric for the question is available (weights and allowed range)
  - Target submission exists and is open for grading

- Steps
  1. Open the Q Grader scoresheet for the target submission
  2. Enter numeric sub-scores within allowed ranges (e.g., 0–10) for each criterion
  3. Add an optional comment in the comment textbox
  4. Click `Save` (or `Submit`) to persist scores
  5. Verify the UI shows a success toast and the saved values remain

- Expected Result
  - API returns HTTP 200 with saved score object { success: true, scoreId, totalScore, subScores: [...] }
  - UI shows computed total score that matches weighted calculation
  - Saved scores are persisted and visible to the grader on reload
  - Audit metadata (grader id, timestamp) recorded

### QG-002 — UI/UX (validation and accessibility)
- Preconditions
  - Grader UI is accessible (keyboard navigation, labels present)

- Steps
  1. Try to submit with an empty required sub-score field
  2. Try to input non-numeric characters into numeric fields
  3. Navigate the form with keyboard (Tab/Enter), ensure focus order is logical
  4. Use a screen reader or inspect ARIA attributes for labels and errors

- Expected Result
  - Form validation prevents submission and shows inline errors for required/invalid fields
  - Non-numeric input is either prevented or triggers a clear validation message
  - Keyboard navigation works; buttons and inputs are reachable and operable
  - ARIA attributes present, labels are associated with inputs, error messages announced to screen readers

### QG-003 — Edge Case (invalid input & extreme values)
- Preconditions
  - Grader UI loaded

- Steps
  1. Enter extreme numeric values (e.g., very large numbers, negative numbers) in sub-score fields
  2. Attempt to exceed sum/weighted caps if those rules exist
  3. Attempt rapid repeated submissions (double-clicking Save) to test idempotency

- Expected Result
  - Server rejects invalid values with HTTP 400 and descriptive error messages
  - Client-side validation prevents out-of-range values where applicable
  - Double submissions are handled idempotently (either deduplicated server-side or client disabled during submission)
  - No data corruption; totals are calculated correctly only for valid ranges

### Feature 2 — Test Summary Table
| Test ID | Title | Priority | Type | Preconditions | Expected Outcome |
|---------|-------|----------|------|---------------|------------------|
| QG-001 | Q Grader Happy Path | High | Functional | Grader auth, rubric loaded | Scores saved, totals correct, persisted |
| QG-002 | UI/UX validation & accessibility | High | UX / A11y | UI accessible | Validation messages, keyboard & screen reader support |
| QG-003 | Edge Case invalid input | Medium | Validation / Reliability | UI loaded | Rejection of invalid inputs, idempotent saves |

### Feature 2 — Function / Coverage Mapping
| Function | Description | Tests covering it |
|----------|-------------|-------------------|
| POST /api/scores | Persists grader's sub-scores and comments | QG-001, QG-003 |
| validateScores | Server-side validation for ranges and required fields | QG-002, QG-003 |
| computeWeightedTotal | Client or server function to produce aggregate score | QG-001 |
| disableDuringSubmit | UI helper to prevent duplicate submissions | QG-003 |

---

## Additional test matrices (per sprint features)
Below are concise tables for related Sprint 2 features (auth, onboarding persistence, dashboard data, jobs/applications live data) that may be part of the sprint quality gate.

### Auth & Onboarding (high-level)
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
