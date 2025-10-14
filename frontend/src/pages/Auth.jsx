import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState('auth'); // auth, role, onboarding
  const [authMode, setAuthMode] = useState('signin'); // signin, signup
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    skills: [],
    roles: [],
    graduation: '',
    companyName: ''
  });

  const availableSkills = [
    'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB',
    'JavaScript', 'TypeScript', 'Figma', 'AWS', 'Docker', 'Git'
  ];

  const availableRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'UI/UX Designer', 'Data Analyst', 'Product Manager'
  ];

  const handleAuth = (e) => {
    e.preventDefault();
    if (selectedRole) {
      setStep('onboarding');
    } else {
      setStep('role');
    }
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setStep('onboarding');
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleComplete = () => {
    // Navigate based on role
    if (selectedRole === 'employer') {
      navigate('/employer-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDFA] to-[#E8F0FF] flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <img 
              src="https://customer-assets.emergentagent.com/job_9597193e-4ccf-48a0-a66a-1efa796a5b1d/artifacts/ufitgc6x_stand.png" 
              alt="Stand Up Logo" 
              className="h-12 w-auto mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              I am a...
            </h1>
            <p className="text-[#4B5563]">Choose your role to get started</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-[#FF7000]"
              onClick={() => handleRoleSelection('student')}
            >
              <CardContent className="p-12 text-center">
                <div className="h-20 w-20 bg-[#FFE4CC] rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="h-10 w-10 text-[#FF7000]" />
                </div>
                <h2 className="text-2xl font-bold text-[#0F151D] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Student
                </h2>
                <p className="text-[#4B5563] mb-6">
                  Find internships, build skills, and launch your career
                </p>
                <Button className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white w-full">
                  Continue as Student
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-[#284688]"
              onClick={() => handleRoleSelection('employer')}
            >
              <CardContent className="p-12 text-center">
                <div className="h-20 w-20 bg-[#E8F0FF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="h-10 w-10 text-[#284688]" />
                </div>
                <h2 className="text-2xl font-bold text-[#0F151D] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Employer
                </h2>
                <p className="text-[#4B5563] mb-6">
                  Discover job-ready talent that fits your culture
                </p>
                <Button 
                  variant="outline"
                  className="border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white w-full"
                >
                  Continue as Employer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDFA] to-[#E8F0FF] flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className={`h-2 rounded-full transition-all ${
                      num === onboardingStep ? 'w-8 bg-[#FF7000]' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#4B5563]">Step {onboardingStep} of 4</span>
            </div>
            <CardTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {selectedRole === 'student' ? (
                onboardingStep === 1 ? 'What are your goals?' :
                onboardingStep === 2 ? 'Select your skills' :
                onboardingStep === 3 ? 'Desired roles' : 'When do you graduate?'
              ) : (
                onboardingStep === 1 ? 'Company Information' :
                onboardingStep === 2 ? 'Industry & Size' :
                onboardingStep === 3 ? 'Company Culture' : 'All Set!'
              )}
            </CardTitle>
            <CardDescription>
              {selectedRole === 'student' 
                ? 'Help us personalize your experience' 
                : 'Tell us about your company'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRole === 'student' ? (
              <div className="space-y-6">
                {onboardingStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>What's your primary goal?</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {['Find Internship', 'Full-time Job', 'Skill Building', 'Career Change'].map((goal) => (
                          <Button
                            key={goal}
                            variant="outline"
                            className="justify-start hover:border-[#FF7000] hover:text-[#FF7000]"
                          >
                            {goal}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {onboardingStep === 2 && (
                  <div>
                    <Label>Select your skills (choose at least 3)</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {availableSkills.map((skill) => (
                        <Badge
                          key={skill}
                          onClick={() => handleSkillToggle(skill)}
                          className={`cursor-pointer transition-all ${
                            formData.skills.includes(skill)
                              ? 'bg-[#FF7000] text-white hover:bg-[#FF7000]/90'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {onboardingStep === 3 && (
                  <div>
                    <Label>What roles interest you?</Label>
                    <div className="space-y-2 mt-3">
                      {availableRoles.map((role) => (
                        <Button
                          key={role}
                          variant="outline"
                          onClick={() => handleRoleToggle(role)}
                          className={`w-full justify-start transition-all ${
                            formData.roles.includes(role)
                              ? 'border-[#FF7000] bg-[#FFE4CC] text-[#FF7000]'
                              : 'hover:border-[#FF7000]'
                          }`}
                        >
                          {role}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {onboardingStep === 4 && (
                  <div>
                    <Label htmlFor="graduation">Expected Graduation Date</Label>
                    <Input
                      id="graduation"
                      type="month"
                      value={formData.graduation}
                      onChange={(e) => setFormData({ ...formData, graduation: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {onboardingStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Enter company name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Company Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://company.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
                {onboardingStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Industry</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Manufacturing'].map((industry) => (
                          <Button
                            key={industry}
                            variant="outline"
                            className="justify-start hover:border-[#284688] hover:text-[#284688]"
                          >
                            {industry}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {onboardingStep >= 3 && (
                  <div className="text-center py-8">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[#0F151D] mb-2">All Set!</h3>
                    <p className="text-[#4B5563]">Your employer profile is ready</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 mt-8">
              {onboardingStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={() => {
                  if (onboardingStep < 4) {
                    setOnboardingStep(prev => prev + 1);
                  } else {
                    handleComplete();
                  }
                }}
                className="flex-1 bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
              >
                {onboardingStep === 4 ? 'Complete' : 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDFA] to-[#E8F0FF] flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <img 
            src="https://customer-assets.emergentagent.com/job_9597193e-4ccf-48a0-a66a-1efa796a5b1d/artifacts/ufitgc6x_stand.png" 
            alt="Stand Up Logo" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <CardTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {authMode === 'signin' ? 'Welcome Back!' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {authMode === 'signin' 
              ? 'Sign in to continue your journey' 
              : 'Start your career journey today'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full bg-[#FF7000] hover:bg-[#FF7000]/90 text-white">
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#4B5563]">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button type="button" variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-[#FF7000] hover:underline font-medium"
              >
                {authMode === 'signin' 
                  ? "Don't have an account? Sign Up" 
                  : 'Already have an account? Sign In'
                }
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
