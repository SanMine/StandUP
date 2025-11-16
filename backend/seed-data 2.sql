-- MySQL syntax - seed data for StandUP platform
USE standup_db;

-- Create UUIDs for users
SET @student_id = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
SET @employer_id = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';

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