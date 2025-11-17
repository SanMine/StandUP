import {
  Bookmark,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Crown,
  DollarSign,
  Filter,
  Lock,
  MapPin,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import EmployerLayout from '../components/Layout/EmployerLayout';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import JobDetailsSheet from '../components/JobDetailsSheet';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { formatDate, getMatchBgColor, getMatchColor } from '../lib/utils';
import { applicationsAPI, jobsAPI } from '../services/api';

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const currentUser = authUser || { name: 'Student', role: 'student', plan: 'free' };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    roles: [],
    locations: [],
    modes: [],
    types: []
  });
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('id'));
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filterOptions = {
    roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Data Analyst'],
    locations: ['Bangkok', 'Chiang Mai', 'Remote'],
    modes: ['Onsite', 'Hybrid', 'Remote'],
    types: ['Internship', 'Full-time', 'Part-time']
  };

  const toggleFilter = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      roles: [],
      locations: [],
      modes: [],
      types: []
    });
  };

  const isPremium = authUser?.plan === 'premium';

  // Filter jobs based on search, filters, and saved status
  const filteredJobs = jobsList.filter(job => {
    // Saved filter
    if (showSavedOnly && !savedJobIds.includes(job.id)) {
      return false;
    }

    const title = (job.title || '').toString();
    const company = (job.company || '').toString();
    const skillsArr = Array.isArray(job.skills) ? job.skills.map(s => s.skill_name || s) : [];

    const matchesSearch = searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skillsArr.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedFilters.roles.length === 0 ||
      selectedFilters.roles.some(role => title.includes(role));

    const matchesLocation = selectedFilters.locations.length === 0 ||
      selectedFilters.locations.some(loc => (job.location || '').includes(loc));

    const matchesMode = selectedFilters.modes.length === 0 ||
      selectedFilters.modes.includes(job.mode);

    const matchesType = selectedFilters.types.length === 0 ||
      selectedFilters.types.includes(job.type);

    return matchesSearch && matchesRole && matchesLocation && matchesMode && matchesType;
  });

  // Sort by match percentage (AI-powered) if premium, otherwise by posted date
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (isPremium) {
      const scoreA = a.matchPercentage ?? a.matchScore ?? a.match_score ?? 0;
      const scoreB = b.matchPercentage ?? b.matchScore ?? b.match_score ?? 0;
      return scoreB - scoreA;
    }
    // Default sort by posted date for free users
    return new Date(b.posted_date || b.postedAt || b.postedDate) - new Date(a.posted_date || a.postedAt || a.postedDate);
  });

  const selectedJob = selectedJobId ? jobsList.find(j => String(j.id) === String(selectedJobId)) : null;

  const toggleSave = async (jobId) => {
    if (isSaving) return;

    const isSaved = savedJobIds.includes(jobId);
    setIsSaving(true);

    try {
      if (isSaved) {
        await applicationsAPI.unsaveJob(jobId);
        setSavedJobIds(prev => prev.filter(id => id !== jobId));
        toast({
          title: 'Job removed',
          description: 'Job removed from your saved list',
        });
      } else {
        await applicationsAPI.saveJob(jobId);
        setSavedJobIds(prev => [...prev, jobId]);
        toast({
          title: 'Job saved',
          description: 'Job added to your saved list',
        });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: 'Error',
        description: 'Failed to update saved status',
        variant: 'destructive',
      });
      throw error; // rethrow so callers (like JobDetailsSheet) can react
    } finally {
      setIsSaving(false);
    }
  };

  // NOTE: keep this for other in-file apply flows (e.g., listings quick-apply)
  const handleApply = async (job) => {
    try {
      await applicationsAPI.applyForJob(job.id);
      toast({
        title: 'Application submitted',
        description: `Your application for ${job.title} at ${job.company} has been submitted!`,
      });
      // Update local state
      setJobsList(prev => prev.map(j =>
        j.id === job.id ? { ...j, applicationStatus: 'applied' } : j
      ));
      setSelectedJobId(null);
    } catch (error) {
      console.error('Error applying:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit application',
        variant: 'destructive',
      });
    }
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  // Fetch jobs from backend
  useEffect(() => {
    let mounted = true;
    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await jobsAPI.getJobs();
        if (res && res.success) {
          if (mounted) {
            setJobsList(Array.isArray(res.data) ? res.data : []);
            setUserPlan(res.userPlan || 'free');
          }
        } else {
          if (mounted) setJobsList([]);
        }
      } catch (err) {
        console.error('Failed to load jobs', err);
        if (mounted) setError(err.message || 'Failed to load jobs');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadJobs();
    return () => { mounted = false; };
  }, []);

  // Fetch saved jobs
  useEffect(() => {
    let mounted = true;
    const loadSavedJobs = async () => {
      try {
        const res = await applicationsAPI.getSavedJobs();
        if (res && res.success && mounted) {
          const savedIds = (res.data || []).map(job => job.id || job.job_id);
          setSavedJobIds(savedIds);
        }
      } catch (err) {
        console.error('Failed to load saved jobs', err);
      }
    };

    if (authUser) {
      loadSavedJobs();
    }
    return () => { mounted = false; };
  }, [authUser]);

  const Layout = currentUser.role === 'employer' ? EmployerLayout : DashboardLayout;

  // onApply handler coming from JobDetailsSheet: best-effort update of local jobsList.
  const handleSheetApply = (payload) => {
    // payload might be application object or job object; attempt to extract job id
    const jobId =
      payload?.job?.id ||
      payload?.job_id ||
      payload?.jobId ||
      payload?.id ||
      payload?.job?._id;

    if (jobId) {
      setJobsList(prev => prev.map(j => String(j.id) === String(jobId) ? { ...j, applicationStatus: 'applied' } : j));
    }
    // close sheet
    setSelectedJobId(null);
  };

  return (
    <Layout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative p-8 overflow-hidden bg-gradient-to-br from-[#FF7000] via-[#FF8A00] to-[#FF9500] rounded-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-20 -translate-y-20 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 transform -translate-x-16 translate-y-16 bg-white rounded-full opacity-10"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-8 h-8 text-white" />
                  <h1 className="text-4xl font-bold text-white" >
                    {isPremium ? 'Your Perfect Match Awaits' : 'Explore Opportunities'}
                  </h1>
                </div>
                <p className="max-w-2xl text-lg text-white/90">
                  {isPremium
                    ? 'Discover opportunities tailored to your unique profile with AI-powered matching'
                    : 'Browse available job opportunities and unlock AI-powered matching with Premium'}
                </p>

                {isPremium && (
                  <div className="flex gap-6 mt-6">
                    <div className="flex items-start gap-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                      <Target className="w-5 h-5 mt-1 text-white" />
                      <div>
                        <div className="text-sm text-white/70">Best Match</div>
                        <div className="text-xl font-bold text-white">{sortedJobs[0]?.matchPercentage || 0}%</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                      <Briefcase className="w-5 h-5 mt-1 text-white" />
                      <div>
                        <div className="text-sm text-white/70">New Opportunities</div>
                        <div className="text-xl font-bold text-white">{sortedJobs.length}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                      <Bookmark className="w-5 h-5 mt-1 text-white" />
                      <div>
                        <div className="text-sm text-white/70">Saved Jobs</div>
                        <div className="text-xl font-bold text-white">{savedJobIds.length}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!isPremium && (
                <Button
                  onClick={() => navigate('/pricing')}
                  className="bg-white text-[#FF7000] hover:bg-white/90 shadow-lg"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Premium Banner for Free Users */}
        {!isPremium && (
          <Card className="border-2 border-[#FF7000] bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD5] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-[#FF7000] to-[#FF9500] rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#0F151D] mb-2">
                    🚀 Unlock AI-Powered Job Matching
                  </h3>
                  <p className="text-[#4B5563] mb-4 leading-relaxed">
                    Get personalized match scores based on your skills and experience, discover why you're perfect for each role,
                    and receive tailored skill recommendations. Premium members get 3x more interviews!
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg">
                      <Target className="w-4 h-4 text-[#FF7000]" />
                      <span className="text-sm font-medium">Smart Matching</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg">
                      <TrendingUp className="w-4 h-4 text-[#FF7000]" />
                      <span className="text-sm font-medium">Skill Insights</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg">
                      <Sparkles className="w-4 h-4 text-[#FF7000]" />
                      <span className="text-sm font-medium">Priority Support</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-r from-[#FF7000] to-[#FF9500] hover:from-[#FF7000]/90 hover:to-[#FF9500]/90 text-white shadow-md"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now - Starting at $50/month
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <Input
                  type="text"
                  placeholder="Search by role, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-10 text-base border-gray-200 focus:border-[#FF7000] focus:ring-[#FF7000]"
                />
              </div>
              <Button
                variant={showSavedOnly ? "default" : "outline"}
                className={`h-12 px-6 ${showSavedOnly ? 'bg-[#FF7000] hover:bg-[#FF7000]/90 text-white' : ''}`}
                onClick={() => setShowSavedOnly(!showSavedOnly)}
              >
                <Bookmark className={`w-5 h-5 mr-2 ${showSavedOnly ? 'fill-white' : ''}`} />
                Saved {savedJobIds.length > 0 && `(${savedJobIds.length})`}
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6"
                onClick={() => document.getElementById('filter-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-[#FF7000] text-white hover:bg-[#FF7000]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Chips */}
            <div id="filter-section" className="mt-6 space-y-4">
              {Object.entries(filterOptions).map(([category, options]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-[#4B5563] mb-2 capitalize">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => {
                      const isSelected = selectedFilters[category].includes(option);
                      return (
                        <Badge
                          key={option}
                          onClick={() => toggleFilter(category, option)}
                          className={`cursor-pointer transition-all ${isSelected
                            ? 'bg-[#FF7000] text-white hover:bg-[#FF7000]/90'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {option}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#FF7000] hover:text-[#FF7000]/90 hover:bg-[#FFE4CC]"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-[#4B5563]">
            <span className="font-semibold text-[#0F151D]">{sortedJobs.length}</span> opportunities found
            {showSavedOnly && ' (saved)'}
          </p>
          {isPremium && <p className="text-sm text-[#4B5563]">✨ Sorted by AI match score</p>}
        </div>

        {/* Job Listings */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#FF7000] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#4B5563]">Loading opportunities...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : sortedJobs.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-[#4B5563]">
                {showSavedOnly
                  ? 'No saved jobs yet. Start exploring and save opportunities you\'re interested in!'
                  : 'No opportunities found matching your criteria'}
              </p>
              {showSavedOnly && (
                <Button
                  onClick={() => setShowSavedOnly(false)}
                  className="mt-4 bg-[#FF7000] hover:bg-[#FF7000]/90"
                >
                  Browse All Jobs
                </Button>
              )}
            </div>
          ) : (
            sortedJobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              const matchScore = job.matchPercentage ?? job.matchScore ?? job.match_score ?? 0;
              const hasApplied = job.applicationStatus === 'applied';

              return (
                <Card
                  key={job.id}
                  className="transition-all border-none shadow-md cursor-pointer hover:shadow-xl hover:scale-[1.01]"
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="object-cover w-16 h-16 rounded-xl"
                        />
                        {isPremium && matchScore >= 80 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#FF7000] to-[#FF9500] rounded-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold text-[#0F151D]">{job.title}</h3>
                              {hasApplied && (
                                <Badge className="text-green-700 bg-green-100 hover:bg-green-100">
                                  Applied
                                </Badge>
                              )}
                            </div>
                            <p className="text-[#4B5563] mb-2 font-medium">{job.company}</p>
                            <div className="flex flex-wrap gap-3 text-sm text-[#4B5563]">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {job.type}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                {job.mode}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {job.salary}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {isPremium ? (
                              <div className={`${getMatchBgColor(matchScore)} ${getMatchColor(matchScore)} px-4 py-2 rounded-xl text-base font-semibold whitespace-nowrap shadow-sm`}>
                                {matchScore}% Match
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-4 py-2 text-base font-semibold text-gray-400 bg-gray-100 rounded-xl whitespace-nowrap">
                                <Lock className="w-4 h-4" />
                                Premium
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(job.id);
                              }}
                              className={`hover:bg-gray-100 ${isSaved ? 'text-[#FF7000]' : 'text-gray-400'}`}
                              disabled={isSaving}
                            >
                              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-[#FF7000]' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(job.skills || []).slice(0, 8).map((skill, idx) => {
                            const name = skill && (skill.skill_name || skill.name || skill);
                            return (
                              <Badge key={`${name}-${idx}`} variant="outline" className="text-xs bg-gray-50">
                                {name}
                              </Badge>
                            );
                          })}
                          {(job.skills || []).length > 8 && (
                            <Badge variant="outline" className="text-xs bg-gray-50">
                              +{(job.skills || []).length - 8} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                          <Clock className="w-4 h-4" />
                          <span>Posted {formatDate(job.postedDate || job.posted_date || job.posted_at || job.postedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <JobDetailsSheet
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => { if (!open) setSelectedJobId(null); }}
        onApply={(applicationData) => {
          // update jobsList so the card shows Applied
          setJobsList(prev => prev.map(j => j.id === selectedJob?.id ? { ...j, applicationStatus: 'applied' } : j));

          // update local saved/applications state if you have one
          setSavedJobIds(prev => prev); // optional

          // show toast via sonner (sheet already shows one, this is optional)
          // toast.success('Application submitted');

          // if you still want to redirect to applications page:
          // navigate('/applications');
        }}
        onToggleSave={(jobId) => toggleSave(jobId)} // keep your toggleSave implementation
        savedJobIds={savedJobIds}
        isPremium={isPremium}
      />
    </Layout>
  );
};

export default Jobs;