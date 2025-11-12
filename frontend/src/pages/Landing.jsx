import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { CheckCircle2, Target, Users, TrendingUp, Award, Sparkles, ArrowRight, Star, Settings as SettingsIcon, LogOut, LayoutDashboard, Briefcase, GraduationCap, BookOpen, Users2, Award as AwardIcon, FolderKanban } from 'lucide-react';
import { jobs, mentors, testimonials, partnerCompanies } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { user, signout } = useAuth();

  const handleSignOut = async () => {
    try {
      await signout();
      navigate('/');
    } catch (err) {
      navigate('/');
    }
  };

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
    { name: 'Settings', path: '/settings', icon: SettingsIcon }
  ];

  const featuredJobs = jobs.slice(0, 3);
  const featuredMentors = mentors.slice(0, 3);

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
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_9597193e-4ccf-48a0-a66a-1efa796a5b1d/artifacts/ufitgc6x_stand.png" 
              alt="Stand Up Logo" 
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <Badge className="bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC] px-4 py-1.5 text-sm font-medium">
                  Career Development Platform
                </Badge>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#0F151D] leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                To every dreamer chasing their future,{' '}
                <span className="text-[#FF7000]">STAND UP!</span>
              </h1>
              <p className="text-xl text-[#4B5563] leading-relaxed">
                Bridge the gap between ambition and opportunity. Get job-ready with personalized guidance, AI matching, and expert mentorship.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/auth?role=student')}
                  size="lg"
                  className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white px-8 py-6 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  I'm a Student
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/auth?role=employer')}
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white px-8 py-6 text-lg font-medium rounded-full transition-all"
                >
                  I'm an Employer
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846" 
                alt="Students pursuing careers" 
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">2,500+ Students</p>
                    <p className="text-xs text-gray-600">Landed their dream jobs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-[#FFFDFA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F151D] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              How It Works
            </h2>
            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
              Three simple steps to launch your career
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <div className="h-12 w-12 bg-gradient-to-br from-[#FF7000] to-[#FF9040] rounded-full flex items-center justify-center shadow-lg">
                        <Icon className="h-6 w-6 text-white" />
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Stand Up */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F151D] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Why Stand Up?
            </h2>
            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
              Everything you need to go from student to professional
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyStandUp.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-none shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 px-6 bg-[#FFFDFA]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
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
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Card key={job.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <img src={job.logo} alt={job.company} className="h-12 w-12 rounded-lg object-cover" />
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
            ))}
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Learn from the Best
            </h2>
            <p className="text-[#4B5563]">Connect with industry experts who can guide your journey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredMentors.map((mentor) => (
              <Card key={mentor.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-[#FFE4CC]">
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-[#0F151D] mb-1">{mentor.name}</h3>
                  <p className="text-sm text-[#4B5563] mb-2">{mentor.title}</p>
                  <p className="text-xs text-[#FF7000] font-medium mb-4">{mentor.company}</p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{mentor.rating}</span>
                    <span className="text-xs text-[#4B5563]">({mentor.sessions} sessions)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {mentor.expertise.slice(0, 2).map((exp) => (
                      <Badge key={exp} variant="outline" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Companies */}
      <section className="py-16 px-6 bg-[#FFFDFA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Trusted by Leading Companies
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {partnerCompanies.map((company, index) => (
              <div key={index} className="flex items-center justify-center">
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="h-12 w-24 object-contain grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Success Stories
            </h2>
            <p className="text-[#4B5563]">See how Stand Up has transformed careers</p>
          </div>
          <Card className="border-none shadow-xl">
            <CardContent className="p-12 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-6 border-4 border-[#FFE4CC]">
                <AvatarImage src={testimonials[currentTestimonial].avatar} alt={testimonials[currentTestimonial].name} />
                <AvatarFallback>{testimonials[currentTestimonial].name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-[#0F151D] mb-6 italic leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </p>
              <p className="font-semibold text-[#0F151D]">{testimonials[currentTestimonial].name}</p>
              <p className="text-sm text-[#4B5563]">{testimonials[currentTestimonial].role}</p>
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTestimonial ? 'w-8 bg-[#FF7000]' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-6 bg-[#FFFDFA]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Choose Your Plan
            </h2>
            <p className="text-[#4B5563]">Start free, upgrade when you're ready</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-gray-200 shadow-md">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Free</h3>
                <p className="text-[#4B5563] mb-6">Get started with essential features</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#0F151D]">0</span>
                  <span className="text-[#4B5563]"> THB/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Basic job matching', 'Resume builder', 'Profile creation', '3 applications/month'].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-[#4B5563]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="outline" 
                  className="w-full border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#FF7000] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FF7000] text-white px-4 py-1 text-xs font-medium">
                POPULAR
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Premium</h3>
                <p className="text-[#4B5563] mb-6">Unlock your full potential</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#0F151D]">250</span>
                  <span className="text-[#4B5563]"> THB/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'AI-powered matching',
                    'Unlimited applications',
                    'Mock interviews',
                    'Mentor sessions',
                    'Portfolio hosting',
                    'Priority support'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#FF7000]" />
                      <span className="text-sm text-[#4B5563]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full bg-[#FF7000] hover:bg-[#FF7000]/90 text-white shadow-lg hover:shadow-xl"
                >
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#284688] to-[#3a5ba0]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ready to Stand Up for Your Future?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students who are already on their path to success
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white px-12 py-6 text-lg font-medium rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F151D] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img 
                src="https://customer-assets.emergentagent.com/job_9597193e-4ccf-48a0-a66a-1efa796a5b1d/artifacts/ufitgc6x_stand.png" 
                alt="Stand Up Logo" 
                className="h-10 w-auto mb-4"
              />
              <p className="text-sm text-gray-400">
                Empowering dreamers to achieve their career goals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#FF7000] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Stand Up. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
