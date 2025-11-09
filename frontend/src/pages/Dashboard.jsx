import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  TrendingUp, 
  Briefcase, 
  Video, 
  CheckCircle2,
  Clock,
  Target,
  Lightbulb,
  ArrowRight,
  Star
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { jobsAPI, mentorsAPI, learningAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getMatchColor, getMatchBgColor, formatDate } from '../lib/utils';
import DashboardLayout from '../components/Layout/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, loading } = useAuth();

  const [matchedJobs, setMatchedJobs] = useState([]);
  const [suggestedMentor, setSuggestedMentor] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [careerRoadmapState, setCareerRoadmapState] = useState([]);
  const [kpisState, setKpisState] = useState({ profileStrength: 0, applications: 0, interviews: 0, nextTask: '—' });
  const [isLoading, setIsLoading] = useState(true);

  // Normalize current user shape used by the UI.
  const currentUser = authUser
    ? {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        avatar: authUser.avatar,
        role: authUser.role,
        // backend uses profile_strength (snake_case)
        profileStrength: authUser.profile_strength ?? authUser.profileStrength ?? 0,
        // backend returns skills as objects [{ skill_name }]
        skills: Array.isArray(authUser.skills) ? authUser.skills.map(s => s.skill_name || s.name || s) : [],
        desiredRoles: Array.isArray(authUser.roadmap) ? authUser.roadmap.map(r => r.title) : [],
        graduation: authUser.graduation,
        bio: authUser.bio
      }
    : { id: null, name: 'Student', email: '', avatar: null, role: 'student', profileStrength: 0, skills: [], desiredRoles: [], graduation: null, bio: '' };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Dashboard stats (profile strength, counts, roadmap)
        const statsRes = await fetch('/api/users/dashboard', { credentials: 'include' });
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (data.success && data.stats) {
            const s = data.stats;
            setKpisState({ profileStrength: s.profileStrength ?? 0, applications: s.applications ?? 0, interviews: s.interviews ?? 0, nextTask: s.nextTask ?? '—' });
            if (s.roadmap) setCareerRoadmapState(s.roadmap);
          }
        }

        // Fetch jobs, mentors and events in parallel
        const [jobsRes, mentorsRes, eventsRes] = await Promise.allSettled([
          jobsAPI.getJobs(),
          mentorsAPI.getMentors(),
          learningAPI.getEvents()
        ]);

        if (jobsRes.status === 'fulfilled' && jobsRes.value && jobsRes.value.success) {
          const jobsArray = Array.isArray(jobsRes.value.data) ? jobsRes.value.data : [];
          setMatchedJobs(jobsArray.slice(0, 3));
        }

        if (mentorsRes.status === 'fulfilled' && mentorsRes.value && mentorsRes.value.success) {
          const mentorsArray = Array.isArray(mentorsRes.value.data) ? mentorsRes.value.data : [];
          setSuggestedMentor(mentorsArray[0] || null);
        }

        if (eventsRes.status === 'fulfilled' && eventsRes.value && eventsRes.value.success) {
          const eventsArray = Array.isArray(eventsRes.value.data) ? eventsRes.value.data : [];
          setUpcomingEvents(eventsArray.slice(0, 3));
        }
      } catch (e) {
        console.error('Error loading dashboard data', e);
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) fetchData();
  }, [authUser]);

  const kpis = [
    {
      label: 'Profile Strength',
      value: `${kpisState.profileStrength}%`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Applications',
      value: `${kpisState.applications}`,
      subtitle: 'In Progress',
      icon: Briefcase,
      color: 'text-[#FF7000]',
      bgColor: 'bg-[#FFE4CC]'
    },
    {
      label: 'Interview Invites',
      value: `${kpisState.interviews}`,
      subtitle: 'This week',
      icon: Video,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Next Task',
      value: kpisState.nextTask || '—',
      subtitle: '',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const tipOfDay = {
    title: 'Resume Tip',
    content: 'Use action verbs like "Led," "Implemented," and "Achieved" to make your experience stand out.'
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Welcome back, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-[#4B5563]">Here's what's happening with your career journey</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-[#4B5563] mb-2">{kpi.label}</p>
                      <p className="text-2xl font-bold text-[#0F151D]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {kpi.value}
                      </p>
                      {kpi.subtitle && (
                        <p className="text-xs text-[#4B5563] mt-1">{kpi.subtitle}</p>
                      )}
                    </div>
                    <div className={`h-12 w-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                  </div>
                  {kpi.label === 'Profile Strength' && (
                    <Progress value={currentUser.profileStrength} className="mt-4 h-2" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Match Feed */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      AI-Matched Opportunities
                    </CardTitle>
                    <CardDescription>Top matches based on your profile</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/jobs')}
                    className="text-[#FF7000] hover:text-[#FF7000]/90 hover:bg-[#FFE4CC]"
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchedJobs.map((job) => (
                  <div 
                    key={job.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-[#FF7000] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/jobs?id=${job.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <img 
                        src={job.logo} 
                        alt={job.company} 
                        className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#0F151D] mb-1">{job.title}</h3>
                            <p className="text-sm text-[#4B5563]">{job.company} • {job.location}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className={`${getMatchBgColor(job.matchScore)} ${getMatchColor(job.matchScore)} px-3 py-1 rounded-full text-sm font-semibold`}>
                              {job.matchScore}% Match
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(job.skills || []).slice(0, 4).map((skill) => (
                            <Badge key={skill.skill_name || skill} variant="outline" className="text-xs">
                              {skill.skill_name || skill}
                            </Badge>
                          ))}
                        </div>
                        <details className="group">
                          <summary className="text-sm text-[#FF7000] cursor-pointer hover:underline list-none flex items-center gap-1">
                            <span>Why you match</span>
                            <svg className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="mt-3 p-3 bg-[#FFFDFA] rounded-lg space-y-2">
                            <div>
                              <p className="text-xs font-medium text-green-700 mb-1">Strong Match:</p>
                              <ul className="text-xs text-[#4B5563] space-y-1">
                                {(job.whyMatch || []).map((reason, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {(job.whyNotMatch || []).length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-yellow-700 mb-1">Areas to Improve:</p>
                                <ul className="text-xs text-[#4B5563] space-y-1">
                                  {(job.whyNotMatch || []).map((reason, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="h-3 w-3 rounded-full border-2 border-yellow-600 mt-0.5 flex-shrink-0" />
                                      <span>{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Career Roadmap */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Your Career Roadmap
                </CardTitle>
                <CardDescription>Track your progress to job-readiness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {careerRoadmapState.map((step, index) => {
                    const isLast = index === careerRoadmapState.length - 1;
                    return (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            step.status === 'completed' ? 'bg-green-100' :
                            step.status === 'in-progress' ? 'bg-[#FFE4CC]' :
                            'bg-gray-100'
                          }`}>
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : step.status === 'in-progress' ? (
                              <Clock className="h-5 w-5 text-[#FF7000]" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-gray-400" />
                            )}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 h-12 ${
                              step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <h4 className="font-medium text-[#0F151D] mb-1">{step.title}</h4>
                          {step.date && (
                            <p className="text-xs text-[#4B5563]">Completed on {formatDate(step.date)}</p>
                          )}
                          {step.status === 'in-progress' && (
                            <Button 
                              size="sm" 
                              className="mt-2 bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                              onClick={() => navigate('/portfolio')}
                            >
                              Continue
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-[#FFFDFA] rounded-lg hover:bg-[#FFE4CC]/30 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 bg-[#E8F0FF] rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-[#284688]">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-[#284688]">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#0F151D] text-sm mb-1">{event.title}</h4>
                        <p className="text-xs text-[#4B5563]">{event.time} • {event.location}</p>
                        <Badge className="mt-1 text-xs bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC]">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mentor Suggestion */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Suggested Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-[#FFE4CC]">
                    <AvatarImage src={suggestedMentor?.avatar} alt={suggestedMentor?.name} />
                    <AvatarFallback>{suggestedMentor?.name ? suggestedMentor.name.charAt(0) : 'M'}</AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-[#0F151D] mb-1">{suggestedMentor?.name || 'No mentor found'}</h4>
                  <p className="text-sm text-[#4B5563] mb-2">{suggestedMentor?.title || ''}</p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{suggestedMentor?.rating || '—'}</span>
                  </div>
                  <p className="text-xs text-[#4B5563] mb-4">{suggestedMentor?.bio || ''}</p>
                  <Button 
                    className="w-full bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                    onClick={() => navigate('/mentors')}
                  >
                    Book Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tip of the Day */}
            <Card className="border-none shadow-md bg-gradient-to-br from-[#E8F0FF] to-[#FFE4CC]">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-[#FF7000]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0F151D] mb-2">{tipOfDay.title}</h4>
                    <p className="text-sm text-[#4B5563]">{tipOfDay.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
