import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Search, 
  Star,
  MapPin,
  Briefcase,
  Globe,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { mentors, users } from '../utils/mockData';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

const Mentors = () => {
  const currentUser = users.student;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const filterOptions = ['Software Engineering', 'Product Management', 'Data Science', 'Leadership', 'Career Growth'];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = searchQuery === '' || 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilters.length === 0 ||
      selectedFilters.some(filter => mentor.expertise.includes(filter));

    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (filter) => {
    setSelectedFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleBookSession = (mentor) => {
    setSelectedMentor(mentor);
    setBookingOpen(true);
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Find Your Mentor
          </h1>
          <p className="text-[#4B5563]">Learn from industry experts and accelerate your career growth</p>
        </div>

        {/* Search & Filters */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search mentors by name, role, company, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#4B5563] mb-2">Filter by Expertise</h4>
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

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-[#4B5563]">
            <span className="font-semibold text-[#0F151D]">{filteredMentors.length}</span> mentors found
          </p>
        </div>

        {/* Mentor Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="border-none shadow-md hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-[#FFE4CC]">
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-[#0F151D] mb-1">{mentor.name}</h3>
                  <p className="text-sm text-[#4B5563] mb-1">{mentor.title}</p>
                  <p className="text-xs text-[#FF7000] font-medium mb-3">{mentor.company}</p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{mentor.rating}</span>
                    <span className="text-xs text-[#4B5563]">({mentor.sessions} sessions)</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs font-medium text-[#4B5563] mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((exp) => (
                        <Badge key={exp} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#4B5563] mb-2">Languages</p>
                    <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                      <Globe className="h-3 w-3" />
                      <span>{mentor.languages.join(', ')}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#4B5563] mb-2">Availability</p>
                    <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                      <Clock className="h-3 w-3" />
                      <span>{mentor.availability}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#4B5563] mb-4">{mentor.bio}</p>

                <Button 
                  className="w-full bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                  onClick={() => handleBookSession(mentor)}
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedMentor && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-12 w-12 border-2 border-[#FFE4CC]">
                    <AvatarImage src={selectedMentor.avatar} alt={selectedMentor.name} />
                    <AvatarFallback>{selectedMentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedMentor.name}</DialogTitle>
                    <DialogDescription>{selectedMentor.title}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Session Topic</Label>
                  <Input id="topic" placeholder="e.g., Career guidance, Technical interview prep" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input id="date" type="date" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="time">Preferred Time</Label>
                  <Input id="time" type="time" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell the mentor what you'd like to discuss..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                <div className="bg-[#E8F0FF] rounded-lg p-4">
                  <h4 className="font-medium text-[#0F151D] mb-2">Session Topics</h4>
                  <ul className="space-y-1">
                    {selectedMentor.topics.map((topic, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-[#4B5563]">
                        <CheckCircle2 className="h-4 w-4 text-[#284688]" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="w-full bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                  onClick={() => {
                    alert(`Session request sent to ${selectedMentor.name}!`);
                    setBookingOpen(false);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Session
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Mentors;
