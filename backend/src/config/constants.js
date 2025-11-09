const { v4: uuidv4 } = require('uuid');

// Sample employer UUID (you can replace with actual employer IDs from your database)
const employerId1 = uuidv4();
const employerId2 = uuidv4();
const employerId3 = uuidv4();

const dummyJobs = [
  {
    id: uuidv4(),
    employer_id: employerId1,
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    logo: 'https://via.placeholder.com/150?text=TechCorp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '$120,000 - $160,000',
    description: 'We are seeking an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
    requirements: [
      'JavaScript/TypeScript',
      'React',
      'Node.js',
      'PostgreSQL',
      'RESTful APIs',
      '5+ years experience',
      'Git version control'
    ],
    culture: [
      'Collaborative team environment',
      'Flexible work hours',
      'Professional development budget',
      'Health insurance',
      'Remote work options'
    ],
    posted_date: '2025-11-01',
    status: 'active'
  },
  {
    id: uuidv4(),
    employer_id: employerId1,
    title: 'Frontend Developer Intern',
    company: 'Digital Innovations',
    logo: 'https://via.placeholder.com/150?text=Digital',
    location: 'Austin, TX',
    type: 'Internship',
    mode: 'Onsite',
    salary: '$20 - $25/hour',
    description: 'Join our team as a Frontend Developer Intern and gain hands-on experience building user interfaces for cutting-edge web applications.',
    requirements: [
      'HTML/CSS',
      'JavaScript',
      'React or Vue.js',
      'Responsive design',
      'Currently pursuing CS degree',
      'Strong communication skills'
    ],
    culture: [
      'Mentorship program',
      'Learning opportunities',
      'Casual dress code',
      'Team lunch Fridays',
      'Modern office space'
    ],
    posted_date: '2025-11-03',
    status: 'active'
  },
  {
    id: uuidv4(),
    employer_id: employerId2,
    title: 'DevOps Engineer',
    company: 'CloudScale Systems',
    logo: 'https://via.placeholder.com/150?text=CloudScale',
    location: 'Seattle, WA',
    type: 'Full-time',
    mode: 'Remote',
    salary: '$130,000 - $170,000',
    description: 'Looking for a skilled DevOps Engineer to manage our cloud infrastructure and implement CI/CD pipelines. You will work with cutting-edge cloud technologies.',
    requirements: [
      'AWS/Azure/GCP',
      'Docker & Kubernetes',
      'CI/CD tools (Jenkins, GitLab)',
      'Infrastructure as Code (Terraform)',
      'Python or Bash scripting',
      '3+ years DevOps experience',
      'Linux system administration'
    ],
    culture: [
      'Fully remote',
      'Flexible schedule',
      'Annual team retreats',
      'Top-tier equipment',
      'Unlimited PTO'
    ],
    posted_date: '2025-10-28',
    status: 'active'
  },
  {
    id: uuidv4(),
    employer_id: employerId2,
    title: 'UI/UX Designer',
    company: 'Creative Studio Labs',
    logo: 'https://via.placeholder.com/150?text=Creative',
    location: 'New York, NY',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '$90,000 - $120,000',
    description: 'We need a talented UI/UX Designer to create beautiful and intuitive user experiences for our SaaS products. You will work closely with developers and product managers.',
    requirements: [
      'Figma/Sketch',
      'User research',
      'Wireframing & prototyping',
      'Design systems',
      'Portfolio required',
      '3+ years UI/UX experience',
      'Understanding of accessibility'
    ],
    culture: [
      'Creative freedom',
      'Design-focused culture',
      'Weekly design reviews',
      'Conference attendance',
      'Collaborative workspace'
    ],
    posted_date: '2025-11-02',
    status: 'active'
  },
  {
    id: uuidv4(),
    employer_id: employerId3,
    title: 'Backend Developer (Python)',
    company: 'DataDrive Inc',
    logo: 'https://via.placeholder.com/150?text=DataDrive',
    location: 'Boston, MA',
    type: 'Full-time',
    mode: 'Onsite',
    salary: '$110,000 - $140,000',
    description: 'Join our backend team to build scalable APIs and microservices. You will work on data-intensive applications that process millions of requests daily.',
    requirements: [
      'Python',
      'Django or FastAPI',
      'PostgreSQL/MongoDB',
      'RESTful & GraphQL APIs',
      'Redis/Celery',
      '4+ years backend experience',
      'Microservices architecture'
    ],
    culture: [
      'Data-driven decisions',
      'Code reviews',
      'Pair programming',
      '401k matching',
      'Learning stipend'
    ],
    posted_date: '2025-10-30',
    status: 'active'
  },
  {
    id: uuidv4(),
    employer_id: employerId3,
    title: 'Mobile Developer (React Native)',
    company: 'AppMakers Studio',
    logo: 'https://via.placeholder.com/150?text=AppMakers',
    location: 'Los Angeles, CA',
    type: 'Contract',
    mode: 'Remote',
    salary: '$80 - $100/hour',
    description: 'Contract position for an experienced React Native developer to build cross-platform mobile applications for our clients. 6-month contract with potential for extension.',
    requirements: [
      'React Native',
      'JavaScript/TypeScript',
      'iOS & Android deployment',
      'Redux or MobX',
      'RESTful API integration',
      '3+ years mobile development',
      'App Store & Play Store experience'
    ],
    culture: [
      'Remote-first',
      'Flexible hours',
      'Direct client interaction',
      'Autonomy in work',
      'Competitive hourly rate'
    ],
    posted_date: '2025-11-04',
    status: 'active'
  },
  {
    id: uuidv4(),
    employer_id: employerId1,
    title: 'Data Scientist',
    company: 'AI Innovations Lab',
    logo: 'https://via.placeholder.com/150?text=AILab',
    location: 'Chicago, IL',
    type: 'Full-time',
    mode: 'Hybrid',
    salary: '$115,000 - $150,000',
    description: 'Seeking a Data Scientist to develop machine learning models and extract insights from large datasets. You will work on predictive analytics and AI-driven solutions.',
    requirements: [
      'Python',
      'Machine Learning (scikit-learn, TensorFlow)',
      'SQL & data analysis',
      'Statistics & probability',
      'Data visualization (Matplotlib, Tableau)',
      'PhD or Masters preferred',
      'Research experience'
    ],
    culture: [
      'Research-oriented',
      'Publication opportunities',
      'GPU infrastructure',
      'Conference sponsorship',
      'Collaborative research teams'
    ],
    posted_date: '2025-11-05',
    status: 'active'
  },
  {
    id: uuidv4(),
    employer_id: employerId2,
    title: 'QA Automation Engineer',
    company: 'TestRight Solutions',
    logo: 'https://via.placeholder.com/150?text=TestRight',
    location: 'Denver, CO',
    type: 'Full-time',
    mode: 'Remote',
    salary: '$95,000 - $125,000',
    description: 'We are looking for a QA Automation Engineer to design and implement automated testing frameworks. You will ensure quality across our web and mobile applications.',
    requirements: [
      'Selenium/Cypress',
      'JavaScript or Python',
      'Test automation frameworks',
      'CI/CD integration',
      'API testing (Postman)',
      '3+ years QA experience',
      'Agile methodology'
    ],
    culture: [
      'Quality-first mindset',
      'Remote work',
      'Work-life balance',
      'Professional certifications',
      'Career growth paths'
    ],
    posted_date: '2025-10-29',
    status: 'active'
  },
  {
    id: uuidv4(),
    employer_id: employerId3,
    title: 'Junior Software Engineer',
    company: 'StartupHub Tech',
    logo: 'https://via.placeholder.com/150?text=StartupHub',
    location: 'Miami, FL',
    type: 'Full-time',
    mode: 'Onsite',
    salary: '$70,000 - $85,000',
    description: 'Perfect role for recent graduates or career changers. You will work alongside senior engineers to develop web applications and learn best practices.',
    requirements: [
      'JavaScript',
      'HTML/CSS',
      'Basic understanding of frameworks (React/Vue)',
      'Git',
      'Problem-solving skills',
      '0-2 years experience',
      'CS degree or bootcamp graduate'
    ],
    culture: [
      'Mentorship program',
      'Training opportunities',
      'Startup environment',
      'Fast-paced learning',
      'Equity options'
    ],
    posted_date: '2025-11-06',
    status: 'active'
  },
  {
    id: uuidv4(),
    employer_id: employerId1,
    title: 'Cybersecurity Analyst',
    company: 'SecureNet Systems',
    logo: 'https://via.placeholder.com/150?text=SecureNet',
    location: 'Washington, DC',
    type: 'Part-time',
    mode: 'Hybrid',
    salary: '$50 - $70/hour',
    description: 'Part-time position for a Cybersecurity Analyst to monitor security systems, conduct vulnerability assessments, and respond to security incidents.',
    requirements: [
      'Network security',
      'SIEM tools',
      'Penetration testing',
      'Security certifications (CISSP, CEH)',
      'Incident response',
      '2+ years security experience',
      'Risk assessment'
    ],
    culture: [
      'Security-first culture',
      'Continuous learning',
      'Certification reimbursement',
      'Flexible part-time hours',
      'Important mission'
    ],
    posted_date: '2025-11-01',
    status: 'active'
  }
];

module.exports = {
  dummyJobs
};