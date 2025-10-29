# Sprint 2 Test Plan

Date: 2025-10-25
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

# Sprint 2 Test Plan

Date: 2025-10-25

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
