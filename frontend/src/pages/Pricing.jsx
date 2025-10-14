import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, X, Zap, Crown, Rocket } from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();

  const studentPlans = [
    {
      name: 'Free',
      price: '0',
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
      name: 'Premium',
      price: '250',
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

  const employerPlans = [
    {
      name: 'Starter',
      price: '2,500',
      description: 'For small teams hiring occasionally',
      icon: Zap,
      features: [
        { text: '5 job postings/month', included: true },
        { text: 'Basic candidate matching', included: true },
        { text: 'Applicant tracking', included: true },
        { text: 'Email support', included: true },
        { text: 'Advanced filters', included: false },
        { text: 'Dedicated account manager', included: false }
      ],
      cta: 'Start Trial',
      highlighted: false
    },
    {
      name: 'Professional',
      price: '5,000',
      description: 'For growing companies',
      icon: Crown,
      popular: true,
      features: [
        { text: 'Unlimited job postings', included: true },
        { text: 'AI-powered matching', included: true },
        { text: 'Advanced applicant tracking', included: true },
        { text: 'Team collaboration tools', included: true },
        { text: 'Advanced candidate filters', included: true },
        { text: 'Analytics & reporting', included: true },
        { text: 'Priority listing', included: true },
        { text: 'Priority support', included: true }
      ],
      cta: 'Start Trial',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      icon: Rocket,
      features: [
        { text: 'Everything in Professional', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'API access', included: true },
        { text: 'White-label solution', included: true },
        { text: 'SLA guarantee', included: true },
        { text: 'Custom contracts', included: true },
        { text: '24/7 phone support', included: true }
      ],
      cta: 'Contact Sales',
      highlighted: false
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
          <Button 
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-gray-700"
          >
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC] px-4 py-1.5 text-sm font-medium mb-6">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-bold text-[#0F151D] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Choose the Right Plan for You
          </h1>
          <p className="text-xl text-[#4B5563]">
            Start free and upgrade when you're ready. No credit card required.
          </p>
        </div>
      </section>

      {/* Student Plans */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              For Students & Job Seekers
            </h2>
            <p className="text-[#4B5563]">Everything you need to launch your career</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {studentPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.name}
                  className={`relative ${
                    plan.highlighted 
                      ? 'border-2 border-[#FF7000] shadow-2xl scale-105' 
                      : 'border-2 border-gray-200 shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#FF7000] text-white hover:bg-[#FF7000] px-4 py-1">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <div className="h-16 w-16 bg-[#FFE4CC] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-[#FF7000]" />
                    </div>
                    <CardTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="mt-6">
                      <span className="text-5xl font-bold text-[#0F151D]">{plan.price}</span>
                      {plan.price !== '0' && <span className="text-[#4B5563] ml-2">THB/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          {feature.included ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${
                            feature.included ? 'text-[#0F151D]' : 'text-gray-400'
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => navigate('/auth')}
                      className={`w-full h-12 text-base ${
                        plan.highlighted
                          ? 'bg-[#FF7000] hover:bg-[#FF7000]/90 text-white shadow-lg'
                          : 'bg-white border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Employer Plans */}
      <section className="py-20 px-6 bg-[#FFFDFA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              For Employers
            </h2>
            <p className="text-[#4B5563]">Find job-ready talent faster</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {employerPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.name}
                  className={`relative ${
                    plan.highlighted 
                      ? 'border-2 border-[#FF7000] shadow-2xl scale-105' 
                      : 'border-2 border-gray-200 shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#FF7000] text-white hover:bg-[#FF7000] px-4 py-1">
                        RECOMMENDED
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <div className="h-14 w-14 bg-[#E8F0FF] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-[#284688]" />
                    </div>
                    <CardTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-[#0F151D]">{plan.price}</span>
                      {plan.price !== 'Custom' && <span className="text-[#4B5563] ml-2 text-sm">THB/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          {feature.included ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${
                            feature.included ? 'text-[#0F151D]' : 'text-gray-400'
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => navigate('/auth?role=employer')}
                      className={`w-full h-12 text-base ${
                        plan.highlighted
                          ? 'bg-[#FF7000] hover:bg-[#FF7000]/90 text-white shadow-lg'
                          : 'bg-white border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0F151D] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Have Questions?
          </h2>
          <p className="text-lg text-[#4B5563] mb-8">
            Our team is here to help you choose the right plan and get started.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white px-8">
              Contact Sales
            </Button>
            <Button variant="outline" className="border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white px-8">
              View FAQ
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F151D] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">© 2025 Stand Up. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
