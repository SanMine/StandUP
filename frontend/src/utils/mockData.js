// Mock data for Stand Up platform

export const users = {
  student: {
    id: 'student-1',
    name: 'Sarah Johnson',
    email: 'sarah.j@university.edu',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd',
    role: 'student',
    profileStrength: 78,
    skills: ['React', 'Node.js', 'Python', 'SQL', 'Figma'],
    desiredRoles: ['Frontend Developer', 'Full Stack Developer'],
    graduation: '2025-06',
    bio: 'Computer Science student passionate about building user-centric applications.'
  },
  employer: {
    id: 'employer-1',
    name: 'Tech Innovations Ltd.',
    email: 'hr@techinnovations.com',
    avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
    role: 'employer',
    companySize: '50-200',
    industry: 'Technology'
  }
};

export const jobs = [
  {
    id: 'job-1',
    title: 'Frontend Developer Intern',
    company: 'Tech Innovations',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
    location: 'Bangkok, Thailand',
    type: 'Internship',
    mode: 'Hybrid',
    salary: '15,000 - 20,000 THB',
    matchScore: 92,
    skills: ['React', 'JavaScript', 'CSS', 'Figma'],
    postedDate: '2025-07-10',
    description: 'Join our dynamic team to build cutting-edge web applications...',
    requirements: ['Currently pursuing CS degree', '6+ months React experience', 'Portfolio with live projects'],
    whyMatch: ['Strong skills in React, JavaScript', 'Portfolio shows relevant projects', 'Location preference matches'],
    whyNotMatch: ['Docker experience needed'],
    culture: ['Fast-paced', 'Innovation-driven', 'Collaborative']
  },
  {
    id: 'job-2',
    title: 'Full Stack Developer',
    company: 'Digital Solutions Co.',
    logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    location: 'Remote',
    type: 'Full-time',
    mode: 'Remote',
    salary: '35,000 - 45,000 THB',
    matchScore: 85,
    skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
    postedDate: '2025-07-08',
    description: 'Build scalable applications for enterprise clients...',
    requirements: ['1+ year experience', 'Full stack skills', 'Agile experience'],
    whyMatch: ['React and Node.js skills match', 'Remote work preference'],
    whyNotMatch: ['Need more AWS experience', 'Requires 1+ year experience'],
    culture: ['Remote-first', 'Work-life balance', 'Learning culture']
  },
  {
    id: 'job-3',
    title: 'UI/UX Designer Intern',
    company: 'Creative Studio',
    logo: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
    location: 'Chiang Mai, Thailand',
    type: 'Internship',
    mode: 'Onsite',
    salary: '12,000 - 18,000 THB',
    matchScore: 68,
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    postedDate: '2025-07-12',
    description: 'Design beautiful and intuitive user experiences...',
    requirements: ['Figma proficiency', 'Portfolio required', 'User-centric mindset'],
    whyMatch: ['Figma skill matches'],
    whyNotMatch: ['Primary focus is development', 'Location preference different'],
    culture: ['Creative', 'Flexible hours', 'Design-focused']
  },
  {
    id: 'job-4',
    title: 'Backend Developer',
    company: 'FinTech Startup',
    logo: 'https://images.unsplash.com/photo-1729371568794-fb9c66ab09cf',
    location: 'Bangkok, Thailand',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '40,000 - 55,000 THB',
    matchScore: 79,
    skills: ['Python', 'PostgreSQL', 'Docker', 'Kubernetes'],
    postedDate: '2025-07-05',
    description: 'Build secure and scalable financial services...',
    requirements: ['Strong Python skills', 'Database expertise', 'Security mindset'],
    whyMatch: ['Python and SQL skills', 'Bangkok location match'],
    whyNotMatch: ['Need Docker/Kubernetes experience', 'FinTech experience preferred'],
    culture: ['Fast growth', 'Impact-driven', 'Equity options']
  },
  {
    id: 'job-5',
    title: 'Mobile App Developer',
    company: 'App Factory',
    logo: 'https://images.unsplash.com/photo-1543269865-cbf427effbad',
    location: 'Remote',
    type: 'Internship',
    mode: 'Remote',
    salary: '18,000 - 25,000 THB',
    matchScore: 71,
    skills: ['React Native', 'JavaScript', 'Mobile UI'],
    postedDate: '2025-07-11',
    description: 'Create mobile experiences for iOS and Android...',
    requirements: ['React or React Native experience', 'Mobile-first mindset'],
    whyMatch: ['React experience transferable', 'Remote work'],
    whyNotMatch: ['No mobile development experience yet'],
    culture: ['Mobile-first', 'Agile', 'Startup vibe']
  },
  {
    id: 'job-6',
    title: 'Data Analyst Intern',
    company: 'Analytics Corp',
    logo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    location: 'Bangkok, Thailand',
    type: 'Internship',
    mode: 'Onsite',
    salary: '15,000 - 20,000 THB',
    matchScore: 65,
    skills: ['Python', 'SQL', 'Excel', 'Tableau'],
    postedDate: '2025-07-09',
    description: 'Analyze data to drive business decisions...',
    requirements: ['SQL skills', 'Python for data analysis', 'Analytical mindset'],
    whyMatch: ['Python and SQL skills'],
    whyNotMatch: ['No data analysis experience', 'Different career focus'],
    culture: ['Data-driven', 'Learning environment', 'Mentorship']
  }
];

export const mentors = [
  {
    id: 'mentor-1',
    name: 'Dr. James Chen',
    title: 'Senior Software Engineer',
    company: 'Google',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    expertise: ['Software Engineering', 'System Design', 'Career Growth'],
    languages: ['English', 'Thai', 'Chinese'],
    rating: 4.9,
    sessions: 127,
    bio: '15+ years in tech, helped 100+ engineers advance their careers.',
    topics: ['Technical interviews', 'Career planning', 'System design'],
    availability: 'Weekends'
  },
  {
    id: 'mentor-2',
    name: 'Sarah Williams',
    title: 'Product Manager',
    company: 'Microsoft',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd',
    expertise: ['Product Management', 'UX Strategy', 'Leadership'],
    languages: ['English', 'Thai'],
    rating: 4.8,
    sessions: 89,
    bio: 'Passionate about helping early-career professionals find their path.',
    topics: ['Product thinking', 'Stakeholder management', 'Career transitions'],
    availability: 'Evenings'
  },
  {
    id: 'mentor-3',
    name: 'Michael Rodriguez',
    title: 'Tech Lead',
    company: 'Amazon',
    avatar: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg',
    expertise: ['Frontend Development', 'Team Leadership', 'Architecture'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    sessions: 145,
    bio: 'Building high-performance teams and scalable applications.',
    topics: ['React/Frontend', 'Technical leadership', 'Interview prep'],
    availability: 'Flexible'
  },
  {
    id: 'mentor-4',
    name: 'Priya Sharma',
    title: 'Data Science Manager',
    company: 'Meta',
    avatar: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc',
    expertise: ['Data Science', 'Machine Learning', 'Analytics'],
    languages: ['English', 'Hindi', 'Thai'],
    rating: 4.7,
    sessions: 72,
    bio: 'Helping aspiring data scientists break into the field.',
    topics: ['ML fundamentals', 'Data career paths', 'Technical skills'],
    availability: 'Weekdays'
  }
];

export const applications = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Frontend Developer Intern',
    company: 'Tech Innovations',
    status: 'interview',
    appliedDate: '2025-07-01',
    lastUpdate: '2025-07-08',
    notes: 'Technical interview scheduled for July 15'
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Full Stack Developer',
    company: 'Digital Solutions Co.',
    status: 'screening',
    appliedDate: '2025-07-05',
    lastUpdate: '2025-07-06',
    notes: 'HR screening completed, awaiting technical round'
  },
  {
    id: 'app-3',
    jobId: 'job-5',
    jobTitle: 'Mobile App Developer',
    company: 'App Factory',
    status: 'applied',
    appliedDate: '2025-07-10',
    lastUpdate: '2025-07-10',
    notes: 'Application submitted'
  }
];

export const savedJobs = [
  {
    id: 'saved-1',
    jobId: 'job-3',
    savedDate: '2025-07-08'
  },
  {
    id: 'saved-2',
    jobId: 'job-4',
    savedDate: '2025-07-12'
  }
];

export const courses = [
  {
    id: 'course-1',
    title: 'Advanced React Patterns',
    provider: 'Frontend Masters',
    instructor: 'Kent C. Dodds',
    duration: '8 hours',
    level: 'Advanced',
    price: 'Free with Premium',
    thumbnail: 'https://images.unsplash.com/photo-1633158834806-766387547d2c',
    rating: 4.8,
    students: 12500,
    topics: ['React', 'Design Patterns', 'Performance']
  },
  {
    id: 'course-2',
    title: 'System Design Fundamentals',
    provider: 'Coursera',
    instructor: 'Google Cloud',
    duration: '6 weeks',
    level: 'Intermediate',
    price: '1,500 THB',
    thumbnail: 'https://images.unsplash.com/photo-1730382625230-3756013c515c',
    rating: 4.9,
    students: 23400,
    topics: ['Architecture', 'Scalability', 'System Design']
  },
  {
    id: 'course-3',
    title: 'SQL for Data Analysis',
    provider: 'Udemy',
    instructor: 'DataCamp',
    duration: '12 hours',
    level: 'Beginner',
    price: '799 THB',
    thumbnail: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff',
    rating: 4.7,
    students: 45600,
    topics: ['SQL', 'Databases', 'Analytics']
  }
];

export const mockInterviewQuestions = [
  {
    id: 'q-1',
    category: 'Frontend Developer',
    question: 'Explain the virtual DOM and how React uses it for performance optimization.',
    difficulty: 'Medium',
    duration: '3-5 min'
  },
  {
    id: 'q-2',
    category: 'Frontend Developer',
    question: 'Walk me through how you would optimize a slow-loading web application.',
    difficulty: 'Medium',
    duration: '5-7 min'
  },
  {
    id: 'q-3',
    category: 'Behavioral',
    question: 'Tell me about a time you had to learn a new technology quickly.',
    difficulty: 'Easy',
    duration: '3-4 min'
  },
  {
    id: 'q-4',
    category: 'Frontend Developer',
    question: 'What is the difference between controlled and uncontrolled components in React?',
    difficulty: 'Easy',
    duration: '2-3 min'
  }
];

export const upcomingEvents = [
  {
    id: 'event-1',
    title: 'Tech Career Fair 2025',
    date: '2025-07-20',
    time: '14:00',
    type: 'Career Fair',
    location: 'Online'
  },
  {
    id: 'event-2',
    title: 'Resume Workshop',
    date: '2025-07-18',
    time: '18:00',
    type: 'Workshop',
    location: 'Zoom'
  },
  {
    id: 'event-3',
    title: 'Mock Interview Session',
    date: '2025-07-15',
    time: '10:00',
    type: 'Interview',
    location: 'Platform'
  }
];

export const testimonials = [
  {
    id: 'test-1',
    name: 'Alex Thompson',
    role: 'Software Engineer at Google',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    content: 'Stand Up helped me land my dream job! The mock interviews and mentor guidance were invaluable.',
    rating: 5
  },
  {
    id: 'test-2',
    name: 'Maria Garcia',
    role: 'Product Designer at Microsoft',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd',
    content: 'The AI matching feature connected me with opportunities I never would have found on my own.',
    rating: 5
  },
  {
    id: 'test-3',
    name: 'David Kim',
    role: 'Data Analyst at Amazon',
    avatar: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg',
    content: 'From student to professional in 3 months. Stand Up made the journey smooth and supported.',
    rating: 5
  }
];

export const partnerCompanies = [
  { name: 'Google', logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0' },
  { name: 'Microsoft', logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c' },
  { name: 'Amazon', logo: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952' },
  { name: 'Meta', logo: 'https://images.unsplash.com/photo-1729371568794-fb9c66ab09cf' },
  { name: 'Apple', logo: 'https://images.unsplash.com/photo-1543269865-cbf427effbad' },
  { name: 'Netflix', logo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7' }
];

export const careerRoadmap = [
  {
    id: 'step-1',
    title: 'Complete Your Profile',
    status: 'completed',
    date: '2025-06-15'
  },
  {
    id: 'step-2',
    title: 'Build Your Resume',
    status: 'completed',
    date: '2025-06-20'
  },
  {
    id: 'step-3',
    title: 'Add Portfolio Projects',
    status: 'in-progress',
    date: null
  },
  {
    id: 'step-4',
    title: 'Complete Mock Interview',
    status: 'pending',
    date: null
  },
  {
    id: 'step-5',
    title: 'Apply to 5 Jobs',
    status: 'pending',
    date: null
  }
];
