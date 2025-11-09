import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { 
  Search,
  Star,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Play,
  CheckCircle2
} from 'lucide-react';
import { courses as mockCourses, users } from '../utils/mockData';
import { learningAPI } from '../services/api';
import DashboardLayout from '../components/Layout/DashboardLayout';

const Learning = () => {
  const currentUser = users.student;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [coursesList, setCoursesList] = useState(mockCourses);
  const [isLoading, setIsLoading] = useState(true);

  const myLearning = [
    {
      id: 'my-1',
      courseId: 'course-1',
      progress: 65,
      lastAccessed: '2025-07-12',
      status: 'in-progress'
    }
  ];

  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = coursesList.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  // Prefer server-side proxied Coursera results so the browser always gets live Coursera data.
  // Fallback order: proxied Coursera -> internal DB courses -> mock
  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      setIsLoading(true);
      // 1) Try proxied Coursera endpoint on our backend
      try {
        const res = await learningAPI.getCoursera();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          if (mounted) {
            setCoursesList(res.data);
            setIsLoading(false);
          }
          return;
        }
      } catch (err) {
        console.warn('Proxied Coursera endpoint failed or returned empty, will try internal courses', err?.message || err);
      }

      // 2) Fallback: internal learning API (DB)
      try {
        const res2 = await learningAPI.getCourses();
        if (res2 && res2.success && Array.isArray(res2.data) && res2.data.length > 0) {
          if (mounted) {
            setCoursesList(res2.data);
            setIsLoading(false);
          }
          return;
        }
      } catch (err) {
        console.warn('Internal learning API failed or returned empty, falling back to mock', err?.message || err);
      }

      // 3) Last resort: use local mock data
      if (mounted) {
        setCoursesList(mockCourses);
        setIsLoading(false);
      }
    };

    fetchCourses();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Learning Center
          </h1>
          <p className="text-[#4B5563]">Build skills that get you hired</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Courses Enrolled', value: '3', icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-100' },
            { label: 'Hours Learned', value: '24', icon: Clock, color: 'text-green-600', bgColor: 'bg-green-100' },
            { label: 'Certificates', value: '1', icon: Award, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
            { label: 'Skill Level', value: 'Int.', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[#4B5563] mb-2">{stat.label}</p>
                      <p className="text-2xl font-bold text-[#0F151D]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`h-12 w-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Learning */}
        {myLearning.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-[#0F151D] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Continue Learning
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLearning.map((learning) => {
                const course = coursesList.find(c => c.id === learning.courseId);
                if (!course) return null;
                return (
                  <Card key={learning.id} className="border-none shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-0">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="p-6">
                        <Badge className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF] mb-2">
                          {course.level}
                        </Badge>
                        <h3 className="font-semibold text-[#0F151D] mb-2">{course.title}</h3>
                        <p className="text-sm text-[#4B5563] mb-4">{course.provider}</p>
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-[#4B5563]">Progress</span>
                            <span className="font-semibold text-[#FF7000]">{learning.progress}%</span>
                          </div>
                          <Progress value={learning.progress} className="h-2" />
                        </div>
                        <Button className="w-full bg-[#FF7000] hover:bg-[#FF7000]/90 text-white">
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Explore Courses */}
        <div>
          <h2 className="text-2xl font-semibold text-[#0F151D] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Explore Courses
          </h2>

          {/* Search & Filters */}
          <Card className="border-none shadow-md mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search courses by title, provider, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#4B5563] mb-2">Level</h4>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((level) => {
                      const isSelected = selectedLevel === level;
                      return (
                        <Badge
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`cursor-pointer transition-all capitalize ${
                            isSelected
                              ? 'bg-[#FF7000] text-white hover:bg-[#FF7000]/90'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // show mock skeletons while loading
              mockCourses.slice(0, 6).map((course) => (
                <Card key={course.id} className="border-none shadow-md animate-pulse">
                  <CardContent className="p-0">
                    <div className="w-full h-40 bg-gray-200 rounded-t-lg" />
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredCourses.map((course) => (
                <Card key={course.id} className="border-none shadow-md hover:shadow-xl transition-all">
                  <CardContent className="p-0">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF]">
                          {course.level}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{course.rating || '—'}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-[#0F151D] mb-2">{course.title}</h3>
                      <p className="text-sm text-[#4B5563] mb-4">{course.provider} • {course.instructor || ''}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(course.topics || []).map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-[#4B5563] mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {(course.students || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#FF7000]">{course.price || 'Free'}</span>
                        <Button className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white">
                          Enroll
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Recommended Learning Path */}
        <Card className="border-none shadow-md bg-gradient-to-br from-[#E8F0FF] to-[#FFE4CC]">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>Recommended Learning Path</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4B5563] mb-6">
              Based on your profile and career goals, we recommend this learning path to become a successful Frontend Developer.
            </p>
            <div className="space-y-3">
              {[
                { title: 'Master React Fundamentals', status: 'completed' },
                { title: 'Learn Advanced React Patterns', status: 'in-progress' },
                { title: 'System Design for Frontend', status: 'pending' },
                { title: 'Build Portfolio Projects', status: 'pending' }
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-100' :
                    step.status === 'in-progress' ? 'bg-[#FFE4CC]' :
                    'bg-gray-100'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : step.status === 'in-progress' ? (
                      <span className="h-2 w-2 rounded-full bg-[#FF7000]" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  <span className="flex-1 font-medium text-[#0F151D]">{step.title}</span>
                  {step.status === 'in-progress' && (
                    <Button size="sm" className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white">
                      Continue
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Learning;
