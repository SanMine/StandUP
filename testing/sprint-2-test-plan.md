# Sprint 2 Test Plan

Date: November 19, 2025
Project: StandUP Platform
Test Environment: Development
Status: In Progress

---

## Test Results Overview

| Category | Total Tests | Passed | Failed | Pending | Pass Rate |
|----------|-------------|--------|--------|---------|-----------|
| AI Features | 9 | 9 | 0 | 0 | 100% |
| Authentication & User | 5 | 0 | 0 | 5 | - |
| Dashboard & Jobs | 4 | 0 | 0 | 4 | - |
| Applications | 2 | 0 | 0 | 2 | - |
| Learning & Career | 6 | 0 | 0 | 6 | - |
| Employer | 4 | 0 | 0 | 4 | - |
| Analytics & Admin | 3 | 0 | 0 | 3 | - |
| Performance | 3 | 0 | 0 | 3 | - |
| Security | 3 | 0 | 0 | 3 | - |
| **TOTAL** | **39** | **9** | **0** | **30** | **23%** |

---

## AI Feature Tests - Completed

All AI tests passed successfully on November 19, 2025

| Test ID | Title | Testing Type | Expected Result | Actual Result | Status |
|---------|-------|--------------|-----------------|---------------|--------|
| AI-001 | Return relevant jobs based on user skills | Functional / AI | AI returns at least 70% of jobs that match user skills and preferences | Passed - 767ms - Returns 4 out of 4 relevant jobs (100%) | PASS |
| AI-002 | Prioritize matching jobs over non-matching | Functional / AI | Jobs matching user skills appear first in results | Passed - 593ms - Matching jobs ranked higher | PASS |
| AI-003 | No duplicate job IDs in response | Functional | Response contains no repeated job IDs | Passed - 456ms - All job IDs are unique | PASS |
| AI-004 | No duplicate jobs in repeated calls | Functional | Same job not recommended twice within short time | Passed - 1082ms - Different calls return consistent results | PASS |
| AI-005 | Fast matching for 5000 jobs | Performance | System completes matching in less than 10 seconds | Passed - 417ms - Completed in 0.4 seconds | PASS |
| AI-006 | Handle large skill sets efficiently | Performance | System handles users with many skills without slowdown | Passed - 1023ms - Processed large skill set in 1 second | PASS |
| AI-007 | No sensitive personal data in suggestions | Security / Ethics | AI does not use gender, race or personal info | Passed - 483ms - No sensitive attributes found | PASS |
| AI-008 | Equal scores for equal skills | Fairness | Users with same skills get same match scores | Passed - 1697ms - Match scores are consistent | PASS |
| AI-009 | No personal identifiers in matching | Security | System does not use user names or emails in matching | Passed - 781ms - Only skills and preferences used | PASS |

**Total Tests:** 9  
**Passed:** 9 (100%)  
**Failed:** 0  
**Total Time:** 10.5 seconds

---

## Notes:
- All AI features working correctly with Groq AI
- Job matching algorithm performs well under load
- Bias and fairness checks passed
- Performance meets requirements (< 10s for 5000 comparisons)
- Gemini AI model deprecated but fallback mechanism works

---

## Authentication & User Tests - Pending

| Test ID | Title | Testing Type | Expected Result | Actual Result | Status |
|---------|-------|--------------|-----------------|---------------|--------|
| AUTH-001 | User can sign in with email and password | Functional | User logs in successfully and gets session | | PENDING |
| AUTH-002 | User can create new account | Functional | New account is created and user can log in | | PENDING |
| AUTH-003 | Save skills and roles during onboarding | Functional | Skills and roles are saved to database | | PENDING |
| AUTH-004 | User can sign out | Functional | Session ends and user is logged out | | PENDING |
| AUTH-005 | Protected pages require login | Security | Pages show login screen if user not logged in | | PENDING |

---

## Dashboard & Jobs Tests - Pending

| Test ID | Title | Testing Type | Expected Result | Actual Result | Status |
|---------|-------|--------------|-----------------|---------------|--------|
| DASH-001 | Dashboard shows real user data | Functional | Dashboard displays live KPIs and data | | PENDING |
| JOBS-001 | Show list of available jobs | Functional | Jobs page shows job titles, companies, and skills | | PENDING |
| JOBS-002 | User can apply to a job | Functional | Application is created and saved | | PENDING |
| JOBS-003 | Filter and search jobs | Functional | Search returns correct job results | | PENDING |

---

## Applications Tests - Pending

| Test ID | Title | Testing Type | Expected Result | Actual Result | Status |
|---------|-------|--------------|-----------------|---------------|--------|
| APPS-001 | Show user applications in columns | Functional | Applications appear in correct status columns | | PENDING |
| APPS-002 | Show timeline and notes for application | Functional | Timeline and notes display correctly | | PENDING |

---

## Learning & Career Tests - Pending

| Test ID | Title | Testing Type | Expected Result | Actual Result | Status |
|---------|-------|--------------|-----------------|---------------|--------|
| LEARN-001 | Show courses from Coursera | Integration | Course list appears on learning page | | PENDING |
| CAREER-001 | AI analyzes profile and gives advice | Functional / AI | System returns career advice in less than 3 seconds | | PENDING |
| CAREER-002 | Show missing skills for jobs | Functional | System shows skills user needs to learn | | PENDING |
| CAREER-003 | AI suggests resume improvements | Integration | Resume suggestions appear and can be saved | | PENDING |
| CAREER-004 | User can request a mentor | Functional | Mentor receives request notification | | PENDING |
| CAREER-005 | Alert for incomplete profile | Validation | System shows warning if profile missing info | | PENDING |

---

## Employer Tests - Pending

| Test ID | Title | Testing Type | Expected Result | Actual Result | Status |
|---------|-------|--------------|-----------------|---------------|--------|
| EMP-001 | Employer can create job posting | Functional | Job is saved and appears in job list | | PENDING |
| EMP-002 | Search and filter candidates | Functional | Filter returns correct candidate list | | PENDING |
| EMP-003 | Secure messaging between employer and candidate | Security | Messages are private and encrypted | | PENDING |
| EMP-004 | Employer can see analytics | Functional | Analytics dashboard shows application data | | PENDING |

---

## Analytics & Admin Tests - Pending

| Test ID | Title | Testing Type | Expected Result | Actual Result | Status |
|---------|-------|--------------|-----------------|---------------|--------|
| ANA-001 | Show user progress chart | Functional | Chart displays user career progress | | PENDING |
| ANA-002 | Admin can view platform metrics | Functional | Admin dashboard shows usage statistics | | PENDING |
| ANA-003 | Hide personal info in analytics | Security | Personal data is masked in reports | | PENDING |

---

## Performance Tests - Pending

| Test ID | Title | Testing Type | Expected Result | Actual Result | Status |
|---------|-------|--------------|-----------------|---------------|--------|
| PERF-001 | Job matching responds quickly | Performance | Response time is less than 3 seconds | | PENDING |
| PERF-002 | Resume upload handles large files | Performance | Files up to 50MB process in less than 5 seconds | | PENDING |
| PERF-003 | Dashboard updates in real-time | Performance | Status updates appear within 2 seconds | | PENDING |

---

## Security Tests - Pending

| Test ID | Title | Testing Type | Expected Result | Actual Result | Status |
|---------|-------|--------------|-----------------|---------------|--------|
| SEC-001 | Control access based on user role | Security | Employers cannot see student personal data | | PENDING |
| SEC-002 | All connections use HTTPS | Security | HTTP requests redirect to HTTPS | | PENDING |
| SEC-003 | AI suggestions are logged for audit | Security | Each AI suggestion has timestamp and ID | | PENDING |

---

## Test Summary

**Overall Progress:**
- Total Test Categories: 9
- Completed Categories: 1 (AI Features)
- Pending Categories: 8
- Overall Pass Rate: 100% (for completed tests)

**Next Steps:**
1. Run authentication tests (AUTH-001 to AUTH-005)
2. Test dashboard and jobs features (DASH-001, JOBS-001 to JOBS-003)
3. Validate application management (APPS-001, APPS-002)
4. Test learning and career features
5. Complete employer, analytics, performance, and security tests
