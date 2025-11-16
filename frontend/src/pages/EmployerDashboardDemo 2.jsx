import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Briefcase,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import JobModal from '../components/JobModal';
import { toast } from 'sonner';

const EmployerDashboardDemo = () => {
  const [jobs, setJobs] = useState([
    {
      _id: 'demo-1',
      title: 'Frontend Developer',
      company: 'Tech Innovations',
      location: 'Bangkok, Thailand',
      type: 'Full-time',
      mode: 'Hybrid',
      description: 'Looking for an experienced React developer...',
      status: 'active',
      salary: '$60,000 - $80,000',
      requirements: ['3+ years experience', 'React expertise'],
      skills: ['React', 'TypeScript', 'Node.js'],
      culture: ['Innovative', 'Fast-paced']
    },
    {
      _id: 'demo-2',
      title: 'Backend Engineer',
      company: 'Digital Solutions',
      location: 'Remote',
      type: 'Full-time',
      mode: 'Remote',
      description: 'Join our backend team to build scalable services...',
      status: 'active',
      salary: '$70,000 - $90,000',
      requirements: ['Node.js', 'MongoDB', 'AWS'],
      skills: ['Node.js', 'MongoDB', 'Docker'],
      culture: ['Remote-first', 'Flexible']
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateJob = () => {
    setSelectedJob(null);
    setIsModalOpen(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleDeleteJob = (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }
    setJobs(jobs.filter(j => j._id !== jobId));
    toast.success('Job deleted successfully');
  };

  const handleJobSubmit = (data) => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (selectedJob) {
        // Update existing job
        setJobs(jobs.map(j => j._id === selectedJob._id ? { ...j, ...data } : j));
        toast.success('Job updated successfully');
      } else {
        // Create new job
        const newJob = {
          _id: `demo-${Date.now()}`,
          ...data
        };
        setJobs([newJob, ...jobs]);
        toast.success('Job created successfully');
      }
      
      setIsModalOpen(false);
      setSelectedJob(null);
      setIsLoading(false);
    }, 1000);
  };

  const kpis = [
    { label: 'Open Roles', value: jobs.filter(j => j.status === 'active').length.toString(), icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Total Jobs', value: jobs.length.toString(), icon: Users, color: 'text-[#FF7000]', bgColor: 'bg-[#FFE4CC]' },
    { label: 'Draft Jobs', value: jobs.filter(j => j.status === 'draft').length.toString(), icon: Clock, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Closed Jobs', value: jobs.filter(j => j.status === 'closed').length.toString(), icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E8F0FF] p-8">
      <div className="max-w-7xl mx-auto space-y-8" data-testid="employer-dashboard-demo">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Employer Dashboard
            </h1>
            <p className="text-[#4B5563]">Manage your job postings and candidates</p>
          </div>
          <Button 
            className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white shadow-lg"
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
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-[#4B5563] mb-2">{kpi.label}</p>
                      <p className="text-3xl font-bold text-[#0F151D]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {kpi.value}
                      </p>
                    </div>
                    <div className={`h-14 w-14 ${kpi.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`h-7 w-7 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Jobs List */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Posted Jobs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#4B5563] mb-4 text-lg">No jobs posted yet</p>
                <Button 
                  onClick={handleCreateJob}
                  className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </div>
            ) : (
              jobs.map((job) => (
                <div 
                  key={job._id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-[#FF7000] hover:shadow-md transition-all bg-[#FFFDFA]"
                  data-testid="job-card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#0F151D] mb-2">{job.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                        <span className="font-medium">{job.company}</span>
                        <span>•</span>
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
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 text-sm px-3 py-1' 
                          : job.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-sm px-3 py-1'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-100 text-sm px-3 py-1'
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-[#4B5563] mb-4 line-clamp-2">{job.description}</p>
                  
                  {job.salary && (
                    <p className="text-sm font-medium text-[#0F151D] mb-3">💰 {job.salary}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills?.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="bg-[#E8F0FF] text-[#284688] border-[#284688]/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditJob(job)}
                      data-testid="edit-job-btn"
                      className="hover:bg-[#FF7000] hover:text-white transition-colors"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteJob(job._id)}
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
    </div>
  );
};

export default EmployerDashboardDemo;
