import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { jobs, users } from '../utils/mockData';
import { getMatchColor, getMatchBgColor, formatDate } from '../lib/utils';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = users.student;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    roles: [],
    locations: [],
    modes: [],
    types: []
  });
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('id'));
  const [savedJobIds, setSavedJobIds] = useState(['job-3', 'job-4']);

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = selectedFilters.roles.length === 0 || 
      selectedFilters.roles.some(role => job.title.includes(role));
    
    const matchesLocation = selectedFilters.locations.length === 0 ||
      selectedFilters.locations.some(loc => job.location.includes(loc));
    
    const matchesMode = selectedFilters.modes.length === 0 ||
      selectedFilters.modes.includes(job.mode);
    
    const matchesType = selectedFilters.types.length === 0 ||
      selectedFilters.types.includes(job.type);

    return matchesSearch && matchesRole && matchesLocation && matchesMode && matchesType;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => b.matchScore - a.matchScore);

  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : null;

  const toggleSave = (jobId) => {
    setSavedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleApply = (job) => {
    // Mock application
    alert(`Application submitted for ${job.title} at ${job.company}!`);
    navigate('/applications');
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Explore Opportunities
          </h1>
          <p className="text-[#4B5563]">Find your perfect role with AI-powered matching</p>
        </div>

        {/* Search & Filters */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by role, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button 
                variant="outline" 
                className="h-12 px-6"
                onClick={() => document.getElementById('filter-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Filter className="h-5 w-5 mr-2" />
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
                          className={`cursor-pointer transition-all ${
                            isSelected
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
                  <X className="h-4 w-4 mr-1" />
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
          <p className="text-sm text-[#4B5563]">Sorted by match score</p>
        </div>

        {/* Job Listings */}
        <div className="grid gap-4">
          {sortedJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            return (
              <Card 
                key={job.id}
                className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedJobId(job.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img 
                      src={job.logo} 
                      alt={job.company} 
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[#0F151D] mb-1">{job.title}</h3>
                          <p className="text-[#4B5563] mb-2">{job.company}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-[#4B5563]">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {job.mode}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salary}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`${getMatchBgColor(job.matchScore)} ${getMatchColor(job.matchScore)} px-4 py-2 rounded-full text-base font-semibold whitespace-nowrap`}>
                            {job.matchScore}% Match
                          </div>
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
                        {job.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-[#4B5563]">
                        Posted {formatDate(job.postedDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Job Details Drawer */}
      <Sheet open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJobId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedJob && (
            <>
              <SheetHeader>
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={selectedJob.logo} 
                    alt={selectedJob.company} 
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <SheetTitle className="text-2xl mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {selectedJob.title}
                    </SheetTitle>
                    <SheetDescription className="text-base">
                      {selectedJob.company}
                    </SheetDescription>
                  </div>
                  <div className={`${getMatchBgColor(selectedJob.matchScore)} ${getMatchColor(selectedJob.matchScore)} px-4 py-2 rounded-full text-base font-semibold`}>
                    {selectedJob.matchScore}% Match
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[#4B5563]" />
                    <span className="text-[#4B5563]">{selectedJob.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-[#4B5563]" />
                    <span className="text-[#4B5563]">{selectedJob.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-[#4B5563]" />
                    <span className="text-[#4B5563]">{selectedJob.mode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-[#4B5563]" />
                    <span className="text-[#4B5563]">{selectedJob.salary}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <Badge key={skill} className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Match Analysis */}
                <div className="bg-[#FFFDFA] rounded-lg p-4">
                  <h3 className="font-semibold text-[#0F151D] mb-3">Why you match</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Strong Match:</p>
                      <ul className="space-y-1">
                        {selectedJob.whyMatch.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-[#4B5563]">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {selectedJob.whyNotMatch.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-yellow-700 mb-2">Areas to Improve:</p>
                        <ul className="space-y-1">
                          {selectedJob.whyNotMatch.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[#4B5563]">
                              <span className="h-4 w-4 rounded-full border-2 border-yellow-600 mt-0.5 flex-shrink-0" />
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
                  <h3 className="font-semibold text-[#0F151D] mb-3">Job Description</h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#4B5563]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF7000] mt-2 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Culture */}
                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-3">Company Culture</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.culture.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-[#FF7000] hover:bg-[#FF7000]/90 text-white h-12 text-base"
                    onClick={() => handleApply(selectedJob)}
                  >
                    Apply Now
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => toggleSave(selectedJob.id)}
                  >
                    <Bookmark className={`h-5 w-5 ${savedJobIds.includes(selectedJob.id) ? 'fill-[#FF7000] text-[#FF7000]' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default Jobs;
