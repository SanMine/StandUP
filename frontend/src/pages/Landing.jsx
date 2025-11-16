import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { CheckCircle2, Target, Users, TrendingUp, Award, Sparkles, ArrowRight, Star, Settings as SettingsIcon, LogOut, LayoutDashboard, Briefcase, GraduationCap, BookOpen, Users2, Award as AwardIcon, FolderKanban, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Crown } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);
  const { user, signout } = useAuth();

  const handleSignOut = async () => {
    try {
      await signout();
      navigate('/');
    } catch (err) {
      navigate('/');
    }
  };

  // Static data for better performance
  const featuredJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      logo: 'https://ui-avatars.com/api/?name=TC&background=4F46E5&color=fff&size=48',
      type: 'Full-time',
      location: 'Remote',
      salary: '$80k - $120k',
      skills: ['React.js', 'TypeScript', 'Node.js', 'GraphQL']
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      company: 'DesignHub',
      logo: 'https://ui-avatars.com/api/?name=DH&background=EC4899&color=fff&size=48',
      type: 'Full-time',
      location: 'Bangkok',
      salary: '$60k - $90k',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping']
    },
    {
      id: 3,
      title: 'Software Engineering Intern',
      company: 'StartupXYZ',
      logo: 'https://ui-avatars.com/api/?name=SX&background=10B981&color=fff&size=48',
      type: 'Internship',
      location: 'Hybrid',
      salary: '$2k - $3k/month',
      skills: ['Python', 'Django', 'REST API', 'PostgreSQL']
    }
  ];

  const featuredMentors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Software Engineer',
      company: 'Google',
      avatar: 'https://i.pravatar.cc/150?img=5',
      rating: 4.9,
      sessions: 127,
      expertise: ['Career Planning', 'Technical Interviews']
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Product Manager',
      company: 'Microsoft',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 4.8,
      sessions: 98,
      expertise: ['Product Strategy', 'Leadership']
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'UX Design Lead',
      company: 'Apple',
      avatar: 'https://i.pravatar.cc/150?img=9',
      rating: 5.0,
      sessions: 156,
      expertise: ['Design Thinking', 'Portfolio Review']
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Alex Thompson',
      role: 'Software Engineer at Meta',
      avatar: 'https://i.pravatar.cc/150?img=33',
      content: 'Stand Up completely transformed my job search. The AI matching connected me with opportunities I never would have found on my own, and the mentor sessions gave me the confidence I needed to ace my interviews.'
    },
    {
      id: 2,
      name: 'Priya Patel',
      role: 'Product Designer at Adobe',
      avatar: 'https://i.pravatar.cc/150?img=45',
      content: 'The personalized guidance and portfolio hosting features were game-changers for me. I landed my dream job within two months of joining Stand Up. Highly recommend to any student serious about their career!'
    },
    {
      id: 3,
      name: 'David Kim',
      role: 'Data Analyst at Amazon',
      avatar: 'https://i.pravatar.cc/150?img=15',
      content: "Stand Up's interview preparation tools and expert mentorship helped me overcome my anxiety and perform at my best.The platform is worth every penny, and the free tier is already incredibly valuable."
    }
  ];

  const faqs = [
    {
      question: "How does Stand Up help me find the right job?",
      answer: "Stand Up uses AI-powered matching to connect you with opportunities that align with your skills, interests, and career goals. Our platform analyzes your profile and matches you with the most suitable positions."
    },
    {
      question: "Is Stand Up free to use?",
      answer: "Yes! Stand Up offers a free plan that includes basic job matching, resume building, and profile creation. You can upgrade to Premium for advanced features like AI-powered matching, unlimited applications, and mentor sessions."
    },
    {
      question: "How do mentor sessions work?",
      answer: "Premium members get access to industry experts who provide personalized guidance. You can book one-on-one sessions to discuss your career path, get resume feedback, practice interviews, and receive valuable insights."
    },
    {
      question: "Can employers see my profile?",
      answer: "Your profile is only visible to employers when you apply for their jobs. You have full control over what information you share and can update your privacy settings at any time."
    },
    {
      question: "What makes Stand Up different from other job platforms?",
      answer: "Stand Up is specifically designed for students and recent graduates. We offer personalized career guidance, AI matching, expert mentorship, interview preparation, and portfolio hosting - all in one platform to help you transition from student to professional."
    }
  ];

  const partnerCompanies = [
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
    { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg' },
    { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' }
  ];

  const studentPlans = [
    {
      id: 'student-free',
      name: 'Free',
      price: '0',
      type: 'student',
      planType: 'free',
      description: 'Perfect for getting started',
      icon: Zap,
      features: [
        { text: 'Basic job matching', included: true },
        { text: 'Resume builder', included: true },
        { text: 'Profile creation', included: true },
        { text: '3 applications per month', included: true },
        { text: 'Community support', included: true },
        { text: 'AI-powered matching', included: false },
        { text: 'Mock interviews', included: false },
        { text: 'Mentor sessions', included: false },
        { text: 'Portfolio hosting', included: false },
        { text: 'Priority support', included: false }
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      id: 'student-premium',
      name: 'Premium',
      price: '50',
      type: 'student',
      planType: 'premium',
      description: 'Everything you need to succeed',
      icon: Crown,
      popular: true,
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'AI-powered job matching', included: true },
        { text: 'Unlimited applications', included: true },
        { text: 'Mock interview practice', included: true },
        { text: '2 mentor sessions/month', included: true },
        { text: 'Portfolio website hosting', included: true },
        { text: 'Resume optimization', included: true },
        { text: 'Priority job alerts', included: true },
        { text: 'Interview preparation', included: true },
        { text: 'Priority support', included: true }
      ],
      cta: 'Upgrade to Premium',
      highlighted: true
    }
  ];

  const studentMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Applications', path: '/applications', icon: FolderKanban },
    { name: 'Mentors', path: '/mentors', icon: Users2 },
    { name: 'Learning', path: '/learning', icon: GraduationCap },
    { name: 'Skills', path: '/skills', icon: AwardIcon },
    { name: 'Settings', path: '/settings', icon: SettingsIcon }
  ];

  const employerMenuItems = [
    { name: 'Dashboard', path: '/employer-dashboard', icon: LayoutDashboard },
    { name: 'Settings', path: '/employer-settings', icon: SettingsIcon }
  ];

  const howItWorks = [
    {
      icon: Target,
      title: 'Tell Us Your Goals',
      description: 'Share your skills, interests, and dream roles'
    },
    {
      icon: Sparkles,
      title: 'Get AI-Matched',
      description: 'Our AI finds opportunities that fit you perfectly'
    },
    {
      icon: TrendingUp,
      title: 'Grow & Succeed',
      description: 'Prepare, apply, and land your dream opportunity'
    }
  ];

  const whyStandUp = [
    {
      icon: Target,
      title: 'Personalized Guidance',
      description: 'Career roadmaps tailored to your goals and skills'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Smart algorithms connect you with perfect-fit opportunities'
    },
    {
      icon: Users,
      title: 'Expert Mentorship',
      description: 'Learn from industry professionals who have been there'
    },
    {
      icon: Award,
      title: 'Interview Preparation',
      description: 'Mock interviews and feedback to boost your confidence'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-16 px-6 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <img
              src="https://customer-assets.emergentagent.com/job_9597193e-4ccf-48a0-a66a-1efa796a5b1d/artifacts/ufitgc6x_stand.png"
              alt="Stand Up Logo"
              className="w-auto h-10"
            />
            <p className='font-medium tracking-widest font-mich text-[#FF7000]'>Stand<span className='text-blue-500 '>UP</span></p>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 transition-colors rounded-lg hover:bg-gray-100">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-[#FF7000] text-white">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {(user.role === 'employer' ? employerMenuItems : studentMenuItems).map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="cursor-pointer"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <span>{item.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="text-gray-700 hover:text-[#FF7000] transition-colors"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white px-6 transition-all shadow-sm hover:shadow-md"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-block"
              >
                <Badge className="bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC] px-4 py-1.5 text-sm font-medium">
                  Career Development Platform
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl lg:text-6xl font-bold text-[#0F151D] leading-tight"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                To every dreamer chasing their future,{' '}
                <span className="text-[#FF7000]">STAND UP!</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl text-[#4B5563] leading-relaxed"
              >
                Bridge the gap between ambition and opportunity. Get job-ready with personalized guidance, AI matching, and expert mentorship.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  onClick={() => navigate('/auth?role=student')}
                  size="lg"
                  className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white px-8 py-6 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  I'm a Student
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate('/auth?role=employer')}
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white px-8 py-6 text-lg font-medium rounded-full transition-all"
                >
                  I'm an Employer
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&auto=format&q=80"
                alt="Students pursuing careers"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                loading="eager"
              />
              <div className="absolute max-w-xs p-4 bg-white shadow-xl -bottom-6 -left-6 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">2,500+ Students</p>
                    <p className="text-xs text-gray-600">Landed their dream jobs</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-[#FFFDFA]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl font-bold text-[#0F151D] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              How It Works
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-[#4B5563] max-w-2xl mx-auto mb-12 text-center"
          >
            Three simple steps to launch your career
          </motion.p>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                >
                  <Card className="relative transition-all duration-300 border-none shadow-lg hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-8 text-center">
                      <div className="absolute -translate-x-1/2 -top-6 left-1/2">
                        <div className="h-12 w-12 bg-gradient-to-br from-[#FF7000] to-[#FF9040] rounded-full flex items-center justify-center shadow-lg">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="mt-8">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E8F0FF] text-[#284688] font-bold text-sm mb-4">
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-[#0F151D] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {step.title}
                        </h3>
                        <p className="text-[#4B5563]">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Stand Up */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl font-bold text-[#0F151D] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Why Stand Up?
            </h2>
            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
              Everything you need to go from student to professional
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyStandUp.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="transition-all duration-300 border-none shadow-md hover:shadow-xl group hover:-translate-y-2">
                    <CardContent className="p-6">
                      <div className="h-14 w-14 bg-[#FFE4CC] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="h-7 w-7 text-[#FF7000]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#4B5563]">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 px-6 bg-[#FFFDFA]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Explore Opportunities
              </h2>
              <p className="text-[#4B5563]">Latest internships and jobs waiting for you</p>
            </div>
            <Button
              onClick={() => navigate('/auth')}
              variant="ghost"
              className="text-[#FF7000] hover:text-[#FF7000]/90 hover:bg-[#FFE4CC]"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="transition-all duration-300 border-none shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <img
                        src={job.logo}
                        alt={job.company}
                        className="object-cover w-12 h-12 rounded-lg"
                        loading="lazy"
                        width="48"
                        height="48"
                      />
                      <Badge className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF]">
                        {job.type}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-[#0F151D] mb-2">{job.title}</h3>
                    <p className="text-sm text-[#4B5563] mb-4">{job.company}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#4B5563]">{job.location}</span>
                      <span className="text-sm font-medium text-[#FF7000]">{job.salary}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Learn from the Best
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[#4B5563] mb-12 text-center"
          >
            Connect with industry experts who can guide your journey
          </motion.p>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.2 }}
              >
                <Card className="transition-all duration-300 border-none shadow-md hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-[#FFE4CC]">
                      <AvatarImage
                        src={mentor.avatar}
                        alt={mentor.name}
                        loading="lazy"
                      />
                      <AvatarFallback className="bg-[#FF7000] text-white text-2xl">
                        {mentor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold text-[#0F151D] mb-1">{mentor.name}</h3>
                    <p className="text-sm text-[#4B5563] mb-2">{mentor.title}</p>
                    <p className="text-xs text-[#FF7000] font-medium mb-4">{mentor.company}</p>
                    <div className="flex items-center justify-center gap-1 mb-4">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{mentor.rating}</span>
                      <span className="text-xs text-[#4B5563]">({mentor.sessions} sessions)</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {mentor.expertise.slice(0, 2).map((exp) => (
                        <Badge key={exp} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Companies - Infinite Marquee */}
      <section className="py-16 my-24 px-6 bg-[#FFFDFA] overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl font-semibold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Trusted by Leading Companies
            </h2>
          </motion.div>

          <div className="relative">
            <motion.div
              animate={{
                x: [0, -1600]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear"
                }
              }}
              className="flex gap-12"
            >
              {[...partnerCompanies, ...partnerCompanies].map((company, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center flex-shrink-0 w-32 group"
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="object-contain h-12 transition-all grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                    loading="lazy"
                    width="120"
                    height="48"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Success Stories
            </h2>
            <p className="text-[#4B5563]">See how Stand Up has transformed careers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-none shadow-xl">
              <CardContent className="p-12 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-6 border-4 border-[#FFE4CC]">
                  <AvatarImage
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    loading="lazy"
                  />
                  <AvatarFallback className="bg-[#FF7000] text-white text-xl">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-[#0F151D] mb-6 max-w-2xl mx-auto italic leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <p className="font-semibold text-[#0F151D]">{testimonials[currentTestimonial].name}</p>
                <p className="text-sm text-[#4B5563]">{testimonials[currentTestimonial].role}</p>
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`h-2 rounded-full transition-all ${index === currentTestimonial ? 'w-8 bg-[#FF7000]' : 'w-2 bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-[#FFFDFA]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-[#4B5563]">Everything you need to know about Stand Up</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-none shadow-md">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-gray-50"
                  >
                    <h3 className="text-lg font-semibold text-[#0F151D] pr-4">
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: openFAQ === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-[#FF7000] flex-shrink-0" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFAQ === index ? "auto" : 0,
                      opacity: openFAQ === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-[#4B5563]">
                      {faq.answer}
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Choose Your Plan
            </h2>
            <p className="text-[#4B5563]">Start free, upgrade when you're ready</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {studentPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card
                  className={`relative overflow-hidden transition-shadow duration-300 ${plan.highlighted ? 'border-2 border-[#FF7000] shadow-xl' : 'border-2 border-gray-200 shadow-md'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-[#FF7000] text-white px-4 py-1 text-xs font-medium">
                      POPULAR
                    </div>
                  )}

                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-[#0F151D] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {plan.name}
                        </h3>
                        <p className="text-[#4B5563] mb-6">{plan.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-4xl font-bold text-[#0F151D]">{plan.price}</div>
                        <div className="text-sm text-[#4B5563]">$/month</div>
                      </div>
                    </div>

                    <ul className="mt-6 mb-8 space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2
                            className={`w-5 h-5 ${f.included ? 'text-[#FF7000]' : 'text-gray-300'}`}
                          />
                          <span className={`text-sm ${f.included ? 'text-[#0F151D]' : 'text-gray-400'}`}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between">
                      <div />
                      <Button
                        onClick={() => navigate(`/pricing`)}
                        className={`px-6 py-3 rounded-md text-white shadow-sm ${plan.highlighted ? 'bg-[#FF7000] hover:bg-[#FF7000]/90' : 'bg-white text-[#284688] border-2 border-[#284688] hover:bg-[#284688] hover:text-white'
                          }`}
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#284688] to-[#3a5ba0]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-4xl font-bold text-white"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Ready to Stand Up for Your Future?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-8 text-white/90"
          >
            Join thousands of students who are already on their path to success. Get personalized career guidance,
            connect with top employers, and access expert mentorship
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white px-12 py-6 text-lg font-medium rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F151D] text-white py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 mb-8 md:grid-cols-4">
            <div>
              <img
                src="https://customer-assets.emergentagent.com/job_9597193e-4ccf-48a0-a66a-1efa796a5b1d/artifacts/ufitgc6x_stand.png"
                alt="Stand Up Logo"
                className="w-auto h-10 mb-4"
              />
              <p className="text-sm text-gray-400">
                Empowering dreamers to achieve their career goals.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-sm text-center text-gray-400 border-t border-gray-800">
            <p>© 2025 Stand Up. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;