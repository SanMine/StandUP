import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Video,
  Play,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mic,
  Camera,
  Volume2
} from 'lucide-react';
import { mockInterviewQuestions, users } from '../utils/mockData';
import DashboardLayout from '../components/Layout/DashboardLayout';

const Interviews = () => {
  const currentUser = users.student;
  const [activeTab, setActiveTab] = useState('mock');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const upcomingInterviews = [
    {
      id: 'int-1',
      company: 'Tech Innovations',
      role: 'Frontend Developer Intern',
      date: '2025-07-15',
      time: '10:00 AM',
      type: 'Technical Round',
      interviewer: 'John Smith',
      link: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 'int-2',
      company: 'Digital Solutions Co.',
      role: 'Full Stack Developer',
      date: '2025-07-18',
      time: '2:00 PM',
      type: 'HR Screening',
      interviewer: 'Jane Doe',
      link: 'https://zoom.us/j/123456789'
    }
  ];

  const feedbackMetrics = [
    { label: 'Tone', score: 85, color: 'text-green-600' },
    { label: 'Clarity', score: 78, color: 'text-blue-600' },
    { label: 'Keywords', score: 92, color: 'text-purple-600' },
    { label: 'Confidence', score: 88, color: 'text-yellow-600' }
  ];

  const startMockInterview = (question) => {
    setSelectedQuestion(question);
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Interview Preparation
          </h1>
          <p className="text-[#4B5563]">Practice, schedule, and ace your interviews</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="mock">Mock Interviews</TabsTrigger>
            <TabsTrigger value="schedule">Scheduled</TabsTrigger>
          </TabsList>

          <TabsContent value="mock" className="space-y-6 mt-6">
            {!selectedQuestion ? (
              <>
                {/* Mock Interview Intro */}
                <Card className="border-none shadow-md bg-gradient-to-br from-[#E8F0FF] to-[#FFE4CC]">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Video className="h-8 w-8 text-[#FF7000]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Practice Makes Perfect
                        </h3>
                        <p className="text-[#4B5563] mb-4">
                          Get real-time feedback on your interview performance. Practice with AI-powered mock interviews tailored to your target roles.
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-[#4B5563]">Real-time feedback</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-[#4B5563]">Role-specific questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-[#4B5563]">Performance analytics</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Question Bank */}
                <div>
                  <h2 className="text-xl font-semibold text-[#0F151D] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Question Bank
                  </h2>
                  <div className="grid gap-4">
                    {mockInterviewQuestions.map((question) => (
                      <Card key={question.id} className="border-none shadow-md hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF]">
                                  {question.category}
                                </Badge>
                                <Badge variant="outline" className={
                                  question.difficulty === 'Easy' ? 'border-green-500 text-green-700' :
                                  question.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-700' :
                                  'border-red-500 text-red-700'
                                }>
                                  {question.difficulty}
                                </Badge>
                                <span className="text-xs text-[#4B5563] flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {question.duration}
                                </span>
                              </div>
                              <p className="text-[#0F151D] font-medium">{question.question}</p>
                            </div>
                            <Button 
                              className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                              onClick={() => startMockInterview(question)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Practice
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Mock Interview Session */
              <div className="space-y-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedQuestion(null)}
                  className="text-[#FF7000] hover:text-[#FF7000]/90"
                >
                  ← Back to Questions
                </Button>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Video Recording Area */}
                  <div className="lg:col-span-2">
                    <Card className="border-none shadow-md">
                      <CardContent className="p-0">
                        <div className="bg-gray-900 aspect-video rounded-t-lg flex items-center justify-center relative">
                          {isRecording ? (
                            <div className="text-center">
                              <div className="h-20 w-20 bg-red-600 rounded-full animate-pulse flex items-center justify-center mx-auto mb-4">
                                <Camera className="h-10 w-10 text-white" />
                              </div>
                              <p className="text-white font-medium">Recording...</p>
                              <p className="text-gray-400 text-sm mt-1">00:45 / 05:00</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Video className="h-20 w-20 text-gray-600 mx-auto mb-4" />
                              <p className="text-gray-400">Camera preview will appear here</p>
                            </div>
                          )}
                          <div className="absolute top-4 right-4 flex gap-2">
                            <div className="h-10 w-10 bg-black/50 rounded-full flex items-center justify-center">
                              <Mic className="h-5 w-5 text-white" />
                            </div>
                            <div className="h-10 w-10 bg-black/50 rounded-full flex items-center justify-center">
                              <Volume2 className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <Badge className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF] mb-2">
                                {selectedQuestion.category}
                              </Badge>
                              <h3 className="text-lg font-semibold text-[#0F151D]">
                                {selectedQuestion.question}
                              </h3>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              className={isRecording ? 'bg-red-600 hover:bg-red-700 text-white flex-1' : 'bg-[#FF7000] hover:bg-[#FF7000]/90 text-white flex-1'}
                              onClick={() => setIsRecording(!isRecording)}
                            >
                              {isRecording ? 'Stop Recording' : 'Start Recording'}
                            </Button>
                            {isRecording && (
                              <Button variant="outline" className="flex-1">
                                Skip Question
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Feedback Panel */}
                  <div className="space-y-6">
                    <Card className="border-none shadow-md">
                      <CardHeader>
                        <CardTitle className="text-lg">Tips</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#4B5563]">Speak clearly and maintain eye contact</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#4B5563]">Use the STAR method for behavioral questions</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#4B5563]">Take your time to think before answering</p>
                        </div>
                      </CardContent>
                    </Card>

                    {isRecording && (
                      <Card className="border-none shadow-md">
                        <CardHeader>
                          <CardTitle className="text-lg">Live Feedback</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {feedbackMetrics.map((metric) => (
                            <div key={metric.label}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-[#4B5563]">{metric.label}</span>
                                <span className={`text-sm font-semibold ${metric.color}`}>{metric.score}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#FF7000] to-[#FF9040] transition-all duration-500"
                                  style={{ width: `${metric.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 mt-6">
            {upcomingInterviews.length > 0 ? (
              <div className="grid gap-4">
                {upcomingInterviews.map((interview) => (
                  <Card key={interview.id} className="border-none shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 bg-[#E8F0FF] rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-[#284688]">
                            {new Date(interview.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-bold text-[#284688]">
                            {new Date(interview.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-[#0F151D] mb-1">{interview.role}</h3>
                              <p className="text-sm text-[#4B5563]">{interview.company}</p>
                            </div>
                            <Badge className="bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC]">
                              {interview.type}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-[#4B5563] mb-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {interview.time}
                            </span>
                            <span>Interviewer: {interview.interviewer}</span>
                          </div>
                          <div className="flex gap-3">
                            <Button className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white">
                              <Video className="h-4 w-4 mr-2" />
                              Join Interview
                            </Button>
                            <Button variant="outline">
                              <Calendar className="h-4 w-4 mr-2" />
                              Add to Calendar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-none shadow-md">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#0F151D] mb-2">No Upcoming Interviews</h3>
                  <p className="text-[#4B5563] mb-6">You don't have any scheduled interviews yet</p>
                  <Button 
                    className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                    onClick={() => setActiveTab('mock')}
                  >
                    Practice with Mock Interviews
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Interviews;
