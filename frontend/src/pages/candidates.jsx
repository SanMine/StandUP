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
  GraduationCap
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

  const openCandidateDetails = async (candidate) => {
    try {
      const response = await candidateAPI.getCandidateById(candidate._id);
      setSelectedCandidate(response.data);
      setDetailsOpen(true);
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
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Candidates
          </h1>
          <p className="text-[#4B5563]">Manage and review your applicants</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#4B5563] mb-1">Total Candidates</p>
                    <p className="text-2xl font-bold text-[#0F151D]">{stats.total || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#4B5563] mb-1">Shortlisted</p>
                    <p className="text-2xl font-bold text-[#0F151D]">{stats.byStatus?.shortlisted || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-purple-600" />
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
                  <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-indigo-600" />
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
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
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
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
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
          <div className="text-center py-12">
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
                <Card key={candidate._id} className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 flex-shrink-0">
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
                                  <Mail className="h-4 w-4" />
                                  {candidate.user_id.email}
                                </span>
                              )}
                              {candidate.job_id?.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {candidate.job_id.location}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <Badge className={statusConfig[candidate.status]?.color || 'bg-gray-100 text-gray-700'}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[candidate.status]?.label || candidate.status}
                            </Badge>
                            
                            {candidate.match_score > 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-600" />
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
                            <Eye className="h-3 w-3 mr-1" />
                            View Profile
                          </Button>

                          <Select
                            value={candidate.status}
                            onValueChange={(value) => handleStatusChange(candidate._id, value)}
                          >
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  {config.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNotesDialog(candidate)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Notes
                          </Button>

                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRatingChange(candidate._id, star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    star <= (candidate.rating || 0)
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

                <div className="space-y-6 mt-4">
                  {/* Basic Info */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
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
                          <TrendingUp className="h-5 w-5 text-green-600" />
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

                  {/* Notes */}
                  {selectedCandidate.employer_notes && (
                    <div>
                      <h4 className="font-semibold text-[#0F151D] mb-2">Your Notes</h4>
                      <div className="bg-yellow-50 p-4 rounded-lg">
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
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add/Edit Notes
                    </Button>
                    <Button className="flex-1 bg-[#FF7000] hover:bg-[#FF7000]/90">
                      <Mail className="h-4 w-4 mr-2" />
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

            <div className="space-y-4 mt-4">
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
