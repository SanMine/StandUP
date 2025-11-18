// src/pages/Applications.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import {
  MoreVertical,
  Calendar,
  FileText,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { applicationsAPI } from '../services/api';
import { formatDate } from '../lib/utils';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import { toast } from 'sonner';

const statuses = [
  { id: 'saved', label: 'Saved', color: 'bg-gray-100' },
  { id: 'applied', label: 'Applied', color: 'bg-blue-100' },
  { id: 'screening', label: 'Screening', color: 'bg-yellow-100' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-100' },
  { id: 'offer', label: 'Offer', color: 'bg-green-100' }
];

const getStatusColor = (status) => {
  const s = statuses.find(x => x.id === status);
  return s?.color || 'bg-gray-100';
};

const Applications = () => {
  const { user: authUser } = useAuth();
  const currentUser = authUser || { name: 'Student', role: 'student' };

  const [applicationsList, setApplicationsList] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [notes, setNotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const groupedApps = statuses.reduce((acc, status) => {
    acc[status.id] = applicationsList.filter(app => (app.status === status.id));
    return acc;
  }, {});

  const handleWithdraw = async (app) => {
    try {
      await toast.promise(
        applicationsAPI.deleteApplication(app.id),
        {
          loading: 'Withdrawing application...',
          success: (res) => {
            loadApplications();       // refresh list
            setSelectedApp(null);     // close sheet
            return res?.message || 'Application withdrawn';
          },
          error: (err) => err?.message || 'Failed to withdraw'
        }
      );
    } catch (err) {
      console.error('Withdraw error', err);
    }
  };

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await applicationsAPI.getApplications();
      if (res && res.success) {
        setApplicationsList(Array.isArray(res.data) ? res.data : []);
      } else {
        setApplicationsList([]);
      }
    } catch (err) {
      console.error('Error fetching applications', err);
      setError(err.message || 'Failed to load applications');
      setApplicationsList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    if (!selectedApp) return;
    setNotes(prev => ({ ...prev, [selectedApp.id]: selectedApp.notes || '' }));
  }, [selectedApp]);


  const handleSaveNotes = async (appId) => {
    const noteText = notes[appId] ?? '';
    try {
      await toast.promise(
        applicationsAPI.updateApplication(appId, { notes: noteText }),
        {
          loading: 'Saving notes...',
          success: () => {
            loadApplications();
            return 'Notes saved';
          },
          error: (err) => err?.message || 'Failed to save notes'
        }
      );
    } catch (err) {
      console.error('Save notes error', err);
    }
  };

  const handleViewJobDetails = (app) => {
    // if you have a JobDetailsSheet and want to open it from here, lift state to parent.
    const jobId = app.job?.id || app.job_id || app.jobId;
    if (jobId) {
      window.open(`/jobs?id=${jobId}`, '_blank');
    } else {
      toast('Job details unavailable');
    }
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" >
            Application Tracker
          </h1>
          <p className="text-[#4B5563]">Track all your job applications in one place</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {statuses.map((status) => (
            <Card key={status.id} className="border-none shadow-md">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-[#0F151D]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {groupedApps[status.id]?.length || 0}
                </p>
                <p className="text-sm text-[#4B5563] mt-1">{status.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 pb-4 overflow-x-auto">
          {statuses.map((status) => (
            <div key={status.id} className="flex-shrink-0 w-80">
              <div className={`${status.color} rounded-t-lg px-4 py-3`}>
                <h3 className="font-semibold text-[#0F151D] flex items-center justify-between">
                  {status.label}
                  <Badge className="bg-white text-[#0F151D] hover:bg-white">
                    {groupedApps[status.id]?.length || 0}
                  </Badge>
                </h3>
              </div>
              <div className="space-y-3 bg-gray-50 rounded-b-lg p-4 min-h-[420px]">
                {isLoading && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#4B5563]">Loading…</p>
                  </div>
                )}

                {!isLoading && groupedApps[status.id]?.map((app) => {
                  const job = app.job || null;
                  return (
                    <Card
                      key={app.id}
                      className="transition-all bg-white border-none shadow-sm cursor-pointer hover:shadow-md group"
                      onClick={() => setSelectedApp(app)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-[#0F151D] text-base leading-tight flex-1 pr-2 group-hover:text-[#FF7000] transition-colors">
                            {job?.title || app.jobTitle || 'Untitled'}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 w-8 h-8 transition-opacity opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApp(app);
                            }}
                            aria-label="Open application"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>

                        <p className="text-sm text-[#4B5563] mb-3 font-medium">
                          {job?.company || app.company || ''}
                        </p>

                        {job?.location && (
                          <p className="text-xs text-[#4B5563] mb-3 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </p>
                        )}

                        {job && job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {(job.skills || []).slice(0, 3).map((skillObj, idx) => {
                              const name = skillObj && (skillObj.skill_name || skillObj.name || skillObj);
                              return (
                                <Badge
                                  key={`${name || idx}`}
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 bg-[#F3F4F6] border-[#E5E7EB] text-[#374151]"
                                >
                                  {name || '—'}
                                </Badge>
                              );
                            })}
                            {job.skills.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0.5 bg-[#F3F4F6] border-[#E5E7EB] text-[#374151]"
                              >
                                +{job.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(app.applied_date || app.appliedDate)}</span>
                          </div>
                          <Badge className={`${getStatusColor(app.status)} text-[#0F151D] text-xs px-2 py-0.5`}>
                            {status.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {!isLoading && groupedApps[status.id]?.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#4B5563]">No applications yet</p>
                  </div>
                )}

                {error && (
                  <div className="py-4 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Details Drawer */}
      <Sheet
        open={!!selectedApp}
        onOpenChange={(open) => {
          if (!open) setSelectedApp(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedApp && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl" >
                  {selectedApp.jobTitle || selectedApp.job?.title || 'Application'}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {selectedApp.company || selectedApp.job?.company || ''}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-2">Status</h3>
                  <Badge className={`${getStatusColor(selectedApp.status)} text-[#0F151D]`}>
                    {statuses.find(s => s.id === selectedApp.status)?.label || selectedApp.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-4">Application Timeline</h3>
                  <div className="space-y-4">
                    {(selectedApp.timeline && selectedApp.timeline.length > 0 ? selectedApp.timeline : [
                      { date: selectedApp.applied_date || selectedApp.appliedDate, event: 'Application Submitted', status: 'completed' },
                      { date: null, event: 'Initial Screening', status: selectedApp.status === 'screening' ? 'in-progress' : 'pending' },
                      { date: null, event: 'Technical Interview', status: selectedApp.status === 'interview' ? 'in-progress' : 'pending' },
                      { date: null, event: 'Offer Decision', status: 'pending' }
                    ]).map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.status === 'completed' ? 'bg-green-100' :
                            item.status === 'in-progress' ? 'bg-[#FFE4CC]' :
                              'bg-gray-100'
                            }`}>
                            {item.status === 'completed' ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : item.status === 'in-progress' ? (
                              <span className="h-3 w-3 rounded-full  bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white" />
                            ) : (
                              <span className="w-2 h-2 bg-gray-400 rounded-full" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-[#0F151D]">{item.event}</p>
                          {item.date && <p className="text-xs text-[#4B5563] mt-1">{formatDate(item.date)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-3">Notes</h3>
                  <Textarea
                    placeholder="Add notes about this application..."
                    value={notes[selectedApp.id] ?? selectedApp.notes ?? ''}
                    onChange={(e) => setNotes({ ...notes, [selectedApp.id]: e.target.value })}
                    className="min-h-[120px]"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      className=" bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white"
                      onClick={() => handleSaveNotes(selectedApp.id)}
                    >
                      Save Notes
                    </Button>
                    <Button variant="outline" onClick={() => setNotes({ ...notes, [selectedApp.id]: '' })}>
                      Clear
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-3">Attachments</h3>
                  <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-[#4B5563] mb-2">No attachments yet</p>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Attachment
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-[#284688] hover:bg-[#284688]/90 text-white"
                    onClick={() => handleViewJobDetails(selectedApp)}
                  >
                    View Job Details
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleWithdraw(selectedApp)}
                  >
                    Withdraw Application
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

export default Applications;