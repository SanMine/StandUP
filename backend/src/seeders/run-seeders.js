const {
  User,
  Job,
  JobSkill,
  UserSkill,
  Mentor,
  Course,
  Event,
  CareerRoadmap
} = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      console.log('   To reseed, truncate tables first or drop and recreate database.');
      process.exit(0);
    }

    // Create users
    console.log('👤 Creating users...');
    const studentUser = await User.create({
      email: 'sarah.j@university.edu',
      password: 'password123',
      name: 'Sarah Johnson',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd',
      profile_strength: 78,
      graduation: '2025-06-15',
      bio: 'Computer Science student passionate about building user-centric applications.'
    });

    const employerUser = await User.create({
      email: 'hr@techinnovations.com',
      password: 'password123',
      name: 'Tech Innovations HR',
      role: 'employer',
      avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
      company_name: 'Tech Innovations Ltd.',
      company_size: '50-200',
      industry: 'Technology'
    });

    // Add user skills
    console.log('🎯 Adding user skills...');
    const studentSkills = ['React', 'Node.js', 'Python', 'SQL', 'Figma'];
    for (const skill of studentSkills) {
      await UserSkill.create({
        user_id: studentUser.id,
        skill_name: skill
      });
    }

    // Create career roadmap
    console.log('🗺️  Creating career roadmap...');
    const roadmapSteps = [
      { title: 'Complete Your Profile', status: 'completed', completed_date: '2025-06-15', order: 1 },
      { title: 'Build Your Resume', status: 'completed', completed_date: '2025-06-20', order: 2 },
      { title: 'Add Portfolio Projects', status: 'in-progress', completed_date: null, order: 3 },
      { title: 'Complete Mock Interview', status: 'pending', completed_date: null, order: 4 },
      { title: 'Apply to 5 Jobs', status: 'pending', completed_date: null, order: 5 }
    ];

    for (const step of roadmapSteps) {
      await CareerRoadmap.create({
        user_id: studentUser.id,
        ...step
      });
    }

    // Create jobs
    console.log('💼 Creating jobs...');
    const jobs = [
      {
        employer_id: employerUser.id,
        title: 'Frontend Developer Intern',
        company: 'Tech Innovations',
        logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
        location: 'Bangkok, Thailand',
        type: 'Internship',
        mode: 'Hybrid',
        salary: '15,000 - 20,000 THB',
        description: 'Join our dynamic team to build cutting-edge web applications...',
        requirements: ['Currently pursuing CS degree', '6+ months React experience', 'Portfolio with live projects'],
        culture: ['Fast-paced', 'Innovation-driven', 'Collaborative'],
        posted_date: '2025-07-10',
        status: 'active',
        skills: ['React', 'JavaScript', 'CSS', 'Figma']
      },
      {
        employer_id: employerUser.id,
        title: 'Full Stack Developer',
        company: 'Digital Solutions Co.',
        logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
        location: 'Remote',
        type: 'Full-time',
        mode: 'Remote',
        salary: '35,000 - 45,000 THB',
        description: 'Build scalable applications for enterprise clients...',
        requirements: ['1+ year experience', 'Full stack skills', 'Agile experience'],
        culture: ['Remote-first', 'Work-life balance', 'Learning culture'],
        posted_date: '2025-07-08',
        status: 'active',
        skills: ['React', 'Node.js', 'MongoDB', 'AWS']
      },
      {
        employer_id: employerUser.id,
        title: 'Backend Developer',
        company: 'FinTech Startup',
        logo: 'https://images.unsplash.com/photo-1729371568794-fb9c66ab09cf',
        location: 'Bangkok, Thailand',
        type: 'Full-time',
        mode: 'Hybrid',
        salary: '40,000 - 55,000 THB',
        description: 'Build secure and scalable financial services...',
        requirements: ['Strong Python skills', 'Database expertise', 'Security mindset'],
        culture: ['Fast growth', 'Impact-driven', 'Equity options'],
        posted_date: '2025-07-05',
        status: 'active',
        skills: ['Python', 'PostgreSQL', 'Docker', 'Kubernetes']
      }
    ];

    for (const jobData of jobs) {
      const { skills, ...jobInfo } = jobData;
      const job = await Job.create(jobInfo);
      
      // Add job skills
      for (const skill of skills) {
        await JobSkill.create({
          job_id: job.id,
          skill_name: skill
        });
      }
    }

    // Create mentors
    console.log('👨‍🏫 Creating mentors...');
    const mentors = [
      {
        name: 'Dr. James Chen',
        title: 'Senior Software Engineer',
        company: 'Google',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
        expertise: ['Software Engineering', 'System Design', 'Career Growth'],
        languages: ['English', 'Thai', 'Chinese'],
        rating: 4.9,
        sessions_count: 127,
        bio: '15+ years in tech, helped 100+ engineers advance their careers.',
        topics: ['Technical interviews', 'Career planning', 'System design'],
        availability: 'Weekends'
      },
      {
        name: 'Sarah Williams',
        title: 'Product Manager',
        company: 'Microsoft',
        avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd',
        expertise: ['Product Management', 'UX Strategy', 'Leadership'],
        languages: ['English', 'Thai'],
        rating: 4.8,
        sessions_count: 89,
        bio: 'Passionate about helping early-career professionals find their path.',
        topics: ['Product thinking', 'Stakeholder management', 'Career transitions'],
        availability: 'Evenings'
      },
      {
        name: 'Michael Rodriguez',
        title: 'Tech Lead',
        company: 'Amazon',
        avatar: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg',
        expertise: ['Frontend Development', 'Team Leadership', 'Architecture'],
        languages: ['English', 'Spanish'],
        rating: 4.9,
        sessions_count: 145,
        bio: 'Building high-performance teams and scalable applications.',
        topics: ['React/Frontend', 'Technical leadership', 'Interview prep'],
        availability: 'Flexible'
      }
    ];

    for (const mentor of mentors) {
      await Mentor.create(mentor);
    }

    // Create courses
    console.log('📚 Creating courses...');
    const courses = [
      {
        title: 'Advanced React Patterns',
        provider: 'Frontend Masters',
        instructor: 'Kent C. Dodds',
        duration: '8 hours',
        level: 'Advanced',
        price: 'Free with Premium',
        thumbnail: 'https://images.unsplash.com/photo-1633158834806-766387547d2c',
        rating: 4.8,
        students_count: 12500,
        topics: ['React', 'Design Patterns', 'Performance']
      },
      {
        title: 'System Design Fundamentals',
        provider: 'Coursera',
        instructor: 'Google Cloud',
        duration: '6 weeks',
        level: 'Intermediate',
        price: '1,500 THB',
        thumbnail: 'https://images.unsplash.com/photo-1730382625230-3756013c515c',
        rating: 4.9,
        students_count: 23400,
        topics: ['Architecture', 'Scalability', 'System Design']
      },
      {
        title: 'SQL for Data Analysis',
        provider: 'Udemy',
        instructor: 'DataCamp',
        duration: '12 hours',
        level: 'Beginner',
        price: '799 THB',
        thumbnail: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff',
        rating: 4.7,
        students_count: 45600,
        topics: ['SQL', 'Databases', 'Analytics']
      }
    ];

    for (const course of courses) {
      await Course.create(course);
    }

    // Create events
    console.log('📅 Creating events...');
    const events = [
      {
        title: 'Tech Career Fair 2025',
        date: '2025-07-20',
        time: '14:00:00',
        type: 'Career Fair',
        location: 'Online',
        description: 'Connect with top tech companies hiring in Thailand'
      },
      {
        title: 'Resume Workshop',
        date: '2025-07-18',
        time: '18:00:00',
        type: 'Workshop',
        location: 'Zoom',
        description: 'Learn how to craft an ATS-optimized resume'
      },
      {
        title: 'Mock Interview Session',
        date: '2025-07-15',
        time: '10:00:00',
        type: 'Interview',
        location: 'Platform',
        description: 'Practice technical interviews with industry experts'
      }
    ];

    for (const event of events) {
      await Event.create(event);
    }

    console.log('');
    console.log('✅ Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${await User.count()}`);
    console.log(`   - Jobs: ${await Job.count()}`);
    console.log(`   - Mentors: ${await Mentor.count()}`);
    console.log(`   - Courses: ${await Course.count()}`);
    console.log(`   - Events: ${await Event.count()}`);
    console.log('');
    console.log('🔑 Test credentials:');
    console.log('   Student: sarah.j@university.edu / password123');
    console.log('   Employer: hr@techinnovations.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
