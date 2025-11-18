// src/pages/Dashboard.jsx
import JobDetailsSheet from '@/components/JobDetailsSheet';
import {
  ArrowRight,
  Briefcase,
  Clock,
  Crown,
  Lightbulb,
  Lock,
  Sparkles,
  Star,
  Target,
  Video
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { getMatchBgColor, getMatchColor, getProfileStrengthColor, getProfileStrengthBgColor, getProfileStrengthTextColor } from '../lib/utils';
import { jobsAPI, learningAPI, mentorsAPI } from '../services/api';

const normalizeJob = (job) => {
  const companyName =
    (job.employer && (job.employer.company_name || job.employer.name)) ||
    job.company ||
    '';
  const skills = Array.isArray(job.skills)
    ? job.skills.map((s) =>
      typeof s === 'string'
        ? { skill_name: s }
        : s.skill_name
          ? s
          : { skill_name: s.name || '' }
    )
    : [];

  const posted_date =
    job.posted_date || job.postedDate || job.posted_at || job.postedAt || null;
  const posted_timestamp = posted_date ? new Date(posted_date).getTime() : 0;

  return {
    ...job,
    id: String(job._id ?? job.id ?? job.jobId ?? job.job_id),
    company: companyName,
    skills,
    posted_date,
    posted_timestamp,
    title: job.title || '',
    location: job.location || '',
    type: job.type || '',
    mode: job.mode || '',
    salary: job.salary || '',
    logo:
      job.logo ||
      job.company_logo ||
      '/images/company-placeholder.png',
    description: job.description || '',
    requirements: job.requirements || [],
    culture: job.culture || [],
    matchPercentage: job.matchPercentage ?? job.matchScore ?? job.match_score ?? null,
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [matchedJobs, setMatchedJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [suggestedMentor, setSuggestedMentor] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [kpisState, setKpisState] = useState({
    profileStrength: 0,
    applications: 0,
    interviews: 0,
    nextTask: '—',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isPremium = authUser?.plan === 'premium';

  // Base dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Dashboard stats
        const statsRes = await fetch('/api/users/dashboard', {
          credentials: 'include',
        });
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (data.success && data.stats) {
            const s = data.stats;
            setKpisState({
              profileStrength: s.profileStrength ?? 0,
              applications: s.applications ?? 0,
              interviews: s.interviews ?? 0,
              nextTask: s.nextTask ?? '—',
            });
          }
        }

        // Mentors & events
        const [mentorsRes, eventsRes] = await Promise.all([
          mentorsAPI.getMentors(),
          learningAPI.getEvents(),
        ]);

        if (mentorsRes?.success) {
          const mentorsArray = Array.isArray(mentorsRes.data)
            ? mentorsRes.data
            : [];
          setSuggestedMentor(mentorsArray[0] || null);
        }

        if (eventsRes?.success) {
          const eventsArray = Array.isArray(eventsRes.data)
            ? eventsRes.data
            : [];
          setUpcomingEvents(eventsArray.slice(0, 3));
        }
      } catch (e) {
        console.error('Error loading dashboard base data', e);
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) fetchData();
  }, [authUser]);

  // Jobs for AI-Matched Opportunities (only fetches match percentages, no detailed analysis)
  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      setJobsLoading(true);
      setJobsError(null);
      try {
        const res = await jobsAPI.getJobs();
        if (!res) throw new Error('No response from jobs API');

        const payload = res.data ?? [];
        const userPlanFromApi = res.userPlan ?? 'free';
        const effectivePlan = authUser?.plan || userPlanFromApi || 'free';
        const premium = effectivePlan === 'premium';

        const jobsArray = Array.isArray(payload)
          ? payload.map(normalizeJob)
          : [];

        if (premium) {
          // Filter jobs with 75%+ match (only match percentage is available at this point)
          const filtered = jobsArray.filter((job) => {
            const matchScore =
              job.matchPercentage ?? job.matchScore ?? job.match_score ?? -1;
            return typeof matchScore === 'number' && matchScore >= 75;
          });

          // Sort by match percentage (highest first)
          filtered.sort(
            (a, b) =>
              (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)
          );

          if (mounted) setMatchedJobs(filtered);
        } else {
          if (mounted) setMatchedJobs([]);
        }

        if (mounted) setJobsLoading(false);
      } catch (err) {
        console.error('Failed to load jobs for dashboard', err);
        if (mounted) {
          setJobsError(err.message || 'Failed to load matched jobs');
          setJobsLoading(false);
        }
      }
    };

    if (authUser) loadJobs();
    return () => {
      mounted = false;
    };
  }, [authUser]);

  const kpis = [
    {
      label: 'Profile Strength',
      value: `${kpisState.profileStrength}%`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Applications',
      value: `${kpisState.applications}`,
      subtitle: 'In Progress',
      icon: Briefcase,
      color: 'text-[#FF7000]',
      bgColor: 'bg-[#FFE4CC]',
    },
    {
      label: 'Interview Invites',
      value: `${kpisState.interviews}`,
      subtitle: 'This week',
      icon: Video,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Next Task',
      value: kpisState.nextTask || '—',
      subtitle: '',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <DashboardLayout user={authUser}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1
            className="text-3xl font-bold text-[#0F151D] mb-2"
          >
            Welcome back, {authUser?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-[#4B5563]">
            Here's what's happening with your career journey
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={index}
                className="transition-all border-none shadow-md hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-[#4B5563] mb-2">
                        {kpi.label}
                      </p>
                      <p
                        className="text-2xl font-bold text-[#0F151D]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {kpi.value}
                      </p>
                      {kpi.subtitle && (
                        <p className="text-xs text-[#4B5563] mt-1">
                          {kpi.subtitle}
                        </p>
                      )}
                    </div>
                    <div
                      className={`h-12 w-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                  </div>
                  {kpi.label === 'Profile Strength' && (
                    <Progress
                      value={kpisState.profileStrength}
                      className="h-2 mt-4"
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* AI Match Feed */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle
                      className="flex items-center gap-2 text-xl"
                    >
                      AI-Matched Opportunities
                      {isPremium && (
                        <Crown className="w-5 h-5 text-[#FF7000]" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {isPremium
                        ? 'Top matches based on your profile (75%+ match)'
                        : 'Unlock AI-powered job matching'}
                    </CardDescription>
                  </div>
                  {isPremium && (
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/jobs')}
                      className="text-[#FF7000] hover:text-[#FF7000]/90 hover:bg-[#FFE4CC]"
                    >
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!isPremium ? (
                  <div className="px-4 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFE4CC] rounded-full mb-4">
                      <Lock className="w-8 h-8 text-[#FF7000]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0F151D] mb-2">
                      AI-Matched Jobs Locked
                    </h3>
                    <p className="text-sm text-[#4B5563] mb-6 max-w-md mx-auto">
                      Upgrade to Premium to unlock AI-powered job matching with
                      personalized insights and recommendations.
                    </p>
                    <Button
                      onClick={() => navigate('/pricing')}
                      className=" bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                ) : jobsLoading ? (
                  <div className="py-12 text-center">
                    <p className="text-[#4B5563]">Loading opportunities...</p>
                  </div>
                ) : jobsError ? (
                  <div className="py-12 text-center">
                    <p className="text-red-600">Error: {jobsError}</p>
                  </div>
                ) : matchedJobs.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0F151D] mb-2">
                      No High-Match Jobs Found
                    </h3>
                    <p className="text-sm text-[#4B5563] mb-6 max-w-md mx-auto">
                      No jobs with 75%+ match available at the moment. Check
                      the Jobs page to see all opportunities.
                    </p>
                    <Button
                      onClick={() => navigate('/jobs')}
                      variant="outline"
                      className="border-[#FF7000] text-[#FF7000] hover:bg-[#FFE4CC]"
                    >
                      Browse All Jobs
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchedJobs.map((job) => {
                      const matchScore =
                        job.matchPercentage ??
                        job.matchScore ??
                        job.match_score ??
                        0;
                      return (
                        <div
                          key={job.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-[#FF7000] hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={job.logo}
                              alt={job.company}
                              onError={(e) => {
                                e.currentTarget.src =
                                  '/images/company-placeholder.png';
                              }}
                              className="flex-shrink-0 object-cover rounded-lg h-14 w-14"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-[#0F151D] mb-1">
                                    {job.title}
                                  </h3>
                                  <p className="text-sm text-[#4B5563]">
                                    {job.company} • {job.location}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  <div
                                    className={`${getMatchBgColor(
                                      matchScore
                                    )} ${getMatchColor(
                                      matchScore
                                    )} px-3 py-1 rounded-full text-sm font-semibold`}
                                  >
                                    {matchScore}% Match
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {(job.skills || [])
                                  .slice(0, 4)
                                  .map((skill, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {skill.skill_name ||
                                        skill.name ||
                                        skill}
                                    </Badge>
                                  ))}
                              </div>

                              <button
                                type="button"
                                className="text-sm text-[#FF7000] cursor-pointer hover:underline flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedJobId(job.id);
                                }}
                              >
                                <span>Why you match</span>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle
                  className="text-lg"
                >
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-[#FFFDFA] rounded-lg hover:bg-[#FFE4CC]/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 bg-[#E8F0FF] rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-[#284688]">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                          })}
                        </span>
                        <span className="text-lg font-bold text-[#284688]">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#0F151D] text-sm mb-1">
                          {event.title}
                        </h4>
                        <p className="text-xs text-[#4B5563]">
                          {event.time} • {event.location}
                        </p>
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
                <CardTitle
                  className="text-lg"
                >
                  Suggested Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-[#FFE4CC]">
                    <AvatarImage
                      src={suggestedMentor?.avatar}
                      alt={suggestedMentor?.name}
                    />
                    <AvatarFallback>
                      {suggestedMentor?.name
                        ? suggestedMentor.name.charAt(0)
                        : 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-[#0F151D] mb-1">
                    {suggestedMentor?.name || 'No mentor found'}
                  </h4>
                  <p className="text-sm text-[#4B5563] mb-2">
                    {suggestedMentor?.title || ''}
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">
                      {suggestedMentor?.rating || '—'}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] mb-4">
                    {suggestedMentor?.bio || ''}
                  </p>
                  <Button
                    className="w-full  bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white"
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
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-white rounded-full">
                    <Lightbulb className="h-5 w-5 text-[#FF7000]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0F151D] mb-2">
                      Resume Tip
                    </h4>
                    <p className="text-sm text-[#4B5563]">
                      Use action verbs like "Led," "Implemented," and
                      "Achieved" to make your experience stand out.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Job Details Sheet - fetches full details with AI analysis when opened */}
      <JobDetailsSheet
        jobId={selectedJobId}
        open={!!selectedJobId}
        onOpenChange={(open) => {
          if (!open) setSelectedJobId(null);
        }}
        onApply={(applicationData) => {
          toast.success(applicationData?.message || 'Application submitted');

          // Update matchedJobs state to reflect applied status
          setMatchedJobs(prev =>
            prev.map(j => {
              if (!j) return j;
              const jid = j.id || j._id || j.jobId;
              const appliedJobId =
                applicationData?.job?.id ||
                applicationData?.job?._id ||
                applicationData?.job_id ||
                applicationData?.jobId ||
                applicationData?.job?.jobId ||
                selectedJobId;

              if (String(jid) === String(appliedJobId)) {
                return { ...j, applicationStatus: 'applied' };
              }
              return j;
            })
          );
        }}
        onToggleSave={(jobId) => {
          console.log('Toggle save for job:', jobId);
          // Implement save/unsave logic if needed
        }}
        savedJobIds={[]}
        isPremium={isPremium}
      />
    </DashboardLayout>
  );
};

export default Dashboard;