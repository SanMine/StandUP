import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
  Trash2
} from 'lucide-react';
import { users } from '../utils/mockData';
import EmployerLayout from '../components/Layout/EmployerLayout';
import JobModal from '../components/JobModal';
import { jobsAPI } from '../services/api';
import { toast } from 'sonner';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = user;

  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingJobs, setIsFetchingJobs] = useState(true);

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsFetchingJobs(true);
      const response = await jobsAPI.getJobs();
      if (response.success) {
        // Filter to show only jobs by this employer (in real scenario, backend should filter)
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setIsFetchingJobs(false);
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

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      setIsLoading(true);
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchJobs(); // Refresh the list
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
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error submitting job:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save job');
    } finally {
      setIsLoading(false);
    }
  };

  const kpis = [
    { label: 'Open Roles', value: jobs.filter(j => j.status === 'active').length.toString(), icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Total Jobs', value: jobs.length.toString(), icon: Users, color: 'text-[#FF7000]', bgColor: 'bg-[#FFE4CC]' },
    { label: 'Draft Jobs', value: jobs.filter(j => j.status === 'draft').length.toString(), icon: Clock, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Closed Jobs', value: jobs.filter(j => j.status === 'closed').length.toString(), icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ];

  const topCandidates = [
    {
      id: 'cand-1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd',
      role: 'Frontend Developer',
      matchScore: 95,
      skills: ['React', 'TypeScript', 'Node.js'],
      location: 'Bangkok'
    },
    {
      id: 'cand-2',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
      role: 'Backend Engineer',
      matchScore: 92,
      skills: ['Python', 'PostgreSQL', 'Docker'],
      location: 'Remote'
    },
    {
      id: 'cand-3',
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc',
      role: 'Product Designer',
      matchScore: 88,
      skills: ['Figma', 'UI/UX', 'Prototyping'],
      location: 'Chiang Mai'
    }
  ];

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
            className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
            onClick={handleCreateJob}
            data-testid="post-new-role-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Role
          </Button>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Open Roles */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Posted Jobs</CardTitle>
                  <Button 
                    variant="ghost" 
                    className="text-[#FF7000] hover:text-[#FF7000]/90"
                    onClick={() => navigate('/jobs')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isFetchingJobs ? (
                  <div className="text-center py-8 text-[#4B5563]">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#4B5563] mb-4">No jobs posted yet</p>
                    <Button 
                      onClick={handleCreateJob}
                      className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  jobs.slice(0, 5).map((job) => (
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
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditJob(job)}
                          data-testid="edit-job-btn"
                        >
                          <Edit className="h-3 w-3 mr-1" />
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
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
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
              <CardContent className="space-y-4">
                {topCandidates.map((candidate) => (
                  <div 
                    key={candidate.id}
                    className="p-4 bg-[#FFFDFA] rounded-lg hover:bg-[#FFE4CC]/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12 border-2 border-[#FFE4CC]">
                        <AvatarImage src={candidate.avatar} alt={candidate.name} />
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#0F151D] text-sm">{candidate.name}</h4>
                        <p className="text-xs text-[#4B5563]">{candidate.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">{candidate.matchScore}%</div>
                        <p className="text-xs text-[#4B5563]">match</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-[#4B5563] mb-3">{candidate.location}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-[#FF7000] hover:bg-[#FF7000]/90 text-white h-8 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-md bg-gradient-to-br from-[#E8F0FF] to-[#FFE4CC]">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#0F151D] mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-white"
                    onClick={handleCreateJob}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white">
                    <Users className="h-4 w-4 mr-2" />
                    Search Candidates
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white">
                    <TrendingUp className="h-4 w-4 mr-2" />
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
    </DashboardLayout>
  );
};

export default EmployerDashboard;
