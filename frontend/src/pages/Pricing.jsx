import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, X, Zap, Crown, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Logo from '../pages/landing/Logo';
import Footer from './landing/Footer';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToFAQ = () => {
    // navigate to home (so URL becomes "/"), then scroll to #faq
    navigate('/');
    // small delay to allow route mount & layout to stabilize; 50-120ms works well
    setTimeout(() => {
      const el = document.getElementById('faq');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // also update URL to include hash
        if (history && history.pushState) {
          history.pushState(null, '', '/#faq');
        }
      }
    }, 80);
  };

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

  const employerPlans = [
    {
      id: 'employer-free',
      name: 'Free',
      price: '0',
      type: 'employer',
      planType: 'free',
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
      cta: 'Get Started',
      highlighted: false
    },
    {
      id: 'employer-professional',
      name: 'Professional',
      price: '120',
      type: 'employer',
      planType: 'premium',
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
      cta: 'Upgrade to Professional',
      highlighted: true
    },
    {
      id: 'employer-enterprise',
      name: 'Enterprise',
      price: 'Custom',
      type: 'employer',
      planType: 'enterprise',
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

  const handlePlanClick = (plan) => {
    if (!user) {
      navigate("/auth")
      return
    }

    if (user && user.role !== plan.type) {
      if (user.role === 'student' && plan.type === 'employer') {
        toast.error("Wrong Plan Type", {
          description: "This is an employer plan. Please select a student plan or switch to an employer account."
        });
        return;
      }
      if (user.role === 'employer' && plan.type === 'student') {
        toast.error("Wrong Plan Type", {
          description: "This is a student plan. Please select an employer plan or switch to a student account."
        });
        return;
      }
    }

    if (plan.planType === 'free') {
      if (user?.role === 'employer') {
        navigate('/employer-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else if (plan.id === 'employer-enterprise') {
      window.location.href = 'mailto:sales@standup.com?subject=Enterprise Plan Inquiry';
    } else {
      navigate(`/payment?plan=${plan.id}`);
    }
  };

  const isCurrentPlan = (plan) => {
    if (!user) return false;
    return user.role === plan.type && user.plan === plan.planType;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/75 backdrop-blur-sm">
        <div className="flex items-center justify-between h-16 px-4 mx-auto lg:px-0 max-w-7xl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Logo className="w-auto h-10" />
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
      <section className="px-6 pt-32 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-[#FFE4CC] text-[#FF7000] px-4 py-1.5 text-sm font-medium mb-6">
            Simple, transparent pricing
          </Badge>

          <h1 className="text-5xl font-bold text-[#0F151D] mb-6"  >
            Choose the Right Plan for You
          </h1>

          <p className="text-xl text-[#4B5563]">
            Start free and upgrade when you're ready. No credit card required.
          </p>
        </div>
      </section>

      {/* Student Plans */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2"  >
              For Students & Job Seekers
            </h2>
            <p className="text-[#4B5563]">Everything you need to launch your career</p>
          </div>

          <div className="grid max-w-5xl gap-8 mx-auto md:grid-cols-2">
            {studentPlans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = isCurrentPlan(plan);

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-visible rounded-2xl p-0 ${plan.highlighted
                    ? 'border-none bg-gradient-to-b from-[#FFF8F0] to-white'
                    : 'border border-[#EFE9E0] bg-white'
                    }`}
                >
                  {/* Popular badge - top-right */}
                  {plan.popular && (
                    <div className="absolute z-50 -top-3 right-4 px-3 py-1 text-[10px] font-semibold bg-[#FFEEE0] text-[#D45F00] border border-[#FFD5B8] rounded-full tracking-wide">
                      MOST POPULAR
                    </div>
                  )}

                  {/* Current plan badge */}
                  {isCurrent && (
                    <div className="absolute z-40 -top-3 left-4">
                      <Badge className="px-3 py-1 text-xs text-white bg-green-500">CURRENT PLAN</Badge>
                    </div>
                  )}

                  <CardHeader className="p-8 pb-6 text-center">
                    <div className="h-16 w-16 bg-[#FFE4CC] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-[#FF7000]" />
                    </div>

                    <CardTitle className="text-2xl"  >
                      {plan.name}
                    </CardTitle>

                    <CardDescription className="text-base text-[#6B7280]">{plan.description}</CardDescription>

                    <div className="mt-6">
                      <span className="text-4xl font-bold text-[#0F151D]">${plan.price}</span>
                      <span className="text-[#4B5563] ml-2">/month</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 pt-0">
                    <ul className="grid gap-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          {feature.included ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-[#0F151D]' : 'text-gray-400'}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handlePlanClick(plan)}
                      disabled={isCurrent}
                      className={`w-full h-12 text-base rounded-md ${isCurrent
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : plan.highlighted
                          ? 'bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white'
                          : 'bg-white border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white'
                        }`}
                    >
                      {isCurrent ? 'Current Plan' : plan.cta}
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
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#0F151D] mb-2"  >
              For Employers
            </h2>
            <p className="text-[#4B5563]">Find job-ready talent faster</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {employerPlans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = isCurrentPlan(plan);

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-visible rounded-2xl p-0 ${plan.highlighted
                    ? 'border-none bg-gradient-to-b from-[#FFF8F0] to-white'
                    : 'border border-[#EFE9E0] bg-white'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute z-50 -top-3 right-4 px-3 py-1 text-[10px] font-semibold bg-[#FFEEE0] text-[#D45F00] border border-[#FFD5B8] rounded-full tracking-wide">
                      RECOMMENDED
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute z-40 -top-3 left-4">
                      <Badge className="px-3 py-1 text-xs text-white bg-green-500">CURRENT</Badge>
                    </div>
                  )}

                  <CardHeader className="p-8 pb-6 text-center">
                    <div className="h-14 w-14 bg-[#E8F0FF] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-[#284688]" />
                    </div>

                    <CardTitle className="text-2xl"  >
                      {plan.name}
                    </CardTitle>

                    <CardDescription className="text-sm text-[#6B7280]">{plan.description}</CardDescription>

                    <div className="mt-6">
                      {plan.price === 'Custom' ? (
                        <span className="text-4xl font-bold text-[#0F151D]">{plan.price}</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-[#0F151D]">${plan.price}</span>
                          <span className="text-[#4B5563] ml-2 text-sm">/month</span>
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 pt-0">
                    <ul className="grid gap-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          {feature.included ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-[#0F151D]' : 'text-gray-400'}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handlePlanClick(plan)}
                      disabled={isCurrent}
                      className={`w-full h-12 text-base rounded-md ${isCurrent
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : plan.highlighted
                          ? 'bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white'
                          : 'bg-white border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white'
                        }`}
                    >
                      {isCurrent ? 'Current Plan' : plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0F151D] mb-6">
            Have Questions?
          </h2>
          <p className="text-lg text-[#4B5563] mb-8">
            Our team is here to help you choose the right plan and get started.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white px-8" onClick={goToFAQ}>
              Contact Sales
            </Button>
            <Button variant="outline" className="border-2 border-[#284688] text-[#284688] hover:bg-[#284688] hover:text-white px-8" onClick={goToFAQ}>
              View FAQ
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Pricing;