import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Search, 
  MapPin,
  Calendar,
  Clock,
  Users,
  Award,
  Building,
  CheckCircle2
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import api from '../services/api';

const Mentors = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enrolledEvents, setEnrolledEvents] = useState(new Set());

  const filterOptions = ['Webinar', 'Workshop', 'Career Fair', 'Networking', 'Interview'];

  useEffect(() => {
    fetchEvents();
    fetchMyEnrollments();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/events', {
        params: { status: 'active' }
      });
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyEnrollments = async () => {
    try {
      const response = await api.get('/events/my/enrollments');
      if (response.data.success) {
        const eventIds = new Set(response.data.data.map(e => e.event_id));
        setEnrolledEvents(eventIds);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.presenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.skills && event.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesFilter = selectedFilters.length === 0 ||
      selectedFilters.includes(event.type);

    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (filter) => {
    setSelectedFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleEnroll = async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/enroll`);
      if (response.data.success) {
        toast.success('Successfully enrolled in event!');
        setEnrolledEvents(prev => new Set([...prev, eventId]));
        setDetailsOpen(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to enroll in event');
    }
  };

  const isEnrolled = (eventId) => {
    return enrolledEvents.has(eventId);
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Events & Mentorship
          </h1>
          <p className="text-[#4B5563]">Discover events and workshops to boost your career</p>
        </div>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search events by title, company, presenter, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#4B5563] mb-2">Filter by Type</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((filter) => {
                    const isSelected = selectedFilters.includes(filter);
                    return (
                      <Badge
                        key={filter}
                        onClick={() => toggleFilter(filter)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FF7000] text-white hover:bg-[#FF7000]/90'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-[#4B5563]">
            <span className="font-semibold text-[#0F151D]">{filteredEvents.length}</span> events found
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#4B5563]">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#4B5563]">No events found. Check back later!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event._id || event.id} className="border-none shadow-md hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  {event.image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      {isEnrolled(event._id || event.id) && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Enrolled
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-[#0F151D] mb-2">{event.title}</h3>
                    <p className="text-sm text-[#4B5563] mb-3 line-clamp-2">{event.description}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                      <Building className="h-4 w-4" />
                      <span>{event.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                      <Users className="h-4 w-4" />
                      <span>{event.enrollmentCount || 0} enrolled</span>
                    </div>
                  </div>

                  {event.skills && event.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-[#4B5563] mb-2">Skills you'll gain</p>
                      <div className="flex flex-wrap gap-1">
                        {event.skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {event.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewDetails(event)}
                    >
                      See Details
                    </Button>
                    {!isEnrolled(event._id || event.id) && (
                      <Button 
                        className="flex-1 bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                        onClick={() => handleEnroll(event._id || event.id)}
                      >
                        Enroll
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{selectedEvent.type}</Badge>
                  {isEnrolled(selectedEvent._id || selectedEvent.id) && (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Enrolled
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                <DialogDescription>by {selectedEvent.presenter} from {selectedEvent.company}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedEvent.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#FF7000]" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-[#4B5563]">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#FF7000]" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-[#4B5563]">{selectedEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[#FF7000]" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-[#4B5563]">{selectedEvent.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-[#FF7000]" />
                    <div>
                      <p className="font-medium">Enrolled</p>
                      <p className="text-[#4B5563]">{selectedEvent.enrollmentCount || 0} students</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-[#0F151D] mb-2">Description</h4>
                  <p className="text-sm text-[#4B5563]">{selectedEvent.description}</p>
                </div>

                {selectedEvent.target_audience && (
                  <div>
                    <h4 className="font-medium text-[#0F151D] mb-2">Who is this for?</h4>
                    <p className="text-sm text-[#4B5563]">{selectedEvent.target_audience}</p>
                  </div>
                )}

                {selectedEvent.skills && selectedEvent.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[#0F151D] mb-2">Skills you'll gain</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[#0F151D] mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedEvent.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-[#FF7000] hover:underline"
                        >
                          📎 Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {!isEnrolled(selectedEvent._id || selectedEvent.id) && (
                  <Button 
                    className="w-full bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                    onClick={() => handleEnroll(selectedEvent._id || selectedEvent.id)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Enroll in Event
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Mentors;
