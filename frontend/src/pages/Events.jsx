import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  Award,
  Building
} from 'lucide-react';
import EmployerLayout from '../components/Layout/EmployerLayout';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import api from '../services/api';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Webinar',
    location: '',
    description: '',
    presenter: '',
    company: '',
    target_audience: '',
    skills: '',
    image: '',
    attachments: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/events/my/events');
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

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      type: 'Webinar',
      location: '',
      description: '',
      presenter: '',
      company: '',
      target_audience: '',
      skills: '',
      image: '',
      attachments: ''
    });
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      type: event.type || 'Webinar',
      location: event.location || '',
      description: event.description || '',
      presenter: event.presenter || '',
      company: event.company || '',
      target_audience: event.target_audience || '',
      skills: Array.isArray(event.skills) ? event.skills.join(', ') : '',
      image: event.image || '',
      attachments: Array.isArray(event.attachments) ? event.attachments.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete event');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        attachments: formData.attachments.split(',').map(a => a.trim()).filter(a => a)
      };

      if (selectedEvent) {
        await api.put(`/events/${selectedEvent._id || selectedEvent.id}`, eventData);
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', eventData);
        toast.success('Event created successfully');
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <EmployerLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F151D] mb-2" >
              Events & Mentorship
            </h1>
            <p className="text-[#4B5563]">Create and manage events for students</p>
          </div>
          <Button
            className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
            onClick={handleCreateEvent}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4B5563] mb-1">Total Events</p>
                  <p className="text-2xl font-bold text-[#0F151D]">{events.length}</p>
                </div>
                <div className="h-12 w-12 bg-[#FFE4CC] rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-[#FF7000]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4B5563] mb-1">Active Events</p>
                  <p className="text-2xl font-bold text-[#0F151D]">
                    {events.filter(e => e.status === 'active').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4B5563] mb-1">Total Enrollments</p>
                  <p className="text-2xl font-bold text-[#0F151D]">
                    {events.reduce((sum, e) => sum + (e.enrollmentCount || 0), 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Your Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && events.length === 0 ? (
              <p className="text-center text-[#4B5563] py-8">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-center text-[#4B5563] py-8">
                No events yet. Create your first event to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event._id || event.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-[#0F151D]">{event.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                            <Badge
                              className={
                                event.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 mb-3">
                            <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                              <Users className="h-4 w-4" />
                              <span>{event.enrollmentCount || 0} enrolled</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                              <Building className="h-4 w-4" />
                              <span>{event.company}</span>
                            </div>
                          </div>

                          <p className="text-sm text-[#4B5563] mb-3">{event.description}</p>

                          {event.skills && event.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {event.skills.map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvent(event._id || event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Event Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <DialogDescription>
              Fill in the details to {selectedEvent ? 'update' : 'create'} an event
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., React Workshop"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Event Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Career Fair">Career Fair</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Interview">Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location/Meeting Link *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Zoom link or physical address"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="presenter">Presenter Name *</Label>
                <Input
                  id="presenter"
                  name="presenter"
                  value={formData.presenter}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g., Tech Corp"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this event is about..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                name="target_audience"
                value={formData.target_audience}
                onChange={handleInputChange}
                placeholder="e.g., Students, Beginners, Developers"
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g., React, Node.js, MongoDB"
              />
            </div>

            <div>
              <Label htmlFor="image">Event Image URL</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="attachments">Attachments (comma-separated URLs)</Label>
              <Input
                id="attachments"
                name="attachments"
                value={formData.attachments}
                onChange={handleInputChange}
                placeholder="https://example.com/file1.pdf, https://example.com/file2.pdf"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
              >
                {isLoading ? 'Saving...' : selectedEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </EmployerLayout>
  );
};

export default Events;
