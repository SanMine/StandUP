# Stand Up Platform - Complete Setup Guide

## 🎯 Quick Start Guide (Step-by-Step)

Follow these steps **in order** to set up the complete backend for the Stand Up platform.

---

## Step 1: Database Setup via phpMyAdmin

### 1.1 Access phpMyAdmin
1. Open your web browser
2. Navigate to: `http://localhost:8888/phpMyAdmin5/index.php?route=/server/databases`
3. You should see the phpMyAdmin interface

### 1.2 Create Database

**Option A: Using phpMyAdmin UI**
1. Click "New" in the left sidebar
2. Database name: `standup_db`
3. Collation: `utf8mb4_general_ci`
4. Click "Create"

**Option B: Using SQL**
1. Click "SQL" tab at the top
2. Run this command:
```sql
CREATE DATABASE standup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

### 1.3 Create Tables
1. Select `standup_db` from the left sidebar
2. Click "SQL" tab
3. Open the file: `/app/backend/database-schema.sql`
4. Copy the **entire content** of the file
5. Paste into the SQL tab in phpMyAdmin
6. Click "Go" button
7. Wait for success message (should say "12 tables created")

### 1.4 Verify Tables Created
Run this query in the SQL tab:
```sql
SHOW TABLES;
```

You should see:
- applications
- career_roadmap
- courses
- events
- job_skills
- jobs
- mentor_sessions
- mentors
- projects
- saved_jobs
- sessions
- user_skills
- users

---

## Step 2: Install Backend Dependencies

```bash
cd /app/backend
yarn install
```

This installs:
- Express.js and middleware
- Sequelize ORM and MySQL2
- Authentication packages (bcrypt, express-session)
- Google Generative AI (Gemini)
- Security packages (helmet, cors, rate-limit)

---

## Step 3: Environment Configuration

The `.env` file is already configured. Verify it contains:

```bash
cat /app/backend/.env
```

**Key settings:**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=standup_db
GEMINI_API_KEY=AIzaSyBoswzYYxdFT6w6F_IOF1MDGqmu-G_bxKI
PORT=3000
```

---

## Step 4: Seed Database with Demo Data

Since we cannot run Node.js migrations in your MAMP environment, you'll need to seed the database manually using SQL:

### 4.1 Create Demo Users

Run this in phpMyAdmin SQL tab:

```sql
USE standup_db;

-- Create UUIDs for users
SET @student_id = UUID();
SET @employer_id = UUID();

-- Insert Student User
INSERT INTO users (id, email, password, name, role, avatar, profile_strength, graduation, bio, created_at, updated_at) VALUES
(@student_id, 'sarah.j@university.edu', '$2b$10$rZ5ZqLGzJHhVQvW.FGJWsO4YvhLx0pqL8bqkJ6fYvqxN1JK/K0ZRG', 'Sarah Johnson', 'student', 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd', 78, '2025-06-15', 'Computer Science student passionate about building user-centric applications.', NOW(), NOW());

-- Insert Employer User
INSERT INTO users (id, email, password, name, role, avatar, company_name, company_size, industry, created_at, updated_at) VALUES
(@employer_id, 'hr@techinnovations.com', '$2b$10$rZ5ZqLGzJHhVQvW.FGJWsO4YvhLx0pqL8bqkJ6fYvqxN1JK/K0ZRG', 'Tech Innovations HR', 'employer', 'https://images.unsplash.com/photo-1557804506-669a67965ba0', 'Tech Innovations Ltd.', '50-200', 'Technology', NOW(), NOW());

-- Add student skills
INSERT INTO user_skills (id, user_id, skill_name, created_at) VALUES
(UUID(), @student_id, 'React', NOW()),
(UUID(), @student_id, 'Node.js', NOW()),
(UUID(), @student_id, 'Python', NOW()),
(UUID(), @student_id, 'SQL', NOW()),
(UUID(), @student_id, 'Figma', NOW());

-- Add career roadmap
INSERT INTO career_roadmap (id, user_id, title, status, completed_date, `order`, created_at, updated_at) VALUES
(UUID(), @student_id, 'Complete Your Profile', 'completed', '2025-06-15', 1, NOW(), NOW()),
(UUID(), @student_id, 'Build Your Resume', 'completed', '2025-06-20', 2, NOW(), NOW()),
(UUID(), @student_id, 'Add Portfolio Projects', 'in-progress', NULL, 3, NOW(), NOW()),
(UUID(), @student_id, 'Complete Mock Interview', 'pending', NULL, 4, NOW(), NOW()),
(UUID(), @student_id, 'Apply to 5 Jobs', 'pending', NULL, 5, NOW(), NOW());

-- Create jobs
SET @job1_id = UUID();
SET @job2_id = UUID();
SET @job3_id = UUID();

INSERT INTO jobs (id, employer_id, title, company, logo, location, type, mode, salary, description, requirements, culture, posted_date, status, created_at, updated_at) VALUES
(@job1_id, @employer_id, 'Frontend Developer Intern', 'Tech Innovations', 'https://images.unsplash.com/photo-1557804506-669a67965ba0', 'Bangkok, Thailand', 'Internship', 'Hybrid', '15,000 - 20,000 THB', 'Join our dynamic team to build cutting-edge web applications...', '["Currently pursuing CS degree", "6+ months React experience", "Portfolio with live projects"]', '["Fast-paced", "Innovation-driven", "Collaborative"]', '2025-07-10', 'active', NOW(), NOW()),
(@job2_id, @employer_id, 'Full Stack Developer', 'Digital Solutions Co.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c', 'Remote', 'Full-time', 'Remote', '35,000 - 45,000 THB', 'Build scalable applications for enterprise clients...', '["1+ year experience", "Full stack skills", "Agile experience"]', '["Remote-first", "Work-life balance", "Learning culture"]', '2025-07-08', 'active', NOW(), NOW()),
(@job3_id, @employer_id, 'Backend Developer', 'FinTech Startup', 'https://images.unsplash.com/photo-1729371568794-fb9c66ab09cf', 'Bangkok, Thailand', 'Full-time', 'Hybrid', '40,000 - 55,000 THB', 'Build secure and scalable financial services...', '["Strong Python skills", "Database expertise", "Security mindset"]', '["Fast growth", "Impact-driven", "Equity options"]', '2025-07-05', 'active', NOW(), NOW());

-- Add job skills
INSERT INTO job_skills (id, job_id, skill_name, created_at) VALUES
(UUID(), @job1_id, 'React', NOW()),
(UUID(), @job1_id, 'JavaScript', NOW()),
(UUID(), @job1_id, 'CSS', NOW()),
(UUID(), @job1_id, 'Figma', NOW()),
(UUID(), @job2_id, 'React', NOW()),
(UUID(), @job2_id, 'Node.js', NOW()),
(UUID(), @job2_id, 'MongoDB', NOW()),
(UUID(), @job2_id, 'AWS', NOW()),
(UUID(), @job3_id, 'Python', NOW()),
(UUID(), @job3_id, 'PostgreSQL', NOW()),
(UUID(), @job3_id, 'Docker', NOW()),
(UUID(), @job3_id, 'Kubernetes', NOW());

-- Create mentors
INSERT INTO mentors (id, name, title, company, avatar, expertise, languages, rating, sessions_count, bio, topics, availability, created_at, updated_at) VALUES
(UUID(), 'Dr. James Chen', 'Senior Software Engineer', 'Google', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7', '["Software Engineering", "System Design", "Career Growth"]', '["English", "Thai", "Chinese"]', 4.9, 127, '15+ years in tech, helped 100+ engineers advance their careers.', '["Technical interviews", "Career planning", "System design"]', 'Weekends', NOW(), NOW()),
(UUID(), 'Sarah Williams', 'Product Manager', 'Microsoft', 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd', '["Product Management", "UX Strategy", "Leadership"]', '["English", "Thai"]', 4.8, 89, 'Passionate about helping early-career professionals find their path.', '["Product thinking", "Stakeholder management", "Career transitions"]', 'Evenings', NOW(), NOW()),
(UUID(), 'Michael Rodriguez', 'Tech Lead', 'Amazon', 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg', '["Frontend Development", "Team Leadership", "Architecture"]', '["English", "Spanish"]', 4.9, 145, 'Building high-performance teams and scalable applications.', '["React/Frontend", "Technical leadership", "Interview prep"]', 'Flexible', NOW(), NOW());

-- Create courses
INSERT INTO courses (id, title, provider, instructor, duration, level, price, thumbnail, rating, students_count, topics, created_at, updated_at) VALUES
(UUID(), 'Advanced React Patterns', 'Frontend Masters', 'Kent C. Dodds', '8 hours', 'Advanced', 'Free with Premium', 'https://images.unsplash.com/photo-1633158834806-766387547d2c', 4.8, 12500, '["React", "Design Patterns", "Performance"]', NOW(), NOW()),
(UUID(), 'System Design Fundamentals', 'Coursera', 'Google Cloud', '6 weeks', 'Intermediate', '1,500 THB', 'https://images.unsplash.com/photo-1730382625230-3756013c515c', 4.9, 23400, '["Architecture", "Scalability", "System Design"]', NOW(), NOW()),
(UUID(), 'SQL for Data Analysis', 'Udemy', 'DataCamp', '12 hours', 'Beginner', '799 THB', 'https://images.unsplash.com/photo-1455849318743-b2233052fcff', 4.7, 45600, '["SQL", "Databases", "Analytics"]', NOW(), NOW());

-- Create events
INSERT INTO events (id, title, date, time, type, location, description, created_at, updated_at) VALUES
(UUID(), 'Tech Career Fair 2025', '2025-07-20', '14:00:00', 'Career Fair', 'Online', 'Connect with top tech companies hiring in Thailand', NOW(), NOW()),
(UUID(), 'Resume Workshop', '2025-07-18', '18:00:00', 'Workshop', 'Zoom', 'Learn how to craft an ATS-optimized resume', NOW(), NOW()),
(UUID(), 'Mock Interview Session', '2025-07-15', '10:00:00', 'Interview', 'Platform', 'Practice technical interviews with industry experts', NOW(), NOW());
```

**Note**: The password hash corresponds to: `password123`

### 4.2 Verify Data

```sql
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as job_count FROM jobs;
SELECT COUNT(*) as mentor_count FROM mentors;
SELECT COUNT(*) as course_count FROM courses;
SELECT COUNT(*) as event_count FROM events;
```

You should see:
- 2 users
- 3 jobs
- 3 mentors
- 3 courses
- 3 events

---

## Step 5: Start the Backend Server

```bash
cd /app/backend
npm run dev
```

You should see:
```
✅ Database connection established successfully
✅ Database models synchronized
🚀 Server running on http://localhost:3000
📝 Environment: development
🔗 API Base URL: http://localhost:3000/api
💚 Health Check: http://localhost:3000/api/health
```

---

## Step 6: Test the API

### 6.1 Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "database": "Connected"
}
```

### 6.2 Test Sign In
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.j@university.edu",
    "password": "password123"
  }' \
  -c cookies.txt
```

### 6.3 Get Jobs
```bash
curl http://localhost:3000/api/jobs
```

### 6.4 Get Authenticated User
```bash
curl http://localhost:3000/api/auth/me -b cookies.txt
```

---

## Step 7: Frontend Integration

### 7.1 Update Frontend to Use Backend

In your React frontend, create an `.env` file:

```bash
# /app/frontend/.env
REACT_APP_BACKEND_URL=http://localhost:3000/api
```

### 7.2 Create API Service

Create `/app/frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

### 7.3 Example API Calls

```javascript
// Sign in
import api from './services/api';

const signin = async (email, password) => {
  const response = await api.post('/auth/signin', { email, password });
  return response.data;
};

// Get jobs
const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

// Apply for job
const applyForJob = async (jobId, notes) => {
  const response = await api.post('/applications', { jobId, notes });
  return response.data;
};
```

---

## Troubleshooting

### Issue: Database Connection Failed

**Error**: `ECONNREFUSED 127.0.0.1:3306`

**Solution**:
1. Ensure MAMP is running
2. Check MySQL is started in MAMP
3. Verify port is 3306 in MAMP settings
4. Restart MAMP if needed

### Issue: Table Already Exists

**Error**: `Table 'users' already exists`

**Solution**: 
This is fine - tables were already created. Skip to Step 4 (Seed Database).

### Issue: Password Hash Not Working

**Error**: `Invalid email or password`

**Solution**:
The bcrypt hash in the SQL seed corresponds to `password123`. If you need a different password, generate a new hash using Node.js:

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your-password', 10);
console.log(hash);
```

Then update the SQL INSERT statement with the new hash.

### Issue: Port 3000 Already in Use

**Solution**:
```bash
# Change port in .env
PORT=3001

# Or kill the process using port 3000
lsof -i :3000
kill -9 <PID>
```

### Issue: CORS Errors from Frontend

**Solution**:
Ensure your frontend URL is set correctly in `.env`:
```
FRONTEND_URL=http://localhost:3001
```

And that you're making requests with `withCredentials: true` in axios.

---

## Test Credentials

After seeding:

**Student Account:**
- Email: `sarah.j@university.edu`
- Password: `password123`
- Role: Student

**Employer Account:**
- Email: `hr@techinnovations.com`
- Password: `password123`
- Role: Employer

---

## API Endpoints Summary

| Category | Endpoint | Method | Auth |
|----------|----------|--------|------|
| Health | `/api/health` | GET | ❌ |
| Auth | `/api/auth/signup` | POST | ❌ |
| Auth | `/api/auth/signin` | POST | ❌ |
| Auth | `/api/auth/signout` | POST | ✅ |
| Auth | `/api/auth/me` | GET | ✅ |
| Jobs | `/api/jobs` | GET | ❌ |
| Jobs | `/api/jobs/:id` | GET | ❌ |
| Jobs | `/api/jobs` | POST | ✅ (Employer) |
| Applications | `/api/applications` | GET | ✅ (Student) |
| Applications | `/api/applications` | POST | ✅ (Student) |
| Mentors | `/api/mentors` | GET | ❌ |
| Mentors | `/api/mentors/sessions` | POST | ✅ (Student) |
| Portfolio | `/api/portfolio/projects` | GET | ✅ (Student) |
| AI | `/api/ai/match-jobs` | POST | ✅ (Student) |
| AI | `/api/ai/analyze-resume` | POST | ✅ (Student) |

---

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend running
3. ✅ Test endpoints working
4. 🔄 Integrate with React frontend
5. 🔄 Test AI features (job matching, resume analysis)
6. 🔄 Deploy to production

---

## Support

For detailed API documentation, see:
- `/app/ARCHITECTURE.md` - Complete architecture
- `/app/backend/README.md` - Backend README
- `/app/backend/database-schema.sql` - Database schema

**Built with ❤️ for Stand Up Career Platform**
