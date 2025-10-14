import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { 
  Plus,
  ExternalLink,
  Github,
  Globe,
  Edit,
  Trash,
  FileText,
  Download,
  Eye,
  Share2
} from 'lucide-react';
import { users } from '../utils/mockData';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const Portfolio = () => {
  const currentUser = users.student;
  const [activeTab, setActiveTab] = useState('resume');
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const resumeSections = [
    { id: 'summary', title: 'Professional Summary', icon: FileText },
    { id: 'education', title: 'Education', icon: FileText },
    { id: 'experience', title: 'Experience', icon: FileText },
    { id: 'skills', title: 'Skills', icon: FileText },
    { id: 'projects', title: 'Projects', icon: FileText }
  ];

  const projects = [
    {
      id: 'proj-1',
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce application with payment integration',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      github: 'https://github.com/user/ecommerce',
      live: 'https://ecommerce-demo.com',
      featured: true
    },
    {
      id: 'proj-2',
      title: 'Task Management App',
      description: 'Collaborative task management tool with real-time updates',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
      tags: ['React', 'Firebase', 'Material-UI'],
      github: 'https://github.com/user/task-manager',
      live: 'https://taskmanager-demo.com',
      featured: false
    },
    {
      id: 'proj-3',
      title: 'Weather Dashboard',
      description: 'Real-time weather tracking with interactive maps',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
      tags: ['React', 'OpenWeather API', 'Charts.js'],
      github: 'https://github.com/user/weather-app',
      live: null,
      featured: false
    }
  ];

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Resume & Portfolio
            </h1>
            <p className="text-[#4B5563]">Build your professional presence</p>
          </div>
          <Button className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white">
            <Share2 className="h-4 w-4 mr-2" />
            Share Profile
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="resume">Resume Builder</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="space-y-6 mt-6">
            {/* ATS Score */}
            <Card className="border-none shadow-md bg-gradient-to-br from-[#E8F0FF] to-[#FFE4CC]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F151D] mb-1">ATS Compatibility Score</h3>
                    <p className="text-sm text-[#4B5563]">Your resume is optimized for applicant tracking systems</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#FF7000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      87%
                    </div>
                    <p className="text-xs text-[#4B5563]">Good</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resume Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              {resumeSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card key={section.id} className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-[#FFE4CC] rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-[#FF7000]" />
                          </div>
                          <h3 className="font-semibold text-[#0F151D]">{section.title}</h3>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-[#4B5563]">
                        {section.id === 'summary' && 'Passionate Computer Science student...'}
                        {section.id === 'education' && 'Bachelor of Computer Science - 2025'}
                        {section.id === 'experience' && 'Frontend Developer Intern at...'}
                        {section.id === 'skills' && `${currentUser.skills.join(', ')}`}
                        {section.id === 'projects' && '3 featured projects showcased'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Keyword Helper */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#0F151D] mb-4">Keyword Suggestions</h3>
                <p className="text-sm text-[#4B5563] mb-4">
                  Add these keywords to improve your ATS score for Frontend Developer roles:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Responsive Design', 'RESTful APIs', 'Version Control', 'Agile', 'CI/CD', 'Testing'].map((keyword) => (
                    <Badge key={keyword} className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF] cursor-pointer">
                      {keyword}
                      <Plus className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6 mt-6">
            {/* Portfolio Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0F151D] mb-1">Your Projects</h2>
                <p className="text-sm text-[#4B5563]">Showcase your best work</p>
              </div>
              <Button 
                className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
                onClick={() => setAddProjectOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="border-none shadow-md hover:shadow-xl transition-all group">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {project.featured && (
                        <Badge className="absolute top-3 right-3 bg-[#FF7000] text-white hover:bg-[#FF7000]">
                          Featured
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {project.github && (
                          <Button size="icon" variant="secondary" className="bg-white">
                            <Github className="h-5 w-5" />
                          </Button>
                        )}
                        {project.live && (
                          <Button size="icon" variant="secondary" className="bg-white">
                            <ExternalLink className="h-5 w-5" />
                          </Button>
                        )}
                        <Button size="icon" variant="secondary" className="bg-white">
                          <Edit className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#0F151D] mb-2">{project.title}</h3>
                      <p className="text-sm text-[#4B5563] mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Public Profile Link */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#0F151D] mb-1">Public Portfolio Link</h3>
                    <p className="text-sm text-[#4B5563]">Share this link with employers and recruiters</p>
                  </div>
                  <Button variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg font-mono text-sm text-[#4B5563]">
                  standup.app/portfolio/sarah-johnson
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Showcase your work and skills</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" placeholder="Enter project name" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Brief description of your project..."
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="tags">Technologies Used</Label>
              <Input id="tags" placeholder="React, Node.js, MongoDB" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="github">GitHub URL</Label>
                <Input id="github" placeholder="https://github.com/..." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="live">Live Demo URL</Label>
                <Input id="live" placeholder="https://demo.com" className="mt-1" />
              </div>
            </div>
            <Button 
              className="w-full bg-[#FF7000] hover:bg-[#FF7000]/90 text-white"
              onClick={() => {
                alert('Project added successfully!');
                setAddProjectOpen(false);
              }}
            >
              Add Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Portfolio;
