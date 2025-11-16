import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { jobsAPI } from '../services/api';
import { toast } from 'sonner';
import EmployerLayout from '../components/Layout/EmployerLayout';
import JobModal from '../components/JobModal';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const EmployerJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getMyJobs();
      if (response.success) {
        setJobs(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredJobs(filtered);
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
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete job');
    }
  };

  const handleJobSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (selectedJob) {
        await api.put(`/jobs/${selectedJob._id || selectedJob.id}`, data);
        toast.success('Job updated successfully');
      } else {
        const response = await jobsAPI.createJob(data);
        if (response.success) {
          toast.success('Job created successfully');
        }
      }
      
      setIsModalOpen(false);
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    closed: { label: 'Closed', color: 'bg-red-100 text-red-700' },
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' }
  };

  return (
    <EmployerLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              My Job Postings
            </h1>
            <p className="text-[#4B5563]">Manage your job listings</p>
          </div>
          <Button 
            onClick={handleCreateJob}
            className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4B5563] mb-1">Total Jobs</p>
                  <p className="text-2xl font-bold text-[#0F151D]">{jobs.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4B5563] mb-1">Active Jobs</p>
                  <p className="text-2xl font-bold text-[#0F151D]">
                    {jobs.filter(j => j.status === 'active').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4B5563] mb-1">Draft Jobs</p>
                  <p className="text-2xl font-bold text-[#0F151D]">
                    {jobs.filter(j => j.status === 'draft').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Edit className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
                <Input
                  placeholder="Search by title, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#4B5563]">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-[#4B5563] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0F151D] mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No jobs found' : 'No jobs posted yet'}
              </h3>
              <p className="text-[#4B5563] mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first job posting to start hiring'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button 
                  onClick={handleCreateJob}
                  className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job._id || job.id} className="border-none shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[#0F151D] mb-2">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-[#4B5563] mb-3">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </span>
                            )}
                            {job.type && (
                              <span className="capitalize">{job.type}</span>
                            )}
                            {job.salary_range && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {job.salary_range}
                              </span>
                            )}
                            {job.posted_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Posted {new Date(job.posted_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {job.description && (
                            <p className="text-sm text-[#4B5563] line-clamp-2">
                              {job.description}
                            </p>
                          )}
                        </div>
                        <Badge className={statusConfig[job.status]?.color || 'bg-gray-100 text-gray-700'}>
                          {statusConfig[job.status]?.label || job.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/candidates?job_id=${job._id || job.id}`)}
                          className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          View Candidates
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditJob(job)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteJob(job._id || job.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Job Modal */}
        <JobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleJobSubmit}
          job={selectedJob}
          isLoading={isSubmitting}
        />
      </div>
    </EmployerLayout>
  );
};

export default EmployerJobs;
