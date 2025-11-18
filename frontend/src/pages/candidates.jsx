import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  Star,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Eye,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  GraduationCap,
  FileText,
  Code,
  Globe,
  Github,
  Languages,
  Building2,
  BookOpen,
  Trash2,
  Paperclip,
  Download
} from 'lucide-react';
import { candidateAPI } from '../services/api';
import { toast } from 'sonner';
import EmployerLayout from '../components/Layout/EmployerLayout';
import { useAuth } from '../contexts/AuthContext';

const Candidates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = user;

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match_score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [stats, setStats] = useState(null);
  const [candidateInterviewLinks, setCandidateInterviewLinks] = useState({});
  const [candidateInterviewDates, setCandidateInterviewDates] = useState({});
  const [candidateInterviewTimes, setCandidateInterviewTimes] = useState({});

  // Status configurations with colors
  const statusConfig = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Clock },
    reviewing: { label: 'Reviewing', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
    shortlisted: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-700', icon: Star },
    interview_scheduled: { label: 'Interview Scheduled', color: 'bg-indigo-100 text-indigo-700', icon: Calendar },
    interviewed: { label: 'Interviewed', color: 'bg-cyan-100 text-cyan-700', icon: CheckCircle2 },
    offer_extended: { label: 'Offer Extended', color: 'bg-green-100 text-green-700', icon: Award },
    hired: { label: 'Hired', color: 'bg-green-200 text-green-800', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle }
  };

  // Statuses available for manual selection (excludes auto-managed statuses)
  const manualStatusConfig = {
    interview_scheduled: statusConfig.interview_scheduled,
    interviewed: statusConfig.interviewed,
    offer_extended: statusConfig.offer_extended,
    hired: statusConfig.hired,
    rejected: statusConfig.rejected
  };

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, [statusFilter, sortBy]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = {
        sort: sortBy,
        order: 'desc'
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await candidateAPI.getCandidates(params);
      setCandidates(response.data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await candidateAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      await candidateAPI.updateStatus(candidateId, newStatus);
      toast.success('Status updated successfully');
      fetchCandidates();
      if (selectedCandidate?._id === candidateId) {
        const response = await candidateAPI.getCandidateById(candidateId);
        setSelectedCandidate(response.data);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleRatingChange = async (candidateId, rating) => {
    try {
      await candidateAPI.updateRating(candidateId, rating);
      toast.success('Rating updated');
      fetchCandidates();
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Failed to update rating');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedCandidate) return;

    try {
      await candidateAPI.updateNotes(selectedCandidate._id, notes);
      toast.success('Notes saved successfully');
      setNotesDialogOpen(false);
      const response = await candidateAPI.getCandidateById(selectedCandidate._id);
      setSelectedCandidate(response.data);
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const handleSaveInterviewLink = async (candidateId) => {
    // Get the current candidate to check for existing values
    const candidate = candidates.find(c => c._id === candidateId);
    const interviewLink = candidateInterviewLinks[candidateId] || candidate?.interview_link || '';
    const interviewDate = candidateInterviewDates[candidateId] || (candidate?.interview_date ? new Date(candidate.interview_date).toISOString().split('T')[0] : '');
    const interviewTime = candidateInterviewTimes[candidateId] || (candidate?.interview_date ? new Date(candidate.interview_date).toTimeString().slice(0, 5) : '');

    if (!interviewLink || !interviewLink.trim()) {
      toast.error('Please enter an interview link');
      return;
    }

    if (!interviewDate || !interviewTime) {
      toast.error('Please enter interview date and time');
      return;
    }

    try {
      // Combine date and time into ISO string
      const dateTimeString = `${interviewDate}T${interviewTime}`;
      await candidateAPI.updateInterviewLink(candidateId, interviewLink, dateTimeString);
      toast.success('Interview details saved successfully');
      fetchCandidates();
      // Clear the input fields
      setCandidateInterviewLinks(prev => ({ ...prev, [candidateId]: '' }));
      setCandidateInterviewDates(prev => ({ ...prev, [candidateId]: '' }));
      setCandidateInterviewTimes(prev => ({ ...prev, [candidateId]: '' }));
    } catch (error) {
      console.error('Error saving interview details:', error);
      toast.error('Failed to save interview details');
    }
  };

  const handleDeleteCandidate = async (candidateId, candidateName) => {
    if (!window.confirm(`Are you sure you want to delete ${candidateName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await candidateAPI.deleteCandidate(candidateId);
      toast.success('Candidate deleted successfully');
      fetchCandidates();
      if (selectedCandidate?._id === candidateId) {
        setDetailsOpen(false);
        setSelectedCandidate(null);
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const openCandidateDetails = async (candidate) => {
    try {
      const response = await candidateAPI.getCandidateById(candidate._id);
      setSelectedCandidate(response.data);
      setDetailsOpen(true);
      
      // Auto-update status to 'reviewing' if currently 'new'
      if (candidate.status === 'new') {
        await handleStatusChange(candidate._id, 'reviewing');
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      toast.error('Failed to load candidate details');
    }
  };

  const openNotesDialog = (candidate) => {
    setSelectedCandidate(candidate);
    setNotes(candidate.employer_notes || '');
    setNotesDialogOpen(true);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    return (
      candidate.user_id?.name?.toLowerCase().includes(searchLower) ||
      candidate.user_id?.email?.toLowerCase().includes(searchLower) ||
      candidate.job_id?.title?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <EmployerLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" >
            Candidates
          </h1>
          <p className="text-[#4B5563]">Manage and review your applicants</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#4B5563] mb-1">Total Candidates</p>
                    <p className="text-2xl font-bold text-[#0F151D]">{stats.total || 0}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#4B5563] mb-1">Reviewing</p>
                    <p className="text-2xl font-bold text-[#0F151D]">{stats.byStatus?.reviewing || 0}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                    <Eye className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#4B5563] mb-1">Interviews</p>
                    <p className="text-2xl font-bold text-[#0F151D]">
                      {(stats.byStatus?.interview_scheduled || 0) + (stats.byStatus?.interviewed || 0)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#4B5563] mb-1">Avg Match Score</p>
                    <p className="text-2xl font-bold text-[#0F151D]">{Math.round(stats.avgMatchScore || 0)}%</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
                <Input
                  placeholder="Search by name, email, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offer_extended">Offer Extended</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match_score">Match Score</SelectItem>
                  <SelectItem value="last_activity">Recent Activity</SelectItem>
                  <SelectItem value="createdAt">Application Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-[#4B5563]">Loading candidates...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-[#4B5563] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0F151D] mb-2">No candidates found</h3>
              <p className="text-[#4B5563]">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Candidates who apply to your jobs will appear here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => {
              const StatusIcon = statusConfig[candidate.status]?.icon || Clock;

              return (
                <Card key={candidate._id} className="transition-all border-none shadow-md hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="flex-shrink-0 w-16 h-16">
                        <AvatarImage src={candidate.user_id?.avatar} />
                        <AvatarFallback className="bg-[#E8F0FF] text-[#284688] text-lg">
                          {candidate.user_id?.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-[#0F151D] mb-1">
                              {candidate.user_id?.name || 'Unknown'}
                            </h3>
                            <p className="text-[#4B5563] mb-2">Applied for: {candidate.job_id?.title || 'N/A'}</p>

                            <div className="flex flex-wrap gap-3 text-sm text-[#4B5563]">
                              {candidate.user_id?.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {candidate.user_id.email}
                                </span>
                              )}
                              {candidate.job_id?.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {candidate.job_id.location}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end flex-shrink-0 gap-2">
                            <Badge className={statusConfig[candidate.status]?.color || 'bg-gray-100 text-gray-700'}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[candidate.status]?.label || candidate.status}
                            </Badge>

                            {candidate.match_score > 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-600">
                                  {candidate.match_score}% Match
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => openCandidateDetails(candidate)}
                            className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Profile
                          </Button>

                          <Select
                            value={candidate.status}
                            onValueChange={(value) => handleStatusChange(candidate._id, value)}
                          >
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(manualStatusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  {config.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {candidate.status === 'interview_scheduled' && (
                            <div className="flex flex-col gap-2 w-full">
                              {/* Date and Time - Stacked Vertically */}
                              <div className="flex gap-2">
                                <Input
                                  type="date"
                                  placeholder="Date"
                                  value={candidateInterviewDates[candidate._id] || (candidate.interview_date ? new Date(candidate.interview_date).toISOString().split('T')[0] : '')}
                                  onChange={(e) => setCandidateInterviewDates({
                                    ...candidateInterviewDates,
                                    [candidate._id]: e.target.value
                                  })}
                                  className="h-8 text-xs flex-1"
                                />
                                <Input
                                  type="time"
                                  placeholder="Time"
                                  value={candidateInterviewTimes[candidate._id] || (candidate.interview_date ? new Date(candidate.interview_date).toTimeString().slice(0, 5) : '')}
                                  onChange={(e) => setCandidateInterviewTimes({
                                    ...candidateInterviewTimes,
                                    [candidate._id]: e.target.value
                                  })}
                                  className="h-8 text-xs flex-1"
                                />
                              </div>
                              
                              {/* Link and Save Button - Horizontal */}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Meeting link (e.g., Google Meet)"
                                  value={candidateInterviewLinks[candidate._id] || candidate.interview_link || ''}
                                  onChange={(e) => setCandidateInterviewLinks({
                                    ...candidateInterviewLinks,
                                    [candidate._id]: e.target.value
                                  })}
                                  className="h-8 text-xs flex-1"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSaveInterviewLink(candidate._id)}
                                  className="h-8 whitespace-nowrap bg-[#FF7000] text-white hover:bg-[#FF7000]/90"
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNotesDialog(candidate)}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Notes
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCandidate(candidate._id, candidate.user_id?.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>

                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRatingChange(candidate._id, star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-4 w-4 ${star <= (candidate.rating || 0)
                                    ? 'fill-[#FF7000] text-[#FF7000]'
                                    : 'text-gray-300'
                                    }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Candidate Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedCandidate && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Candidate Profile</DialogTitle>
                  <DialogDescription>
                    Detailed information about {selectedCandidate.user_id?.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                  {/* Basic Info */}
                  <div className="flex items-start gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={selectedCandidate.user_id?.avatar} />
                      <AvatarFallback className="bg-[#E8F0FF] text-[#284688] text-2xl">
                        {selectedCandidate.user_id?.name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#0F151D] mb-1">
                        {selectedCandidate.user_id?.name}
                      </h3>
                      <p className="text-[#4B5563] mb-3">{selectedCandidate.user_id?.email}</p>

                      {selectedCandidate.match_score > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="text-lg font-semibold text-green-600">
                            {selectedCandidate.match_score}% Match Score
                          </span>
                        </div>
                      )}

                      <Badge className={statusConfig[selectedCandidate.status]?.color}>
                        {statusConfig[selectedCandidate.status]?.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedCandidate.user_id?.bio && (
                    <div>
                      <h4 className="font-semibold text-[#0F151D] mb-2">About</h4>
                      <p className="text-[#4B5563]">{selectedCandidate.user_id.bio}</p>
                    </div>
                  )}

                  {/* Job Details */}
                  <div>
                    <h4 className="font-semibold text-[#0F151D] mb-2">Applied Position</h4>
                    <div className="bg-[#FFFDFA] p-4 rounded-lg">
                      <p className="font-semibold text-[#0F151D]">{selectedCandidate.job_id?.title}</p>
                      <p className="text-sm text-[#4B5563] mt-1">
                        {selectedCandidate.job_id?.type} • {selectedCandidate.job_id?.location}
                      </p>
                    </div>
                  </div>

                  {/* Application Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#4B5563] mb-1">Applied Date</p>
                      <p className="font-semibold text-[#0F151D]">
                        {selectedCandidate.application_id?.applied_date
                          ? new Date(selectedCandidate.application_id.applied_date).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#4B5563] mb-1">Profile Strength</p>
                      <p className="font-semibold text-[#0F151D]">
                        {selectedCandidate.user_id?.profile_strength || 0}%
                      </p>
                    </div>
                  </div>

                  {/* Interview Link */}
                  {selectedCandidate.status === 'interview_scheduled' && selectedCandidate.interview_link && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#0F151D] mb-1">Interview Scheduled</p>
                          {selectedCandidate.interview_date && (
                            <p className="text-sm text-[#4B5563] mb-2">
                              {new Date(selectedCandidate.interview_date).toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                          <a
                            href={selectedCandidate.interview_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[#FF7000] hover:underline break-all"
                          >
                            <Globe className="w-4 h-4" />
                            Join Meeting
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resume Information */}
                  {selectedCandidate.resume && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-semibold text-[#0F151D] flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Resume Details
                      </h4>

                      {/* Contact Information */}
                      {(selectedCandidate.resume.phone || selectedCandidate.resume.email || selectedCandidate.resume.address?.city) && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#0F151D] mb-2">Contact Information</h5>
                          <div className="space-y-2 text-sm text-[#4B5563]">
                            {selectedCandidate.resume.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {selectedCandidate.resume.phone}
                              </p>
                            )}
                            {selectedCandidate.resume.email && (
                              <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {selectedCandidate.resume.email}
                              </p>
                            )}
                            {selectedCandidate.resume.address?.city && (
                              <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {[
                                  selectedCandidate.resume.address.city,
                                  selectedCandidate.resume.address.state,
                                  selectedCandidate.resume.address.country
                                ].filter(Boolean).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Professional Summary */}
                      {selectedCandidate.resume.professional_summary && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#0F151D] mb-2">Professional Summary</h5>
                          <p className="text-sm text-[#4B5563] whitespace-pre-wrap">
                            {selectedCandidate.resume.professional_summary}
                          </p>
                        </div>
                      )}

                      {/* Education */}
                      {selectedCandidate.resume.education && selectedCandidate.resume.education.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#0F151D] mb-2 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Education
                          </h5>
                          <div className="space-y-3">
                            {selectedCandidate.resume.education.map((edu, idx) => (
                              <div key={idx} className="bg-[#F9FAFB] p-3 rounded-lg">
                                <p className="font-semibold text-[#0F151D]">{edu.degree} {edu.major && `in ${edu.major}`}</p>
                                <p className="text-sm text-[#4B5563]">{edu.institute}</p>
                                {edu.gpa && <p className="text-sm text-[#4B5563]">GPA: {edu.gpa}</p>}
                                {edu.year_of_graduation && (
                                  <p className="text-sm text-[#4B5563]">Graduated: {edu.year_of_graduation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {((selectedCandidate.resume.hard_skills && selectedCandidate.resume.hard_skills.length > 0) ||
                        (selectedCandidate.resume.soft_skills && selectedCandidate.resume.soft_skills.length > 0)) && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#0F151D] mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Skills
                          </h5>
                          <div className="space-y-2">
                            {selectedCandidate.resume.hard_skills && selectedCandidate.resume.hard_skills.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-[#4B5563] mb-1">Technical Skills</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedCandidate.resume.hard_skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedCandidate.resume.soft_skills && selectedCandidate.resume.soft_skills.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-[#4B5563] mb-1">Soft Skills</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedCandidate.resume.soft_skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-green-100 text-green-700">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Work Experience */}
                      {selectedCandidate.resume.experience && selectedCandidate.resume.experience.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#0F151D] mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Work Experience
                          </h5>
                          <div className="space-y-3">
                            {selectedCandidate.resume.experience.map((exp, idx) => (
                              <div key={idx} className="bg-[#F9FAFB] p-3 rounded-lg">
                                <p className="font-semibold text-[#0F151D]">{exp.job_title}</p>
                                <p className="text-sm text-[#4B5563] flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {exp.company_name} • {exp.employment_type}
                                </p>
                                <p className="text-xs text-[#4B5563] mt-1">
                                  {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'} - 
                                  {exp.current ? ' Present' : (exp.end_date ? ' ' + new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ' N/A')}
                                </p>
                                {exp.description && (
                                  <p className="text-sm text-[#4B5563] mt-2 whitespace-pre-wrap">{exp.description}</p>
                                )}
                                {exp.achievements && exp.achievements.length > 0 && (
                                  <ul className="list-disc list-inside text-sm text-[#4B5563] mt-2 space-y-1">
                                    {exp.achievements.map((achievement, achIdx) => (
                                      <li key={achIdx}>{achievement}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {selectedCandidate.resume.languages && selectedCandidate.resume.languages.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#0F151D] mb-2 flex items-center gap-2">
                            <Languages className="w-4 h-4" />
                            Languages
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.resume.languages.map((lang, idx) => (
                              <Badge key={idx} variant="outline">
                                {lang.language} • {lang.proficiency}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {selectedCandidate.resume.certifications && selectedCandidate.resume.certifications.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#0F151D] mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Certifications
                          </h5>
                          <div className="space-y-2">
                            {selectedCandidate.resume.certifications.map((cert, idx) => (
                              <div key={idx} className="bg-[#F9FAFB] p-3 rounded-lg">
                                <p className="font-semibold text-[#0F151D]">{cert.name}</p>
                                {cert.issuing_organization && (
                                  <p className="text-sm text-[#4B5563]">{cert.issuing_organization}</p>
                                )}
                                {cert.issue_date && (
                                  <p className="text-xs text-[#4B5563]">
                                    Issued: {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Job Preferences */}
                      {selectedCandidate.resume.looking_for && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#0F151D] mb-2">Job Preferences</h5>
                          <div className="space-y-2">
                            {selectedCandidate.resume.looking_for.job_type && selectedCandidate.resume.looking_for.job_type.length > 0 && (
                              <div>
                                <p className="text-xs text-[#4B5563] mb-1">Job Types:</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedCandidate.resume.looking_for.job_type.map((type, idx) => (
                                    <Badge key={idx} variant="secondary">{type}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedCandidate.resume.looking_for.positions && selectedCandidate.resume.looking_for.positions.length > 0 && (
                              <div>
                                <p className="text-xs text-[#4B5563] mb-1">Desired Positions:</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedCandidate.resume.looking_for.positions.map((position, idx) => (
                                    <Badge key={idx} variant="secondary">{position}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Projects */}
                  {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-semibold text-[#0F151D] flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Portfolio Projects
                      </h4>
                      <div className="space-y-3">
                        {selectedCandidate.projects.map((project, idx) => (
                          <div key={idx} className="bg-[#F9FAFB] p-4 rounded-lg">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="font-semibold text-[#0F151D]">{project.title}</h5>
                              <div className="flex gap-2">
                                {project.github_url && (
                                  <a 
                                    href={project.github_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#4B5563] hover:text-[#0F151D]"
                                  >
                                    <Github className="w-4 h-4" />
                                  </a>
                                )}
                                {project.live_url && (
                                  <a 
                                    href={project.live_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#4B5563] hover:text-[#0F151D]"
                                  >
                                    <Globe className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-[#4B5563] mb-2">{project.description}</p>
                            {project.tags && project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag, tagIdx) => (
                                  <Badge key={tagIdx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {selectedCandidate.application_id?.attachments && selectedCandidate.application_id.attachments.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-semibold text-[#0F151D] flex items-center gap-2">
                        <Paperclip className="w-5 h-5" />
                        Application Attachments
                      </h4>
                      <div className="space-y-2">
                        {selectedCandidate.application_id.attachments.map((attachment, idx) => (
                          <div key={idx} className="bg-[#F9FAFB] p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-[#4B5563] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#0F151D] truncate">{attachment.originalName}</p>
                                <p className="text-xs text-[#4B5563]">
                                  {(attachment.fileSize / 1024).toFixed(2)} KB • {new Date(attachment.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <a
                              href={attachment.url}
                              download={attachment.originalName}
                              className="flex items-center gap-1 text-sm text-[#FF7000] hover:text-[#FF7000]/90 flex-shrink-0"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedCandidate.employer_notes && (
                    <div>
                      <h4 className="font-semibold text-[#0F151D] mb-2">Your Notes</h4>
                      <div className="p-4 rounded-lg bg-yellow-50">
                        <p className="text-[#4B5563] whitespace-pre-wrap">{selectedCandidate.employer_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setDetailsOpen(false);
                        openNotesDialog(selectedCandidate);
                      }}
                      className="flex-1"
                      variant="outline"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add/Edit Notes
                    </Button>
                    <Button className="flex-1 bg-[#FF7000] hover:bg-[#FF7000]/90">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Candidate
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Candidate Notes</DialogTitle>
              <DialogDescription>
                Add private notes about {selectedCandidate?.user_id?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                rows={6}
                className="resize-none"
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setNotesDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveNotes} className="flex-1 bg-[#FF7000] hover:bg-[#FF7000]/90">
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EmployerLayout>
  );
};

export default Candidates;
