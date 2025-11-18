import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Briefcase,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  Mail,
  Star,
  CheckCircle2,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import EmployerLayout from '../components/Layout/EmployerLayout';
import JobModal from '../components/JobModal';
import CandidateDetailsModal from '../components/CandidateDetailsModal';
import { jobsAPI, candidateAPI } from '../services/api';
import { toast } from 'sonner';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getMatchColor, getMatchBgColor } from '../lib/utils';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = user;

  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingJobs, setIsFetchingJobs] = useState(true);
  const [showAllJobs, setShowAllJobs] = useState(false);

  // Top Candidates State
  const [topCandidates, setTopCandidates] = useState([]);
  const [isFetchingCandidates, setIsFetchingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (currentUser?.plan === 'premium') {
      fetchTopCandidates();
    }
  }, [currentUser?.plan]);

  const fetchJobs = async () => {
    try {
      setIsFetchingJobs(true);
      const response = await jobsAPI.getMyJobs();
      if (response.success) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setIsFetchingJobs(false);
    }
  };

  const fetchTopCandidates = async () => {
    try {
      setIsFetchingCandidates(true);
      const response = await candidateAPI.getTopMatches({ limit: 3 });
      if (response.success) {
        setTopCandidates(response.data);
      }
    } catch (error) {
      console.error('Error fetching top candidates:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to fetch top matched candidates');
      }
    } finally {
      setIsFetchingCandidates(false);
    }
  };

  const handleCreateJob = () => {
    setSelectedJob(null);
    setIsModalOpen(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      await api.put(`/jobs/${jobId}`, { status: newStatus });
      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'closed'} successfully`);
      fetchJobs();
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      setIsLoading(true);
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobSubmit = async (data) => {
    try {
      setIsLoading(true);

      if (selectedJob) {
        // Update existing job
        await api.put(`/jobs/${selectedJob._id || selectedJob.id}`, data);
        toast.success('Job updated successfully');
      } else {
        // Create new job
        const response = await jobsAPI.createJob(data);
        if (response.success) {
          toast.success('Job created successfully');
        }
      }

      setIsModalOpen(false);
      setSelectedJob(null);
      fetchJobs();

      // Refresh candidates if premium
      if (currentUser?.plan === 'premium') {
        fetchTopCandidates();
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setIsCandidateModalOpen(true);
  };

  const kpis = [
    { label: 'Open Roles', value: jobs.filter(j => j.status === 'active').length.toString(), icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Total Jobs', value: jobs.length.toString(), icon: Users, color: 'text-[#FF7000]', bgColor: 'bg-[#FFE4CC]' },
    { label: 'Draft Jobs', value: jobs.filter(j => j.status === 'draft').length.toString(), icon: Clock, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Closed Jobs', value: jobs.filter(j => j.status === 'closed').length.toString(), icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ];

  // Dummy data for non-premium users
  const dummyCandidates = [
    {
      id: 'dummy-1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd',
      role: 'Frontend Developer',
      match_percentage: 95,
      skills: ['React', 'TypeScript', 'Node.js'],
      location: 'Bangkok'
    },
    {
      id: 'dummy-2',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
      role: 'Backend Engineer',
      match_percentage: 92,
      skills: ['Python', 'PostgreSQL', 'Docker'],
      location: 'Remote'
    },
    {
      id: 'dummy-3',
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc',
      role: 'Product Designer',
      match_percentage: 88,
      skills: ['Figma', 'UI/UX', 'Prototyping'],
      location: 'Chiang Mai'
    }
  ];

  const displayCandidates = currentUser?.plan === 'premium' ? topCandidates : dummyCandidates;

  return (
    <EmployerLayout user={currentUser}>
      <div className="space-y-8" data-testid="employer-dashboard">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-[#4B5563]">Here's your hiring overview</p>
          </div>
          <Button
            className="hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white"
            onClick={handleCreateJob}
            data-testid="post-new-role-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Role
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="transition-all border-none shadow-md hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-[#4B5563] mb-2">{kpi.label}</p>
                      <p className="text-2xl font-bold text-[#0F151D]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {kpi.value}
                      </p>
                    </div>
                    <div className={`h-12 w-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Open Roles */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Posted Jobs</CardTitle>
                  {jobs.length > 5 && (
                    <Button
                      variant="ghost"
                      className="text-[#FF7000] hover:text-[#FF7000]/90"
                      onClick={() => setShowAllJobs(!showAllJobs)}
                    >
                      {showAllJobs ? 'Show Less' : `View All (${jobs.length})`}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isFetchingJobs ? (
                  <div className="text-center py-8 text-[#4B5563]">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-[#4B5563] mb-4">No jobs posted yet</p>
                    <Button
                      onClick={handleCreateJob}
                      className=" hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  (showAllJobs ? jobs : jobs.slice(0, 5)).map((job) => (
                    <div
                      key={job._id || job.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-[#FF7000] hover:shadow-md transition-all"
                      data-testid="job-card"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#0F151D] mb-1">{job.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                            <span>{job.type}</span>
                            <span>•</span>
                            <span>{job.mode}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <Badge
                          className={
                            job.status === 'active'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : job.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#4B5563] mb-3 line-clamp-2">{job.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={job.status === 'active'}
                              onCheckedChange={() => handleToggleJobStatus(job._id || job.id, job.status)}
                              className="data-[state=checked]: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white"
                            />
                            <span className="text-sm text-[#4B5563]">
                              {job.status === 'active' ? 'Active' : 'Closed'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditJob(job)}
                            data-testid="edit-job-btn"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteJob(job._id || job.id)}
                            disabled={isLoading}
                            data-testid="delete-job-btn"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: 'New application', candidate: 'Sarah Johnson', role: 'Frontend Developer', time: '2 hours ago' },
                  { action: 'Interview scheduled', candidate: 'Michael Chen', role: 'Backend Engineer', time: '5 hours ago' },
                  { action: 'Candidate shortlisted', candidate: 'Emily Rodriguez', role: 'Product Designer', time: '1 day ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                    <div className="h-10 w-10 bg-[#E8F0FF] rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-[#284688]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0F151D]">{activity.action}</p>
                      <p className="text-sm text-[#4B5563]">
                        {activity.candidate} • {activity.role}
                      </p>
                      <p className="text-xs text-[#4B5563] mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Top Candidates */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Top Matched Candidates</CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {currentUser?.plan !== 'premium' && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-[7px]">
                    <div className="p-6 text-center">
                      <Star className="w-12 h-12 text-[#FF7000] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#0F151D] mb-2">
                        Premium Feature
                      </h3>
                      <p className="text-sm text-[#4B5563] mb-4">
                        Upgrade to Premium to access AI-powered candidate matching
                      </p>
                      <Button
                        className=" bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] hover: text-white/90 text-white"
                        onClick={() => navigate('/pricing')}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  </div>
                )}
                <div className={currentUser?.plan !== 'premium' ? 'blur-sm pointer-events-none' : ''}>
                  {isFetchingCandidates ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-[#FF7000] mb-2" />
                      <p className="text-sm text-[#4B5563]">Analyzing candidates...</p>
                    </div>
                  ) : displayCandidates.length === 0 ? (
                    <div className="py-8 text-center">
                      <Users className="w-12 h-12 text-[#4B5563] mx-auto mb-3" />
                      <p className="text-sm text-[#4B5563]">
                        No matched candidates yet. Post active jobs to get AI recommendations.
                      </p>
                    </div>
                  ) : (
                    displayCandidates.map((candidate) => {
                      const matchScore = candidate.match_percentage || 0;
                      return (
                        <div
                          key={candidate.id}
                          className="p-4 bg-[#FFFDFA] rounded-lg hover:bg-[#FFE4CC]/30 transition-colors"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="h-12 w-12 border-2 border-[#FFE4CC]">
                              <AvatarImage src={candidate.avatar} alt={candidate.name} />
                              <AvatarFallback className="bg-[#E8F0FF] text-[#284688]">
                                {candidate.name?.charAt(0) || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#0F151D] text-sm">{candidate.name}</h4>
                              <p className="text-xs text-[#4B5563]">
                                {candidate.desired_positions?.[0] || candidate.role || 'Candidate'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(candidate.skills || []).slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{candidate.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white h-8 text-xs"
                              onClick={() => handleViewCandidate(candidate)}
                              disabled={currentUser?.plan !== 'premium'}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              See Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                              disabled={currentUser?.plan !== 'premium'}
                            >
                              <Mail className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-md bg-gradient-to-br from-[#E8F0FF] to-[#FFE4CC]">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#0F151D] mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="justify-start w-full bg-white"
                    onClick={handleCreateJob}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full bg-white"
                    onClick={() => navigate('/employer/candidates')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View All Candidates
                  </Button>
                  <Button variant="outline" className="justify-start w-full bg-white">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Job Modal */}
      <JobModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
        onSubmit={handleJobSubmit}
        initialData={selectedJob}
        isLoading={isLoading}
      />

      {/* Candidate Details Modal */}
      <CandidateDetailsModal
        open={isCandidateModalOpen}
        onClose={() => {
          setIsCandidateModalOpen(false);
          setSelectedCandidate(null);
        }}
        candidate={selectedCandidate}
      />
    </EmployerLayout>
  );
};

export default EmployerDashboard;