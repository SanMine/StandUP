import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  X,
  Filter,
  Bookmark,
  Share2,
  Building,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  Lock,
  Sparkles,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../services/api';
import { getMatchColor, getMatchBgColor, formatDate } from '../lib/utils';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import JobDetailsSheet from '@/components/JobDetailsSheet';

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const currentUser = authUser || { name: 'Student', role: 'student', plan: 'free' };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    roles: [],
    locations: [],
    modes: [],
    types: []
  });
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('id'));
  const [savedJobIds, setSavedJobIds] = useState(['job-3', 'job-4']);
  const [jobsList, setJobsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPlan, setUserPlan] = useState('free');

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

  // Filter jobs based on search and selected filters
  const filteredJobs = jobsList.filter(job => {
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
    if (userPlan === 'premium') {
      const scoreA = a.matchPercentage ?? a.matchScore ?? a.match_score ?? 0;
      const scoreB = b.matchPercentage ?? b.matchScore ?? b.match_score ?? 0;
      return scoreB - scoreA;
    }
    // Default sort by posted date for free users
    return new Date(b.posted_date) - new Date(a.posted_date);
  });

  const selectedJob = selectedJobId ? jobsList.find(j => j.id === selectedJobId) : null;

  const toggleSave = (jobId) => {
    setSavedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleApply = (job) => {
    alert(`Application submitted for ${job.title} at ${job.company}!`);
    navigate('/applications');
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

  const isPremium = authUser.plan === 'premium'

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Explore Opportunities
            </h1>
            <p className="text-[#4B5563]">
              {isPremium ? 'Find your perfect role with AI-powered matching' : 'Browse available job opportunities'}
            </p>
          </div>
          {!isPremium && (
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-[#FF7000] to-[#FF9500] hover:from-[#FF7000]/90 hover:to-[#FF9500]/90 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
        </div>

        {/* Premium Banner for Free Users */}
        {!isPremium && (
          <Card className="border-2 border-[#FF7000] bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD5]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FF7000] rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0F151D] mb-2">
                    Unlock AI-Powered Job Matching
                  </h3>
                  <p className="text-[#4B5563] mb-4">
                    Get personalized match scores, discover why you're perfect for each role, and receive tailored skill recommendations with Premium.
                  </p>
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
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
                  className="h-12 pl-10 text-base"
                />
              </div>
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
          </p>
          {isPremium && <p className="text-sm text-[#4B5563]">Sorted by match score</p>}
        </div>

        {/* Job Listings */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-[#4B5563]">Loading opportunities...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : sortedJobs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#4B5563]">No opportunities found matching your criteria</p>
            </div>
          ) : (
            sortedJobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              const matchScore = job.matchPercentage ?? job.matchScore ?? job.match_score ?? 0;

              return (
                <Card
                  key={job.id}
                  className="transition-all border-none shadow-md cursor-pointer hover:shadow-xl"
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={job.logo}
                        alt={job.company}
                        className="flex-shrink-0 object-cover w-16 h-16 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-[#0F151D] mb-1">{job.title}</h3>
                            <p className="text-[#4B5563] mb-2">{job.company}</p>
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
                              <div className={`${getMatchBgColor(matchScore)} ${getMatchColor(matchScore)} px-4 py-2 rounded-full text-base font-semibold whitespace-nowrap`}>
                                {matchScore}% Match
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-4 py-2 text-base font-semibold text-gray-400 bg-gray-100 rounded-full whitespace-nowrap">
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
                              className={isSaved ? 'text-[#FF7000]' : 'text-gray-400'}
                            >
                              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-[#FF7000]' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(job.skills || []).slice(0, 8).map((skill, idx) => {
                            const name = skill && (skill.skill_name || skill.name || skill);
                            return (
                              <Badge key={`${name}-${idx}`} variant="outline" className="text-xs">
                                {name}
                              </Badge>
                            );
                          })}
                        </div>
                        <p className="text-sm text-[#4B5563]">
                          Posted {formatDate(job.postedDate || job.posted_date || job.posted_at || job.postedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Job Details Drawer */}
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
    </DashboardLayout>
  );
};

export default Jobs;