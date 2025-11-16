import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Plus,
  Trash,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  FileText,
  Edit,
  Github,
  Globe,
  ExternalLink,
  Eye,
  Download
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { resumeAPI, portfolioAPI } from '../services/api';
import { toast } from 'sonner';

const Portfolio = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editEducationMode, setEditEducationMode] = useState(false);
  const [editEducationId, setEditEducationId] = useState(null);
  const [editExperienceMode, setEditExperienceMode] = useState(false);
  const [editExperienceId, setEditExperienceId] = useState(null);

  // Portfolio projects state
  const [projects, setProjects] = useState([]);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    image: '',
    tags: '',
    githubUrl: '',
    liveUrl: '',
    featured: false
  });

  // Resume state
  const [resume, setResume] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    religion: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    },
    
    // Professional
    professional_summary: '',
    
    // Education array
    education: [],
    
    // Job Preferences
    looking_for: {
      job_type: [],
      positions: []
    },
    
    // Skills
    hard_skills: [],
    soft_skills: [],
    
    // Languages array
    languages: [],
    
    // Experience array
    experience: [],
    
    // Certifications array
    certifications: [],
    
    // Awards & Honors array
    awards: [],
    
    // References array
    references: []
  });

  // Temporary form states for arrays
  const [newEducation, setNewEducation] = useState({
    institute: '',
    faculty: '',
    major: '',
    degree: '',
    gpa: '',
    year_of_graduation: '',
    start_date: '',
    end_date: '',
    current: false
  });

  const [newExperience, setNewExperience] = useState({
    company_name: '',
    job_title: '',
    employment_type: 'full-time',
    type_of_work: '',
    start_date: '',
    end_date: '',
    current: false,
    description: '',
    achievements: []
  });

  const [newLanguage, setNewLanguage] = useState({
    language: '',
    proficiency: 'intermediate'
  });

  const [newHardSkill, setNewHardSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    credential_id: ''
  });
  
  const [newAward, setNewAward] = useState('');
  
  const [newReference, setNewReference] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: ''
  });

  // Fetch resume on mount
  useEffect(() => {
    fetchResume();
    fetchProjects();
  }, []);

  const fetchResume = async () => {
    try {
      setIsLoading(true);
      const response = await resumeAPI.getResume();
      if (response.success && response.data) {
        setResume(response.data);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast.error('Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchATSScore = async () => {
    try {
      const response = await resumeAPI.calculateATSScore();
      if (response.success) {
        setAtsScore(response.data.score);
      }
    } catch (error) {
      console.error('Error calculating ATS score:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setResume(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setResume(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveResume = async () => {
    try {
      setIsSaving(true);
      const response = await resumeAPI.updateResume(resume);
      if (response.success) {
        toast.success('Resume updated successfully');
        fetchATSScore();
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  // Education handlers
  const handleAddEducation = async () => {
    if (!newEducation.institute) {
      toast.error('Institute name is required');
      return;
    }
    try {
      const response = await resumeAPI.addEducation(newEducation);
      if (response.success) {
        setResume(response.data);
        setNewEducation({
          institute: '',
          faculty: '',
          major: '',
          degree: '',
          gpa: '',
          year_of_graduation: '',
          start_date: '',
          end_date: '',
          current: false
        });
        toast.success('Education added');
      }
    } catch (error) {
      toast.error('Failed to add education');
    }
  };

  const handleEditEducation = (edu) => {
    setEditEducationMode(true);
    setEditEducationId(edu._id);
    setNewEducation({
      institute: edu.institute || '',
      faculty: edu.faculty || '',
      major: edu.major || '',
      degree: edu.degree || '',
      gpa: edu.gpa || '',
      year_of_graduation: edu.year_of_graduation || '',
      start_date: edu.start_date ? new Date(edu.start_date).toISOString().split('T')[0] : '',
      end_date: edu.end_date ? new Date(edu.end_date).toISOString().split('T')[0] : '',
      current: edu.current || false
    });
  };

  const handleUpdateEducation = async () => {
    if (!newEducation.institute) {
      toast.error('Institute name is required');
      return;
    }
    try {
      const response = await resumeAPI.updateEducation(editEducationId, newEducation);
      if (response.success) {
        setResume(response.data);
        setEditEducationMode(false);
        setEditEducationId(null);
        setNewEducation({
          institute: '',
          faculty: '',
          major: '',
          degree: '',
          gpa: '',
          year_of_graduation: '',
          start_date: '',
          end_date: '',
          current: false
        });
        toast.success('Education updated');
      }
    } catch (error) {
      console.error('Error updating education:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update education');
    }
  };

  const handleCancelEditEducation = () => {
    setEditEducationMode(false);
    setEditEducationId(null);
    setNewEducation({
      institute: '',
      faculty: '',
      major: '',
      degree: '',
      gpa: '',
      year_of_graduation: '',
      start_date: '',
      end_date: '',
      current: false
    });
  };

  const handleDeleteEducation = async (educationId) => {
    if (!confirm('Are you sure you want to delete this education entry?')) {
      return;
    }
    try {
      const response = await resumeAPI.deleteEducation(educationId);
      if (response.success) {
        setResume(prev => ({
          ...prev,
          education: prev.education.filter(e => e._id !== educationId)
        }));
        toast.success('Education deleted');
      }
    } catch (error) {
      console.error('Error deleting education:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete education');
    }
  };

  // Experience handlers
  const handleAddExperience = async () => {
    if (!newExperience.company_name || !newExperience.job_title || !newExperience.start_date) {
      toast.error('Company name, job title, and start date are required');
      return;
    }
    try {
      const response = await resumeAPI.addExperience(newExperience);
      if (response.success) {
        setResume(response.data);
        setNewExperience({
          company_name: '',
          job_title: '',
          employment_type: 'full-time',
          type_of_work: '',
          start_date: '',
          end_date: '',
          current: false,
          description: '',
          achievements: []
        });
        toast.success('Experience added');
      }
    } catch (error) {
      toast.error('Failed to add experience');
    }
  };

  const handleEditExperience = (exp) => {
    setEditExperienceMode(true);
    setEditExperienceId(exp._id);
    setNewExperience({
      company_name: exp.company_name || '',
      job_title: exp.job_title || '',
      employment_type: exp.employment_type || 'full-time',
      type_of_work: exp.type_of_work || '',
      start_date: exp.start_date ? new Date(exp.start_date).toISOString().split('T')[0] : '',
      end_date: exp.end_date ? new Date(exp.end_date).toISOString().split('T')[0] : '',
      current: exp.current || false,
      description: exp.description || '',
      achievements: exp.achievements || []
    });
  };

  const handleUpdateExperience = async () => {
    if (!newExperience.company_name || !newExperience.job_title || !newExperience.start_date) {
      toast.error('Company name, job title, and start date are required');
      return;
    }
    try {
      const response = await resumeAPI.updateExperience(editExperienceId, newExperience);
      if (response.success) {
        setResume(response.data);
        setEditExperienceMode(false);
        setEditExperienceId(null);
        setNewExperience({
          company_name: '',
          job_title: '',
          employment_type: 'full-time',
          type_of_work: '',
          start_date: '',
          end_date: '',
          current: false,
          description: '',
          achievements: []
        });
        toast.success('Experience updated');
      }
    } catch (error) {
      console.error('Error updating experience:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update experience');
    }
  };

  const handleCancelEditExperience = () => {
    setEditExperienceMode(false);
    setEditExperienceId(null);
    setNewExperience({
      company_name: '',
      job_title: '',
      employment_type: 'full-time',
      type_of_work: '',
      start_date: '',
      end_date: '',
      current: false,
      description: '',
      achievements: []
    });
  };

  const handleDeleteExperience = async (experienceId) => {
    if (!confirm('Are you sure you want to delete this experience entry?')) {
      return;
    }
    try {
      const response = await resumeAPI.deleteExperience(experienceId);
      if (response.success) {
        setResume(prev => ({
          ...prev,
          experience: prev.experience.filter(e => e._id !== experienceId)
        }));
        toast.success('Experience deleted');
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete experience');
    }
  };

  // Skills handlers
  const handleAddSkill = (type) => {
    const skill = type === 'hard' ? newHardSkill : newSoftSkill;
    if (!skill.trim()) return;
    
    const field = type === 'hard' ? 'hard_skills' : 'soft_skills';
    if (!resume[field].includes(skill.trim())) {
      setResume(prev => ({
        ...prev,
        [field]: [...prev[field], skill.trim()]
      }));
      if (type === 'hard') {
        setNewHardSkill('');
      } else {
        setNewSoftSkill('');
      }
    }
  };

  const handleRemoveSkill = (skill, type) => {
    const field = type === 'hard' ? 'hard_skills' : 'soft_skills';
    setResume(prev => ({
      ...prev,
      [field]: prev[field].filter(s => s !== skill)
    }));
  };

  // Language handlers
  const handleAddLanguage = () => {
    if (!newLanguage.language.trim()) return;
    
    const exists = resume.languages.find(l => l.language === newLanguage.language.trim());
    if (!exists) {
      setResume(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage({ language: '', proficiency: 'intermediate' });
    }
  };

  const handleRemoveLanguage = (language) => {
    setResume(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l.language !== language)
    }));
  };

  // Certification handlers
  const handleAddCertification = () => {
    if (!newCertification.name.trim()) {
      toast.error('Certification name is required');
      return;
    }
    
    setResume(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCertification]
    }));
    setNewCertification({
      name: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      credential_id: ''
    });
    toast.success('Certification added');
  };

  const handleRemoveCertification = (index) => {
    setResume(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // Award handlers
  const handleAddAward = () => {
    if (!newAward.trim()) return;
    
    setResume(prev => ({
      ...prev,
      awards: [...(prev.awards || []), newAward.trim()]
    }));
    setNewAward('');
  };

  const handleRemoveAward = (award) => {
    setResume(prev => ({
      ...prev,
      awards: (prev.awards || []).filter(a => a !== award)
    }));
  };

  // Reference handlers
  const handleAddReference = () => {
    if (!newReference.name.trim()) {
      toast.error('Reference name is required');
      return;
    }
    
    setResume(prev => ({
      ...prev,
      references: [...(prev.references || []), newReference]
    }));
    setNewReference({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: ''
    });
    toast.success('Reference added');
  };

  const handleRemoveReference = (index) => {
    setResume(prev => ({
      ...prev,
      references: (prev.references || []).filter((_, i) => i !== index)
    }));
  };

  const handleJobTypeToggle = (type) => {
    const types = resume.looking_for.job_type || [];
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    
    setResume(prev => ({
      ...prev,
      looking_for: {
        ...prev.looking_for,
        job_type: newTypes
      }
    }));
  };

  // Portfolio Projects handlers
  const fetchProjects = async () => {
    try {
      const response = await portfolioAPI.getProjects();
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      image: '',
      tags: '',
      githubUrl: '',
      liveUrl: '',
      featured: false
    });
    setCurrentProject(null);
  };

  const handleAddProject = async () => {
    if (!projectForm.title || !projectForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      const projectData = {
        title: projectForm.title,
        description: projectForm.description,
        image: projectForm.image || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
        tags: projectForm.tags.split(',').map(t => t.trim()).filter(t => t),
        githubUrl: projectForm.githubUrl || null,
        liveUrl: projectForm.liveUrl || null,
        featured: projectForm.featured
      };

      const response = await portfolioAPI.createProject(projectData);
      
      if (response.success) {
        toast.success('Project added successfully!');
        setAddProjectOpen(false);
        resetProjectForm();
        fetchProjects();
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to add project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProject = (project) => {
    setCurrentProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      image: project.image || '',
      tags: project.tags?.join(', ') || '',
      githubUrl: project.github_url || '',
      liveUrl: project.live_url || '',
      featured: project.featured || false
    });
    setEditProjectOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!projectForm.title || !projectForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      const projectData = {
        title: projectForm.title,
        description: projectForm.description,
        image: projectForm.image || null,
        tags: projectForm.tags.split(',').map(t => t.trim()).filter(t => t),
        githubUrl: projectForm.githubUrl || null,
        liveUrl: projectForm.liveUrl || null,
        featured: projectForm.featured
      };

      const response = await portfolioAPI.updateProject(currentProject._id, projectData);
      
      if (response.success) {
        toast.success('Project updated successfully!');
        setEditProjectOpen(false);
        resetProjectForm();
        fetchProjects();
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await portfolioAPI.deleteProject(projectId);
      if (response.success) {
        toast.success('Project deleted successfully!');
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Resume & Portfolio</h1>
            <p className="text-gray-600 mt-1">Create and manage your professional resume and projects</p>
          </div>
          <div className="flex items-center gap-3">
            {atsScore !== null && (
              <Badge variant={atsScore >= 80 ? 'default' : 'secondary'} className="text-lg py-2 px-4">
                ATS Score: {atsScore}%
              </Badge>
            )}
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSaveResume} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Resume
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills & Languages</TabsTrigger>
            <TabsTrigger value="projects">Portfolio Projects</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={resume.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={resume.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={resume.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={resume.date_of_birth ? new Date(resume.date_of_birth).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={resume.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={resume.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      placeholder="American"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="religion">Religion (Optional)</Label>
                    <Input
                      id="religion"
                      value={resume.religion}
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                      placeholder="Your religion"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={resume.address?.street || ''}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={resume.address?.city || ''}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        placeholder="San Francisco"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={resume.address?.state || ''}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        placeholder="CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={resume.address?.postal_code || ''}
                        onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
                        placeholder="94102"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={resume.address?.country || ''}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={resume.professional_summary}
                  onChange={(e) => handleInputChange('professional_summary', e.target.value)}
                  placeholder="Write a brief professional summary about yourself..."
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Job Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map(type => (
                      <Button
                        key={type}
                        type="button"
                        variant={resume.looking_for?.job_type?.includes(type) ? 'default' : 'outline'}
                        onClick={() => handleJobTypeToggle(type)}
                        className="capitalize"
                      >
                        {type.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="positions">Desired Positions</Label>
                  <Textarea
                    id="positions"
                    value={resume.looking_for?.positions?.join(', ') || ''}
                    onChange={(e) => setResume(prev => ({
                      ...prev,
                      looking_for: {
                        ...prev.looking_for,
                        positions: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
                      }
                    }))}
                    placeholder="Software Engineer, Full Stack Developer (comma separated)"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* References Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  References (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing References */}
                {resume.references && resume.references.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {resume.references.map((ref, index) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{ref.name}</h4>
                          {ref.title && <p className="text-sm text-gray-600">{ref.title}</p>}
                          {ref.company && <p className="text-sm text-gray-600">{ref.company}</p>}
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                            {ref.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {ref.email}
                              </span>
                            )}
                            {ref.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {ref.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveReference(index)}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Reference Form */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Add Reference</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="ref_name">Name *</Label>
                      <Input
                        id="ref_name"
                        value={newReference.name}
                        onChange={(e) => setNewReference({...newReference, name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref_title">Title</Label>
                      <Input
                        id="ref_title"
                        value={newReference.title}
                        onChange={(e) => setNewReference({...newReference, title: e.target.value})}
                        placeholder="Senior Developer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref_company">Company</Label>
                      <Input
                        id="ref_company"
                        value={newReference.company}
                        onChange={(e) => setNewReference({...newReference, company: e.target.value})}
                        placeholder="Tech Corp"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref_email">Email</Label>
                      <Input
                        id="ref_email"
                        type="email"
                        value={newReference.email}
                        onChange={(e) => setNewReference({...newReference, email: e.target.value})}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref_phone">Phone</Label>
                      <Input
                        id="ref_phone"
                        value={newReference.phone}
                        onChange={(e) => setNewReference({...newReference, phone: e.target.value})}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddReference} className="w-full mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-6">
            {/* Existing Education */}
            {resume.education && resume.education.length > 0 && (
              <div className="space-y-4">
                {resume.education.map((edu, index) => (
                  <Card key={edu._id || index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{edu.institute}</h3>
                          <p className="text-gray-600 text-sm">
                            {edu.faculty && `${edu.faculty} - `}{edu.major}
                          </p>
                          <p className="text-sm text-gray-500">
                            {edu.degree} {edu.gpa && `| GPA: ${edu.gpa}`} {edu.year_of_graduation && `| Graduated: ${edu.year_of_graduation}`}
                          </p>
                          {edu.current && (
                            <Badge variant="secondary" className="mt-2">Currently Studying</Badge>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEducation(edu)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEducation(edu._id)}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add/Edit Education Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editEducationMode ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editEducationMode ? 'Edit Education' : 'Add Education'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="institute">Institute Name *</Label>
                    <Input
                      id="institute"
                      value={newEducation.institute}
                      onChange={(e) => setNewEducation({...newEducation, institute: e.target.value})}
                      placeholder="Stanford University"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty</Label>
                    <Input
                      id="faculty"
                      value={newEducation.faculty}
                      onChange={(e) => setNewEducation({...newEducation, faculty: e.target.value})}
                      placeholder="Engineering"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      value={newEducation.major}
                      onChange={(e) => setNewEducation({...newEducation, major: e.target.value})}
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                      placeholder="Bachelor of Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      value={newEducation.gpa}
                      onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                      placeholder="3.8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year_of_graduation">Year of Graduation</Label>
                    <Input
                      id="year_of_graduation"
                      value={newEducation.year_of_graduation}
                      onChange={(e) => setNewEducation({...newEducation, year_of_graduation: e.target.value})}
                      placeholder="2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newEducation.start_date}
                      onChange={(e) => setNewEducation({...newEducation, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newEducation.end_date}
                      onChange={(e) => setNewEducation({...newEducation, end_date: e.target.value})}
                      disabled={newEducation.current}
                    />
                  </div>
                  <div className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      id="current_education"
                      checked={newEducation.current}
                      onChange={(e) => setNewEducation({...newEducation, current: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="current_education" className="cursor-pointer">Currently studying here</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  {editEducationMode && (
                    <Button variant="outline" onClick={handleCancelEditEducation} className="flex-1">
                      Cancel
                    </Button>
                  )}
                  <Button 
                    onClick={editEducationMode ? handleUpdateEducation : handleAddEducation} 
                    className="flex-1"
                  >
                    {editEducationMode ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Education
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Certifications Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Certifications */}
                {resume.certifications && resume.certifications.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {resume.certifications.map((cert, index) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{cert.name}</h4>
                          {cert.issuing_organization && (
                            <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            {cert.issue_date && (
                              <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                            )}
                            {cert.credential_id && <span>ID: {cert.credential_id}</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCertification(index)}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Certification Form */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Add Certification</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="cert_name">Certification Name *</Label>
                      <Input
                        id="cert_name"
                        value={newCertification.name}
                        onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                        placeholder="AWS Certified Solutions Architect"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="cert_org">Issuing Organization</Label>
                      <Input
                        id="cert_org"
                        value={newCertification.issuing_organization}
                        onChange={(e) => setNewCertification({...newCertification, issuing_organization: e.target.value})}
                        placeholder="Amazon Web Services"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cert_issue_date">Issue Date</Label>
                      <Input
                        id="cert_issue_date"
                        type="date"
                        value={newCertification.issue_date}
                        onChange={(e) => setNewCertification({...newCertification, issue_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cert_expiry_date">Expiry Date</Label>
                      <Input
                        id="cert_expiry_date"
                        type="date"
                        value={newCertification.expiry_date}
                        onChange={(e) => setNewCertification({...newCertification, expiry_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="cert_id">Credential ID</Label>
                      <Input
                        id="cert_id"
                        value={newCertification.credential_id}
                        onChange={(e) => setNewCertification({...newCertification, credential_id: e.target.value})}
                        placeholder="ABC123XYZ"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddCertification} className="w-full mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-6">
            {/* Existing Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <div className="space-y-4">
                {resume.experience.map((exp, index) => (
                  <Card key={exp._id || index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{exp.job_title}</h3>
                          <p className="text-gray-600 truncate">{exp.company_name}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            {exp.employment_type?.replace('-', ' ')} {exp.type_of_work && `| ${exp.type_of_work}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
                          </p>
                          {exp.current && (
                            <Badge variant="secondary" className="mt-2">Currently Working</Badge>
                          )}
                          {exp.description && (
                            <p className="mt-2 text-sm text-gray-700 line-clamp-3">{exp.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditExperience(exp)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExperience(exp._id)}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add/Edit Experience Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editExperienceMode ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editExperienceMode ? 'Edit Experience' : 'Add Experience'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={newExperience.company_name}
                      onChange={(e) => setNewExperience({...newExperience, company_name: e.target.value})}
                      placeholder="Google Inc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title *</Label>
                    <Input
                      id="job_title"
                      value={newExperience.job_title}
                      onChange={(e) => setNewExperience({...newExperience, job_title: e.target.value})}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select 
                      value={newExperience.employment_type} 
                      onValueChange={(value) => setNewExperience({...newExperience, employment_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type_of_work">Type of Work</Label>
                    <Input
                      id="type_of_work"
                      value={newExperience.type_of_work}
                      onChange={(e) => setNewExperience({...newExperience, type_of_work: e.target.value})}
                      placeholder="Remote, Hybrid, On-site"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp_start_date">Start Date *</Label>
                    <Input
                      id="exp_start_date"
                      type="date"
                      value={newExperience.start_date}
                      onChange={(e) => setNewExperience({...newExperience, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp_end_date">End Date</Label>
                    <Input
                      id="exp_end_date"
                      type="date"
                      value={newExperience.end_date}
                      onChange={(e) => setNewExperience({...newExperience, end_date: e.target.value})}
                      disabled={newExperience.current}
                    />
                  </div>
                  <div className="flex items-center space-x-2 col-span-2">
                    <input
                      type="checkbox"
                      id="current_job"
                      checked={newExperience.current}
                      onChange={(e) => setNewExperience({...newExperience, current: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="current_job" className="cursor-pointer">Currently working here</Label>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                      placeholder="Describe your responsibilities and achievements..."
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {editExperienceMode && (
                    <Button variant="outline" onClick={handleCancelEditExperience} className="flex-1">
                      Cancel
                    </Button>
                  )}
                  <Button 
                    onClick={editExperienceMode ? handleUpdateExperience : handleAddExperience} 
                    className="flex-1"
                  >
                    {editExperienceMode ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Experience
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills & Languages Tab */}
          <TabsContent value="skills" className="space-y-6">
            {/* Hard Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Hard Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {resume.hard_skills && resume.hard_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill, 'hard')}
                        className="ml-2 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newHardSkill}
                    onChange={(e) => setNewHardSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill('hard');
                      }
                    }}
                    placeholder="Add hard skill (e.g., JavaScript, Python)"
                  />
                  <Button onClick={() => handleAddSkill('hard')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Soft Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Soft Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {resume.soft_skills && resume.soft_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill, 'soft')}
                        className="ml-2 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSoftSkill}
                    onChange={(e) => setNewSoftSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill('soft');
                      }
                    }}
                    placeholder="Add soft skill (e.g., Communication, Leadership)"
                  />
                  <Button onClick={() => handleAddSkill('soft')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 mb-4">
                  {resume.languages && resume.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{lang.language}</span>
                        <span className="text-sm text-gray-500 ml-2 capitalize">({lang.proficiency})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLanguage(lang.language)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLanguage.language}
                    onChange={(e) => setNewLanguage({...newLanguage, language: e.target.value})}
                    placeholder="Language name"
                    className="flex-1"
                  />
                  <Select 
                    value={newLanguage.proficiency} 
                    onValueChange={(value) => setNewLanguage({...newLanguage, proficiency: value})}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="fluent">Fluent</SelectItem>
                      <SelectItem value="native">Native</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddLanguage}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Awards & Honors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Awards & Honors (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {resume.awards && resume.awards.map((award, index) => (
                    <Badge key={index} variant="default" className="text-sm py-1 px-3">
                      {award}
                      <button
                        onClick={() => handleRemoveAward(award)}
                        className="ml-2 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newAward}
                    onChange={(e) => setNewAward(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAward();
                      }
                    }}
                    placeholder="Add award or honor (e.g., Dean's List 2023)"
                  />
                  <Button onClick={handleAddAward}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Portfolio Projects</h2>
              <Button onClick={() => setAddProjectOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-4">Start building your portfolio by adding your first project</p>
                  <Button onClick={() => setAddProjectOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {project.image && (
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                      
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <div className="flex gap-2">
                          {project.github_url && (
                            <a 
                              href={project.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {project.live_url && (
                            <a 
                              href={project.live_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProject(project._id)}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Project Dialog */}
        <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Showcase your work by adding a new project to your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="project_title">Project Title *</Label>
                <Input
                  id="project_title"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  placeholder="My Awesome Project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_description">Description *</Label>
                <Textarea
                  id="project_description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  placeholder="Describe your project..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_image">Image URL</Label>
                <Input
                  id="project_image"
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({...projectForm, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_tags">Tags (comma separated)</Label>
                <Input
                  id="project_tags"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({...projectForm, tags: e.target.value})}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_github">GitHub URL</Label>
                  <Input
                    id="project_github"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({...projectForm, githubUrl: e.target.value})}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_live">Live URL</Label>
                  <Input
                    id="project_live"
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm({...projectForm, liveUrl: e.target.value})}
                    placeholder="https://project.com"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="project_featured"
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm({...projectForm, featured: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="project_featured" className="cursor-pointer">Featured Project</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setAddProjectOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProject} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Project'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update your project details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_project_title">Project Title *</Label>
                <Input
                  id="edit_project_title"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  placeholder="My Awesome Project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_project_description">Description *</Label>
                <Textarea
                  id="edit_project_description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  placeholder="Describe your project..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_project_image">Image URL</Label>
                <Input
                  id="edit_project_image"
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({...projectForm, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_project_tags">Tags (comma separated)</Label>
                <Input
                  id="edit_project_tags"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({...projectForm, tags: e.target.value})}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_project_github">GitHub URL</Label>
                  <Input
                    id="edit_project_github"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({...projectForm, githubUrl: e.target.value})}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_project_live">Live URL</Label>
                  <Input
                    id="edit_project_live"
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm({...projectForm, liveUrl: e.target.value})}
                    placeholder="https://project.com"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_project_featured"
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm({...projectForm, featured: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="edit_project_featured" className="cursor-pointer">Featured Project</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditProjectOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProject} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Project'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resume Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Resume Preview</span>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </DialogTitle>
              <DialogDescription>
                Preview your complete resume before sharing
              </DialogDescription>
            </DialogHeader>
            
            {/* Resume Preview Content */}
            <div className="bg-white p-8 rounded-lg border space-y-6">
              {/* Header Section */}
              <div className="text-center border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {resume.full_name || 'Your Name'}
                </h1>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600 flex-wrap">
                  {resume.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{resume.email}</span>
                    </div>
                  )}
                  {resume.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{resume.phone}</span>
                    </div>
                  )}
                  {(resume.address?.city || resume.address?.state || resume.address?.country) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[resume.address?.city, resume.address?.state, resume.address?.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {resume.professional_summary && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Professional Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{resume.professional_summary}</p>
                </div>
              )}

              {/* Education */}
              {resume.education && resume.education.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {resume.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-gray-300 pl-4">
                        <h3 className="font-semibold text-gray-900">{edu.institute}</h3>
                        <p className="text-gray-700">
                          {edu.degree} {edu.major && `in ${edu.major}`}
                          {edu.faculty && ` - ${edu.faculty}`}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                          {edu.year_of_graduation && <span>Graduated: {edu.year_of_graduation}</span>}
                          {edu.current && <Badge variant="secondary" className="text-xs">Current</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {resume.experience && resume.experience.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work Experience
                  </h2>
                  <div className="space-y-4">
                    {resume.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-gray-300 pl-4">
                        <h3 className="font-semibold text-gray-900">{exp.job_title}</h3>
                        <p className="text-gray-700">{exp.company_name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span className="capitalize">{exp.employment_type?.replace('-', ' ')}</span>
                          {exp.type_of_work && <span>• {exp.type_of_work}</span>}
                          <span>
                            • {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ''} - {' '}
                            {exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ''}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                        )}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i}>{achievement}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {((resume.hard_skills && resume.hard_skills.length > 0) || 
                (resume.soft_skills && resume.soft_skills.length > 0)) && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Skills
                  </h2>
                  <div className="space-y-3">
                    {resume.hard_skills && resume.hard_skills.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Technical Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {resume.hard_skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {resume.soft_skills && resume.soft_skills.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Soft Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {resume.soft_skills.map((skill, index) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Languages */}
              {resume.languages && resume.languages.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Languages className="w-5 h-5" />
                    Languages
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {resume.languages.map((lang, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{lang.language}</span>
                        <Badge variant="secondary" className="capitalize">{lang.proficiency}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resume.certifications && resume.certifications.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications
                  </h2>
                  <div className="space-y-3">
                    {resume.certifications.map((cert, index) => (
                      <div key={index} className="border-l-2 border-gray-300 pl-4">
                        <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                        {cert.issuing_organization && (
                          <p className="text-gray-700">{cert.issuing_organization}</p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          {cert.issue_date && (
                            <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                          )}
                          {cert.expiry_date && (
                            <span>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</span>
                          )}
                          {cert.credential_id && <span>ID: {cert.credential_id}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards & Honors */}
              {resume.awards && resume.awards.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Awards & Honors
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {resume.awards.map((award, index) => (
                      <Badge key={index} variant="default" className="text-sm py-1 px-3">
                        {award}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Preferences */}
              {(resume.looking_for?.job_type?.length > 0 || resume.looking_for?.positions?.length > 0) && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Job Preferences
                  </h2>
                  <div className="space-y-2">
                    {resume.looking_for.job_type && resume.looking_for.job_type.length > 0 && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Job Type: </span>
                        <span className="text-gray-700 capitalize">
                          {resume.looking_for.job_type.map(t => t.replace('-', ' ')).join(', ')}
                        </span>
                      </div>
                    )}
                    {resume.looking_for.positions && resume.looking_for.positions.length > 0 && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Desired Positions: </span>
                        <span className="text-gray-700">
                          {resume.looking_for.positions.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Projects Showcase */}
              {projects.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Featured Projects
                  </h2>
                  <div className="space-y-3">
                    {projects.filter(p => p.featured).slice(0, 3).map((project, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{project.title}</h3>
                            <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                            {project.tags && project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {project.github_url && (
                              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="w-4 h-4 text-gray-600" />
                              </a>
                            )}
                            {project.live_url && (
                              <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 text-gray-600" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {resume.references && resume.references.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    References
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {resume.references.map((ref, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900">{ref.name}</h3>
                        {ref.title && <p className="text-sm text-gray-700">{ref.title}</p>}
                        {ref.company && <p className="text-sm text-gray-700">{ref.company}</p>}
                        <div className="flex flex-col gap-1 text-xs text-gray-600 mt-2">
                          {ref.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {ref.email}
                            </span>
                          )}
                          {ref.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {ref.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
