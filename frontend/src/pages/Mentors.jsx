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
  CheckCircle2,
  Sparkles,
  Filter
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

  const getTypeColor = (type) => {
    const colors = {
      'Webinar': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:border-blue-300',
      'Workshop': 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 hover:border-purple-300',
      'Career Fair': 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:border-green-300',
      'Networking': 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 hover:border-orange-300',
      'Interview': 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 hover:border-pink-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300';
  };

  const getTypeGradient = (type) => {
    const gradients = {
      'Webinar': 'from-blue-500/10 to-blue-600/10',
      'Workshop': 'from-purple-500/10 to-purple-600/10',
      'Career Fair': 'from-green-500/10 to-green-600/10',
      'Networking': 'from-orange-500/10 to-orange-600/10',
      'Interview': 'from-pink-500/10 to-pink-600/10'
    };
    return gradients[type] || 'from-gray-500/10 to-gray-600/10';
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-purple-500/10 rounded-3xl blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Events & Mentorship
                </h1>
                <p className="text-gray-600 text-lg">Discover events and workshops to boost your career</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search & Filters Card */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search events by title, company, presenter, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl shadow-sm transition-all"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Filter by Type</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((filter) => {
                    const isSelected = selectedFilters.includes(filter);
                    return (
                      <Badge
                        key={filter}
                        onClick={() => toggleFilter(filter)}
                        className={`cursor-pointer transition-all px-4 py-2 text-sm font-medium ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg scale-105'
                            : `${getTypeColor(filter)} hover:shadow-md border`
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

        {/* Results Count */}
        <div className="flex items-center justify-between px-2">
          <p className="text-gray-600">
            <span className="font-bold text-2xl text-gray-900">{filteredEvents.length}</span>
            <span className="ml-2">events found</span>
          </p>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
            <p className="text-gray-600 mt-4">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Check back later for new opportunities!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventId = event._id || event.id;
              const enrolled = isEnrolled(eventId);
              return (
                <Card 
                  key={eventId} 
                  className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handleViewDetails(event)}
                >
                  {/* Image with Overlay */}
                  {event.image && (
                    <div className="relative h-48 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-t ${getTypeGradient(event.type)} opacity-60 group-hover:opacity-40 transition-opacity`} />
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={`${getTypeColor(event.type)} border shadow-md`}>
                          {event.type}
                        </Badge>
                        {enrolled && (
                          <Badge className="bg-green-500 text-white border-0 shadow-md">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Enrolled
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    {!event.image && (
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${getTypeColor(event.type)} border`}>
                          {event.type}
                        </Badge>
                        {enrolled && (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Enrolled
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <Calendar className="h-3.5 w-3.5 text-orange-600" />
                        </div>
                        <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <Building className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <span className="font-medium truncate">{event.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <Users className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span className="font-medium">{event.enrollmentCount || 0} enrolled</span>
                      </div>
                    </div>

                    {event.skills && event.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Skills you'll gain</p>
                        <div className="flex flex-wrap gap-1">
                          {event.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                              {skill}
                            </Badge>
                          ))}
                          {event.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              +{event.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(event);
                        }}
                      >
                        Details
                      </Button>
                      {!enrolled && (
                        <Button 
                          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnroll(eventId);
                          }}
                        >
                          Enroll Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Event Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              {selectedEvent.image && (
                <div className="-mx-6 -mt-6 mb-6 relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-4 left-6 z-20 flex gap-2">
                    <Badge className={`${getTypeColor(selectedEvent.type)} border shadow-lg`}>
                      {selectedEvent.type}
                    </Badge>
                    {isEnrolled(selectedEvent._id || selectedEvent.id) && (
                      <Badge className="bg-green-500 text-white shadow-lg">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Enrolled
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <DialogHeader>
                {!selectedEvent.image && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getTypeColor(selectedEvent.type)} border`}>{selectedEvent.type}</Badge>
                    {isEnrolled(selectedEvent._id || selectedEvent.id) && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Enrolled
                      </Badge>
                    )}
                  </div>
                )}
                <DialogTitle className="text-3xl font-bold">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="text-base">by <span className="font-semibold text-gray-900">{selectedEvent.presenter}</span> from <span className="font-semibold text-gray-900">{selectedEvent.company}</span></DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-orange-600 uppercase">Date</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase">Time</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-600 uppercase">Location</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedEvent.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase">Enrolled</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedEvent.enrollmentCount || 0} students</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">About This Event</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                </div>

                {/* Target Audience */}
                {selectedEvent.target_audience && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Who is this for?
                    </h4>
                    <p className="text-sm text-blue-800">{selectedEvent.target_audience}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedEvent.skills && selectedEvent.skills.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-orange-500" />
                      Skills You'll Gain
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.skills.map((skill, idx) => (
                        <Badge key={idx} className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200 px-3 py-1.5">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">Attachments</h4>
                    <div className="space-y-2">
                      {selectedEvent.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          📎 Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enroll Button */}
                {!isEnrolled(selectedEvent._id || selectedEvent.id) && (
                  <Button 
                    className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={() => handleEnroll(selectedEvent._id || selectedEvent.id)}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Enroll in This Event
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