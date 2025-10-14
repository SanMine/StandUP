import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { 
  MoreVertical,
  Calendar,
  FileText,
  Plus,
  X
} from 'lucide-react';
import { applications, jobs, users } from '../utils/mockData';
import { formatDate } from '../lib/utils';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';

const Applications = () => {
  const currentUser = users.student;
  const [selectedApp, setSelectedApp] = useState(null);
  const [notes, setNotes] = useState({});

  const statuses = [
    { id: 'saved', label: 'Saved', color: 'bg-gray-100' },
    { id: 'applied', label: 'Applied', color: 'bg-blue-100' },
    { id: 'screening', label: 'Screening', color: 'bg-yellow-100' },
    { id: 'interview', label: 'Interview', color: 'bg-purple-100' },
    { id: 'offer', label: 'Offer', color: 'bg-green-100' }
  ];

  const groupedApps = statuses.reduce((acc, status) => {
    acc[status.id] = applications.filter(app => app.status === status.id);
    return acc;
  }, {});

  const getJobDetails = (jobId) => jobs.find(j => j.id === jobId);

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.id === status);
    return statusObj?.color || 'bg-gray-100';
  };

  const timeline = selectedApp ? [
    { date: selectedApp.appliedDate, event: 'Application Submitted', status: 'completed' },
    { date: selectedApp.status === 'screening' || selectedApp.status === 'interview' ? selectedApp.lastUpdate : null, event: 'Initial Screening', status: selectedApp.status === 'applied' ? 'pending' : 'completed' },
    { date: selectedApp.status === 'interview' ? selectedApp.lastUpdate : null, event: 'Technical Interview', status: selectedApp.status === 'interview' ? 'in-progress' : selectedApp.status === 'screening' || selectedApp.status === 'applied' ? 'pending' : 'completed' },
    { date: null, event: 'Offer Decision', status: 'pending' }
  ] : [];

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Application Tracker
          </h1>
          <p className="text-[#4B5563]">Track all your job applications in one place</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
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
              <div className="space-y-3 bg-gray-50 rounded-b-lg p-4 min-h-[600px]">
                {groupedApps[status.id]?.map((app) => {
                  const job = getJobDetails(app.jobId);
                  return (
                    <Card 
                      key={app.id}
                      className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#0F151D] text-sm mb-1">
                              {app.jobTitle}
                            </h4>
                            <p className="text-xs text-[#4B5563]">{app.company}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        {job && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {job.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-[#4B5563]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(app.appliedDate)}
                          </span>
                          <Badge className={`${getStatusColor(app.status)} text-[#0F151D] hover:${getStatusColor(app.status)} text-xs`}>
                            {status.label}
                          </Badge>
                        </div>
                        {app.notes && (
                          <p className="text-xs text-[#4B5563] mt-2 line-clamp-2">
                            {app.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {groupedApps[status.id]?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#4B5563]">No applications yet</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Details Drawer */}
      <Sheet open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedApp && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {selectedApp.jobTitle}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {selectedApp.company}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Status */}
                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-2">Status</h3>
                  <Badge className={`${getStatusColor(selectedApp.status)} text-[#0F151D] hover:${getStatusColor(selectedApp.status)}`}>
                    {statuses.find(s => s.id === selectedApp.status)?.label}
                  </Badge>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-4">Application Timeline</h3>
                  <div className="space-y-4">
                    {timeline.map((item, index) => {
                      const isLast = index === timeline.length - 1;
                      return (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              item.status === 'completed' ? 'bg-green-100' :
                              item.status === 'in-progress' ? 'bg-[#FFE4CC]' :
                              'bg-gray-100'
                            }`}>
                              {item.status === 'completed' ? (
                                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : item.status === 'in-progress' ? (
                                <span className="h-3 w-3 rounded-full bg-[#FF7000]" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-gray-400" />
                              )}
                            </div>
                            {!isLast && (
                              <div className={`w-0.5 h-12 ${
                                item.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-[#0F151D]">{item.event}</p>
                            {item.date && (
                              <p className="text-xs text-[#4B5563] mt-1">{formatDate(item.date)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-3">Notes</h3>
                  <Textarea
                    placeholder="Add notes about this application..."
                    value={notes[selectedApp.id] || selectedApp.notes || ''}
                    onChange={(e) => setNotes({ ...notes, [selectedApp.id]: e.target.value })}
                    className="min-h-[120px]"
                  />
                  <Button 
                    className="mt-2 bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                    size="sm"
                  >
                    Save Notes
                  </Button>
                </div>

                {/* Attachments */}
                <div>
                  <h3 className="font-semibold text-[#0F151D] mb-3">Attachments</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-[#4B5563] mb-2">No attachments yet</p>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Attachment
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-[#284688] hover:bg-[#284688]/90 text-white"
                  >
                    View Job Details
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
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
