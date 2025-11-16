# Stand Up Platform - Architecture Documentation

## Executive Summary

**Stand Up** is a career platform connecting students with job opportunities, mentors, and learning resources. This document outlines the complete backend architecture built with Node.js, Express, MySQL, and Gemini AI integration.

### Tech Stack
- **Frontend**: React 19, React Router, Shadcn UI, Tailwind CSS, Zod
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL 8.0 (via MAMP)
- **AI Integration**: Google Gemini API for intelligent matching
- **Authentication**: Express-session with MySQL session store
- **Validation**: express-validator

### Key Features
1. ✅ AI-powered job matching using Gemini AI
2. ✅ Session-based authentication with role-based access
3. ✅ Job board with advanced filtering
4. ✅ Application tracking with Kanban workflow
5. ✅ Mentor booking system
6. ✅ Portfolio & resume builder with ATS scoring
7. ✅ Learning platform with courses and events
8. ✅ Real-time notifications

---

## Database Architecture

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : creates
    USERS ||--o{ SAVED_JOBS : saves
    USERS ||--o{ PROJECTS : owns
    USERS ||--o{ MENTOR_SESSIONS : books
    USERS ||--o{ CAREER_ROADMAP : has
    JOBS ||--o{ APPLICATIONS : receives
    JOBS ||--o{ SAVED_JOBS : saved_by
    JOBS ||--o{ JOB_SKILLS : requires
    MENTORS ||--o{ MENTOR_SESSIONS : provides
    USERS ||--o{ USER_SKILLS : has
    
    USERS {
        uuid id PK
        string email UK
        string password
        string name
        enum role
        string avatar
        integer profile_strength
        date graduation
        text bio
        string company_name
        string company_size
        string industry
        timestamp created_at
        timestamp updated_at
    }
    
    JOBS {
        uuid id PK
        uuid employer_id FK
        string title
        string company
        string logo
        string location
        enum type
        enum mode
        string salary
        integer match_score
        text description
        json requirements
        json culture
        json why_match
        json why_not_match
        date posted_date
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    APPLICATIONS {
        uuid id PK
        uuid user_id FK
        uuid job_id FK
        enum status
        date applied_date
        date last_update
        text notes
        json timeline
        timestamp created_at
        timestamp updated_at
    }
    
    MENTORS {
        uuid id PK
        string name
        string title
        string company
        string avatar
        json expertise
        json languages
        float rating
        integer sessions_count
        text bio
        json topics
        string availability
        timestamp created_at
        timestamp updated_at
    }
    
    MENTOR_SESSIONS {
        uuid id PK
        uuid user_id FK
        uuid mentor_id FK
        string topic
        date preferred_date
        time preferred_time
        text message
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    PROJECTS {
        uuid id PK
        uuid user_id FK
        string title
        text description
        string image
        json tags
        string github_url
        string live_url
        boolean featured
        timestamp created_at
        timestamp updated_at
    }
    
    COURSES {
        uuid id PK
        string title
        string provider
        string instructor
        string duration
        enum level
        string price
        string thumbnail
        float rating
        integer students_count
        json topics
        timestamp created_at
        timestamp updated_at
    }
    
    EVENTS {
        uuid id PK
        string title
        date date
        time time
        enum type
        string location
        timestamp created_at
        timestamp updated_at
    }
    
    SAVED_JOBS {
        uuid id PK
        uuid user_id FK
        uuid job_id FK
        date saved_date
        timestamp created_at
    }
    
    USER_SKILLS {
        uuid id PK
        uuid user_id FK
        string skill_name
        timestamp created_at
    }
    
    JOB_SKILLS {
        uuid id PK
        uuid job_id FK
        string skill_name
        timestamp created_at
    }
    
    CAREER_ROADMAP {
        uuid id PK
        uuid user_id FK
        string title
        enum status
        date completed_date
        integer order
        timestamp created_at
        timestamp updated_at
    }
```

---

## API Design

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST /api/auth/signup
**Description**: Create new user account  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "student"
}
```
**Response**: `201 Created`
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

#### POST /api/auth/signin
**Description**: Sign in with credentials  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```
**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Signed in successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

#### POST /api/auth/signout
**Description**: Sign out current user  
**Response**: `200 OK`

#### GET /api/auth/me
**Description**: Get current authenticated user  
**Response**: `200 OK`

---

### Job Endpoints

#### GET /api/jobs
**Description**: Get all jobs with optional filters  
**Query Parameters**:
- `search` - Search term
- `roles` - Comma-separated role filters
- `locations` - Comma-separated location filters
- `modes` - Comma-separated mode filters (Onsite, Hybrid, Remote)
- `types` - Comma-separated type filters (Internship, Full-time, Part-time)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Frontend Developer Intern",
      "company": "Tech Innovations",
      "location": "Bangkok, Thailand",
      "type": "Internship",
      "mode": "Hybrid",
      "salary": "15,000 - 20,000 THB",
      "matchScore": 92,
      "skills": ["React", "JavaScript"],
      "postedDate": "2025-07-10"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

#### GET /api/jobs/:id
**Description**: Get single job details  
**Response**: `200 OK`

#### POST /api/jobs (Protected - Employer only)
**Description**: Create new job posting  
**Request Body**:
```json
{
  "title": "Frontend Developer",
  "company": "Tech Co",
  "location": "Bangkok",
  "type": "Full-time",
  "mode": "Hybrid",
  "salary": "30,000 - 45,000 THB",
  "description": "...",
  "requirements": ["React", "3+ years experience"],
  "skills": ["React", "Node.js"],
  "culture": ["Fast-paced", "Innovative"]
}
```
**Response**: `201 Created`

#### PUT /api/jobs/:id (Protected - Employer only)
**Description**: Update job posting  

#### DELETE /api/jobs/:id (Protected - Employer only)
**Description**: Delete job posting  

---

### Application Endpoints

#### GET /api/applications (Protected)
**Description**: Get user's applications  
**Response**: `200 OK`

#### POST /api/applications (Protected - Student only)
**Description**: Apply for a job  
**Request Body**:
```json
{
  "jobId": "uuid",
  "notes": "I'm very interested in this position"
}
```
**Response**: `201 Created`

#### PUT /api/applications/:id (Protected)
**Description**: Update application status/notes  
**Request Body**:
```json
{
  "status": "interview",
  "notes": "Technical interview scheduled"
}
```

#### DELETE /api/applications/:id (Protected)
**Description**: Withdraw application  

---

### Mentor Endpoints

#### GET /api/mentors
**Description**: Get all mentors with optional filters  
**Query Parameters**:
- `search` - Search term
- `expertise` - Comma-separated expertise filters

**Response**: `200 OK`

#### GET /api/mentors/:id
**Description**: Get single mentor details  

#### POST /api/mentors/sessions (Protected - Student only)
**Description**: Book mentor session  
**Request Body**:
```json
{
  "mentorId": "uuid",
  "topic": "Career guidance",
  "preferredDate": "2025-07-20",
  "preferredTime": "14:00",
  "message": "Looking forward to discussing..."
}
```

---

### User Profile Endpoints

#### GET /api/users/profile (Protected)
**Description**: Get current user profile  

#### PUT /api/users/profile (Protected)
**Description**: Update user profile  
**Request Body**:
```json
{
  "name": "John Doe",
  "bio": "Computer Science student...",
  "skills": ["React", "Node.js"],
  "desiredRoles": ["Frontend Developer"],
  "graduation": "2025-06"
}
```

#### POST /api/users/skills (Protected)
**Description**: Add skills to user profile  

---

### Portfolio Endpoints

#### GET /api/portfolio/projects (Protected)
**Description**: Get user's projects  

#### POST /api/portfolio/projects (Protected)
**Description**: Add new project  
**Request Body**:
```json
{
  "title": "E-Commerce Platform",
  "description": "Full-stack application...",
  "tags": ["React", "Node.js"],
  "githubUrl": "https://github.com/...",
  "liveUrl": "https://demo.com",
  "featured": true
}
```

#### PUT /api/portfolio/projects/:id (Protected)
**Description**: Update project  

#### DELETE /api/portfolio/projects/:id (Protected)
**Description**: Delete project  

---

### Saved Jobs Endpoints

#### GET /api/saved-jobs (Protected)
**Description**: Get user's saved jobs  

#### POST /api/saved-jobs (Protected)
**Description**: Save a job  
**Request Body**:
```json
{
  "jobId": "uuid"
}
```

#### DELETE /api/saved-jobs/:jobId (Protected)
**Description**: Unsave a job  

---

### Learning Endpoints

#### GET /api/courses
**Description**: Get all courses  

#### GET /api/events
**Description**: Get upcoming events  

---

### AI Matching Endpoints

#### POST /api/ai/match-jobs (Protected - Student only)
**Description**: Get AI-powered job matches using Gemini  
**Request Body**:
```json
{
  "skills": ["React", "Node.js"],
  "desiredRoles": ["Frontend Developer"],
  "experience": "entry-level"
}
```
**Response**: `200 OK`
```json
{
  "success": true,
  "matches": [
    {
      "jobId": "uuid",
      "matchScore": 92,
      "whyMatch": ["Strong React skills", "Portfolio shows relevant projects"],
      "whyNotMatch": ["Docker experience needed"],
      "recommendation": "Highly recommended - great fit for your profile"
    }
  ]
}
```

#### POST /api/ai/analyze-resume (Protected - Student only)
**Description**: Analyze resume with Gemini AI  
**Request Body**: FormData with resume file
**Response**: ATS score, suggestions, keywords

---

## Security Measures

### Authentication
- Session-based authentication with secure cookies
- Password hashing using bcrypt (salt rounds: 10)
- Session stored in MySQL for persistence
- CSRF protection enabled

### Validation
- Input validation using express-validator
- Sanitization of user inputs
- SQL injection prevention via Sequelize ORM
- XSS protection with helmet.js

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes
- Gemini AI endpoints: 20 requests per hour (API quota management)

### CORS Configuration
```javascript
{
  origin: 'http://localhost:3001', // React frontend
  credentials: true
}
```

---

## Gemini AI Integration

### Use Cases
1. **Job Matching**: Analyze user skills vs job requirements
2. **Resume Analysis**: ATS scoring and optimization suggestions
3. **Interview Preparation**: Generate personalized interview questions
4. **Career Guidance**: Recommend learning paths and skills to acquire

### Implementation
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### API Key Management
- Stored securely in `.env` file
- Never exposed to frontend
- Rate limiting to prevent quota exhaustion

---

## Database Configuration

### MAMP Connection
```javascript
{
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'standup_db',
  dialect: 'mysql'
}
```

### Migrations
Run migrations to create all tables:
```bash
cd /app/backend
npm run migrate
```

### Seeders
Populate database with demo data:
```bash
npm run seed
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": []
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Not Found
- `500` - Internal Server Error

---

## Development Workflow

### Setup
1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.example` to `.env`
3. Start MAMP and ensure MySQL is running
4. Run migrations: `npm run migrate`
5. Seed database: `npm run seed`
6. Start server: `npm run dev`

### Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","name":"Test User","role":"student"}'

# Sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}' \
  -c cookies.txt

# Get jobs (authenticated)
curl http://localhost:3000/api/jobs -b cookies.txt
```

---

## Deployment Considerations

### Environment Variables
```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=standup_db
SESSION_SECRET=your-secret-key-here
GEMINI_API_KEY=AIzaSyBoswzYYxdFT6w6F_IOF1MDGqmu-G_bxKI
```

### Production Checklist
- [ ] Use strong session secret
- [ ] Enable HTTPS
- [ ] Configure production database
- [ ] Set up logging (Winston/Morgan)
- [ ] Enable compression
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring (PM2)
- [ ] Regular database backups

---

## Assumptions & Decisions

1. **Session Storage**: Using MySQL session store for persistence across server restarts
2. **UUID Primary Keys**: Better for distributed systems and security
3. **Soft Deletes**: Not implemented initially (can be added via `deletedAt` column)
4. **File Uploads**: Resume/project images stored as URLs (can integrate AWS S3)
5. **Real-time Features**: Not implemented initially (can add Socket.io)
6. **Email Notifications**: Not implemented (can add Nodemailer/SendGrid)
7. **Payment Integration**: Not required for MVP
8. **Match Score Calculation**: Initially AI-powered, can add manual algorithm as fallback

---

## Future Enhancements

1. WebSocket for real-time notifications
2. Email verification and password reset
3. Two-factor authentication
4. Advanced search with Elasticsearch
5. Redis caching for performance
6. File upload service (AWS S3/Cloudinary)
7. PDF generation for resumes
8. Video interview platform integration
9. Applicant tracking system for employers
10. Analytics dashboard

---

## Support & Maintenance

### Logging
- Access logs: Morgan middleware
- Error logs: Winston logger
- Log files: `/logs` directory

### Monitoring
- Health endpoint: `GET /api/health`
- Database connection status
- Gemini API status

### Backup Strategy
- Daily MySQL dumps
- Session table cleanup (expired sessions)
- Log rotation
