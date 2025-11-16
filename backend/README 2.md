# Stand Up Backend API

Complete backend API for the Stand Up career platform, built with Node.js, Express, MySQL, and Gemini AI.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

## ✨ Features

- 🔐 Session-based authentication with MySQL session store
- 🤖 AI-powered job matching using Google Gemini
- 💼 Complete job board with advanced filtering
- 📊 Application tracking with Kanban workflow
- 👨‍🏫 Mentor booking system
- 📁 Portfolio & resume builder
- 📚 Learning platform (courses & events)
- 🔒 Role-based access control (Student/Employer/Admin)
- ✅ Request validation with express-validator
- 🚀 Rate limiting for API protection
- 🛡️ Security headers with helmet.js

## 🛠 Tech Stack

- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express.js 4.x
- **Database**: MySQL 8.0 (via MAMP)
- **ORM**: Sequelize 6.x
- **AI**: Google Generative AI (Gemini)
- **Authentication**: express-session + bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limit

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **MAMP** (for MySQL database)
   - Download from: https://www.mamp.info/
   - Ensure MySQL is running on port 3306
   - phpMyAdmin should be accessible at http://localhost:8888/phpMyAdmin5/

3. **Yarn** (package manager)
   ```bash
   npm install -g yarn
   ```

## 🚀 Installation

### Step 1: Clone and Navigate

```bash
cd /app/backend
```

### Step 2: Install Dependencies

```bash
yarn install
```

This will install all required packages including:
- express, sequelize, mysql2
- bcrypt, express-session, express-validator
- @google/generative-ai
- cors, helmet, morgan, rate-limit

### Step 3: Environment Configuration

The `.env` file is already configured with your Gemini API key. Verify the settings:

```bash
cat .env
```

**Key configurations:**
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=root`
- `DB_NAME=standup_db`
- `GEMINI_API_KEY=AIzaSyBoswzYYxdFT6w6F_IOF1MDGqmu-G_bxKI`
- `PORT=3000`

## 🗄️ Database Setup

### Step 1: Create Database

1. Open phpMyAdmin: http://localhost:8888/phpMyAdmin5/
2. Click "New" in the left sidebar
3. Database name: `standup_db`
4. Collation: `utf8mb4_general_ci`
5. Click "Create"

### Step 2: Run Migrations

Create all database tables:

```bash
npm run migrate
```

This will create the following tables:
- users
- jobs, job_skills
- applications
- mentors, mentor_sessions
- projects
- courses, events
- saved_jobs
- career_roadmap
- sessions (for express-session)

### Step 3: Seed Database

Populate with demo data:

```bash
npm run seed
```

This creates:
- 2 users (student + employer)
- 3 jobs with skills
- 3 mentors
- 3 courses
- 3 events
- Career roadmap for student

**Test Credentials:**
- **Student**: `sarah.j@university.edu` / `password123`
- **Employer**: `hr@techinnovations.com` / `password123`

## ▶️ Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on **http://localhost:3000**

**You should see:**
```
✅ Database connection established successfully
✅ Database models synchronized
🚀 Server running on http://localhost:3000
📝 Environment: development
🔗 API Base URL: http://localhost:3000/api
💚 Health Check: http://localhost:3000/api/health
```

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "database": "Connected",
  "timestamp": "2025-07-14T..."
}
```

### Authentication Flow

#### 1. Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123",
    "name": "Test User",
    "role": "student"
  }' \
  -c cookies.txt
```

#### 2. Sign In
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.j@university.edu",
    "password": "password123"
  }' \
  -c cookies.txt
```

#### 3. Get Current User
```bash
curl http://localhost:3000/api/auth/me -b cookies.txt
```

### Job Endpoints

#### Get All Jobs
```bash
curl http://localhost:3000/api/jobs
```

#### Get Jobs with Filters
```bash
curl "http://localhost:3000/api/jobs?search=frontend&modes=Remote&types=Internship"
```

#### Get Single Job
```bash
curl http://localhost:3000/api/jobs/{job-id}
```

### Application Endpoints (Student Only)

#### Apply for Job
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "jobId": "job-uuid-here",
    "notes": "Very interested in this position"
  }'
```

#### Get My Applications
```bash
curl http://localhost:3000/api/applications -b cookies.txt
```

### AI-Powered Features

#### Get Job Matches
```bash
curl -X POST http://localhost:3000/api/ai/match-jobs \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "skills": ["React", "Node.js", "Python"],
    "desiredRoles": ["Frontend Developer"],
    "experienceLevel": "entry-level"
  }'
```

#### Analyze Resume
```bash
curl -X POST http://localhost:3000/api/ai/analyze-resume \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "resumeText": "John Doe\nFrontend Developer\n...",
    "targetRole": "Frontend Developer"
  }'
```

## 📁 Project Structure

```
/app/backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Sequelize configuration
│   │   └── gemini.js        # Gemini AI configuration
│   ├── models/              # Sequelize models
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── Mentor.js
│   │   └── index.js
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── aiController.js
│   │   └── ...
│   ├── middlewares/         # Custom middleware
│   │   ├── auth.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   └── ...
│   ├── migrations/          # Database migrations
│   │   └── run-migrations.js
│   ├── seeders/             # Database seeders
│   │   └── run-seeders.js
│   └── app.js               # Express application
├── .env                     # Environment variables
├── .env.example             # Example environment file
├── package.json             # Dependencies
└── README.md                # This file
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `root` |
| `DB_NAME` | Database name | `standup_db` |
| `SESSION_SECRET` | Session secret key | Random string |
| `SESSION_NAME` | Session cookie name | `standup.sid` |
| `SESSION_MAX_AGE` | Session duration (ms) | `86400000` (24h) |
| `GEMINI_API_KEY` | Google Gemini API key | Your key |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3001` |

## 📚 API Documentation

Complete API documentation is available in `/app/ARCHITECTURE.md`

### Base URL
```
http://localhost:3000/api
```

### Main Endpoints

| Category | Method | Endpoint | Auth Required |
|----------|--------|----------|---------------|
| **Auth** | POST | `/auth/signup` | ❌ |
| | POST | `/auth/signin` | ❌ |
| | POST | `/auth/signout` | ✅ |
| | GET | `/auth/me` | ✅ |
| **Jobs** | GET | `/jobs` | ❌ |
| | GET | `/jobs/:id` | ❌ |
| | POST | `/jobs` | ✅ (Employer) |
| **Applications** | GET | `/applications` | ✅ (Student) |
| | POST | `/applications` | ✅ (Student) |
| **Mentors** | GET | `/mentors` | ❌ |
| | POST | `/mentors/sessions` | ✅ (Student) |
| **Portfolio** | GET | `/portfolio/projects` | ✅ (Student) |
| | POST | `/portfolio/projects` | ✅ (Student) |
| **AI** | POST | `/ai/match-jobs` | ✅ (Student) |
| | POST | `/ai/analyze-resume` | ✅ (Student) |

## 🐛 Troubleshooting

### Database Connection Failed

**Issue**: `SequelizeConnectionError`

**Solution**:
1. Ensure MAMP MySQL is running
2. Verify credentials in `.env`
3. Check MySQL port (should be 3306)
4. Test connection in phpMyAdmin

### Port Already in Use

**Issue**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=3001
```

### Gemini AI Errors

**Issue**: AI features not working

**Solution**:
1. Verify API key is correct in `.env`
2. Check API quota: https://makersuite.google.com/app/apikey
3. Ensure internet connection
4. Review rate limiting settings

### Session Issues

**Issue**: Session not persisting / "UNAUTHORIZED" errors

**Solution**:
1. Check if `sessions` table exists in database
2. Clear browser cookies
3. Verify SESSION_SECRET is set
4. Restart server after .env changes

## 🔒 Security Notes

1. **Change SESSION_SECRET** in production
2. Use **HTTPS** in production (set `cookie.secure = true`)
3. **Never commit** `.env` file to version control
4. Implement **rate limiting** for public endpoints
5. Regular **security updates** for dependencies

## 📞 Support

For issues or questions:
1. Check `/app/ARCHITECTURE.md` for detailed architecture
2. Review this README for setup instructions
3. Check server logs for errors
4. Verify database connections in phpMyAdmin

## 📝 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for Stand Up Career Platform**
