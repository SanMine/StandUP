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
  Users,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI, applicationsAPI } from '../services/api';
import { getMatchColor, getMatchBgColor, formatDate } from '../lib/utils';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import EmployerLayout from '@/components/Layout/EmployerLayout';

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const currentUser = authUser || { name: 'Student', role: 'student' };
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

  // Filter jobs based on search and selected filters
  const filteredJobs = jobsList.filter(job => {
    if (showSavedOnly && !savedJobIds.includes(job._id || job.id)) {
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

  const sortedJobs = [...filteredJobs].sort((a, b) => ( (b.matchScore ?? b.match_score ?? 0) - (a.matchScore ?? a.match_score ?? 0) ));

  const selectedJob = selectedJobId ? jobsList.find(j => j.id === selectedJobId) : null;

  const toggleSave = async (jobId) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      const isSaved = savedJobIds.includes(jobId);
      
      if (isSaved) {
        await applicationsAPI.unsaveJob(jobId);
        setSavedJobIds(prev => prev.filter(id => id !== jobId));
        toast.success('Job removed from saved');
      } else {
        await applicationsAPI.saveJob(jobId);
        setSavedJobIds(prev => [...prev, jobId]);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update saved job');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = (job) => {
    alert(`Application submitted for ${job.title} at ${job.company}!`);
    navigate('/applications');
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  useEffect(() => {
    let mounted = true;
    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await jobsAPI.getJobs();
        if (res && res.success) {
          if (mounted) setJobsList(Array.isArray(res.data) ? res.data : []);
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

    const loadSavedJobs = async () => {
      try {
        const res = await applicationsAPI.getSavedJobs();
        if (res && res.success && Array.isArray(res.data)) {
          const savedIds = res.data.map(savedJob => savedJob.job_id).filter(Boolean);
          if (mounted) setSavedJobIds(savedIds);
        }
      } catch (err) {
        console.error('Failed to load saved jobs', err);
      }
    };

    loadJobs();
    if (currentUser.role === 'student') {
      loadSavedJobs();
    }
    
    return () => { mounted = false; };
  }, [currentUser.role]);

  const Layout = currentUser.role === 'employer' ? EmployerLayout : DashboardLayout;

  const getMatchScoreGradient = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-orange-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <Layout user={currentUser}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Explore Opportunities
                </h1>
                <p className="text-gray-600 text-lg flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  Find your perfect role with AI-powered matching
                </p>
              </div>
            </div>
            {currentUser.role === 'student' && (
              <Button
                variant={showSavedOnly ? "default" : "outline"}
                className={showSavedOnly 
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-12 px-6 shadow-lg" 
                  : "border-2 border-orange-500 text-orange-600 hover:bg-orange-50 h-12 px-6"}
                onClick={() => setShowSavedOnly(!showSavedOnly)}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${showSavedOnly ? 'fill-white' : 'fill-orange-500'}`} />
                {showSavedOnly ? 'Show All Jobs' : `Saved (${savedJobIds.length})`}
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Search & Filters */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by role, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl shadow-sm transition-all"
                />
              </div>
              <Button 
                variant="outline" 
                className="h-14 px-6 border-2 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all"
                onClick={() => document.getElementById('filter-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 border-0">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Chips */}
            <div id="filter-section" className="space-y-5">
              {Object.entries(filterOptions).map(([category, options]) => (
                <div key={category}>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 capitalize flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => {
                      const isSelected = selectedFilters[category].includes(option);
                      return (
                        <Badge
                          key={option}
                          onClick={() => toggleFilter(category, option)}
                          className={`cursor-pointer transition-all px-4 py-2 text-sm font-medium ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg scale-105 border-0'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md border border-gray-300'
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
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-medium"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Results */}
        <div className="flex items-center justify-between px-2">
          <p className="text-gray-600">
            <span className="font-bold text-2xl text-gray-900">{sortedJobs.length}</span>
            <span className="ml-2">opportunities found</span>
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="w-4 h-4 text-orange-500" />
            <span className="font-medium">Sorted by match score</span>
          </div>
        </div>

        {/* Enhanced Job Listings */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
            <p className="text-gray-600 mt-4">Loading opportunities...</p>
          </div>
        ) : sortedJobs.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5">
            {sortedJobs.map((job) => {
              const jobId = job._id || job.id;
              const isSaved = savedJobIds.includes(jobId);
              const matchScore = job.matchScore ?? job.match_score ?? 0;
              return (
                <Card 
                  key={jobId}
                  className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
                  onClick={() => setSelectedJobId(jobId)}
                >
                  <CardContent className="p-6 relative">
                    <div className="flex items-start gap-6">
                      {/* Company Logo */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-2 ring-gray-100">
                          <img 
                            src={job.logo} 
                            alt={job.company} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{job.title}</h3>
                            <p className="text-gray-600 text-lg font-medium mb-3">{job.company}</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-medium">
                                <Briefcase className="h-4 w-4" />
                                {job.type}
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium">
                                <Building className="h-4 w-4" />
                                {job.mode}
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg font-medium">
                                <DollarSign className="h-4 w-4" />
                                {job.salary}
                              </span>
                            </div>
                          </div>

                          {/* Match Score & Actions */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className={`px-6 py-3 bg-gradient-to-r ${getMatchScoreGradient(matchScore)} text-white rounded-2xl shadow-lg font-bold text-lg min-w-[100px] text-center`}>
                              {matchScore}%
                              <div className="text-xs font-normal opacity-90">Match</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(jobId);
                              }}
                              disabled={isSaving}
                              className={`h-12 w-12 rounded-xl hover:scale-110 transition-transform ${
                                isSaved 
                                  ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                                  : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                              }`}
                            >
                              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-orange-600' : ''}`} />
                            </Button>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(job.skills || []).slice(0, 8).map((skill) => {
                            const name = skill && (skill.skill_name || skill.name || skill);
                            return (
                              <Badge key={name} className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 px-3 py-1 hover:from-gray-200 hover:to-gray-300 transition-all">
                                {name}
                              </Badge>
                            );
                          })}
                        </div>

                        {/* Posted Date */}
                        <p className="text-sm text-gray-500 font-medium">
                          Posted {formatDate(job.postedDate || job.posted_date || job.posted_at || job.postedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Job Details Drawer */}
      <Sheet open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJobId(null)}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          {selectedJob && (
            <>
              <SheetHeader>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-2 ring-gray-100 flex-shrink-0">
                    <img 
                      src={selectedJob.logo} 
                      alt={selectedJob.company} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-3xl mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {selectedJob.title}
                    </SheetTitle>
                    <SheetDescription className="text-lg">
                      {selectedJob.company}
                    </SheetDescription>
                  </div>
                  {(() => {
                    const score = selectedJob.matchScore ?? selectedJob.match_score ?? 0;
                    return (
                      <div className={`px-6 py-3 bg-gradient-to-r ${getMatchScoreGradient(score)} text-white rounded-2xl shadow-lg font-bold text-lg text-center`}>
                        {score}%
                        <div className="text-xs font-normal opacity-90">Match</div>
                      </div>
                    );
                  })()}
                </div>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase">Location</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedJob.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-600 uppercase">Type</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedJob.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase">Mode</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedJob.mode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-orange-600 uppercase">Salary</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedJob.salary}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedJob.skills || []).map((skill) => {
                      const name = skill && (skill.skill_name || skill.name || skill);
                      return (
                        <Badge key={name} className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 px-3 py-1.5">
                          {name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Match Analysis */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Why You Match
                  </h3>
                  <div className="space-y-4">
                    {(selectedJob.whyMatch || []).length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Strong Matches
                        </p>
                        <ul className="space-y-2">
                          {(selectedJob.whyMatch || []).map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(selectedJob.whyNotMatch || []).length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Areas to Improve
                        </p>
                        <ul className="space-y-2">
                          {(selectedJob.whyNotMatch || []).map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Job Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Requirements</h3>
                  <ul className="space-y-2">
                    {(selectedJob.requirements || []).map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mt-2 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Culture */}
                {(selectedJob.culture || []).length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Company Culture</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedJob.culture || []).map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
                  <Button 
                    className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={() => handleApply(selectedJob)}
                  >
                    Apply Now
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-xl border-2 hover:border-orange-500 hover:bg-orange-50 transition-all"
                    onClick={() => toggleSave(selectedJob._id || selectedJob.id)}
                    disabled={isSaving}
                  >
                    <Bookmark className={`h-6 w-6 ${
                      savedJobIds.includes(selectedJob._id || selectedJob.id) 
                        ? 'fill-orange-600 text-orange-600' 
                        : 'text-gray-600'
                    }`} />
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-xl border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <Share2 className="h-6 w-6 text-gray-600" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default Jobs;