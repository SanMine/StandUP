import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Camera, Save, Loader2, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useToast } from '../hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  graduation: z.string().optional(),
  skills: z.array(z.string()).optional(),
  primary_goals: z.array(z.string()).optional(),
  desired_positions: z.array(z.string()).optional(),
  company_name: z.string().optional(),
  company_size: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal(''))
});

const Settings = () => {
  const { user: authUser, fetchMe } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [tempSkills, setTempSkills] = useState([]);
  const [newPosition, setNewPosition] = useState('');
  const [tempPositions, setTempPositions] = useState([]);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      avatar: '',
      graduation: '',
      skills: [],
      primary_goals: [],
      desired_positions: [],
      company_name: '',
      company_size: '',
      industry: '',
      website: ''
    },
    mode: 'onChange'
  });

  // 🧠 Fetch user data on mount and populate form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await userAPI.getProfile();

        if (response.success && response.profile) {
          const profile = response.profile;

          // Format graduation date
          let graduationDate = '';
          if (profile.graduation) {
            const date = new Date(profile.graduation);
            graduationDate = date.toISOString().split('T')[0];
          }

          // Extract skill names
          const skillNames = profile.skills?.map(s => s.skill_name || s.name || s) || [];
          setTempSkills(skillNames);

          // Extract desired positions
          const positions = profile.desired_positions || [];
          setTempPositions(positions);

          // ✅ Populate form with fetched data
          form.reset({
            name: profile.name || '',
            email: profile.email || '',
            bio: profile.bio || '',
            avatar: profile.avatar || '',
            graduation: graduationDate,
            skills: skillNames,
            primary_goals: profile.primary_goals || [],
            desired_positions: positions,
            company_name: profile.company_name || '',
            company_size: profile.company_size || '',
            industry: profile.industry || '',
            website: profile.website || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [form, toast]);

  // 📝 Submit handler
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);

      console.log(data);

      // Include skills and desired positions directly in the profile payload
      const profileData = {
        name: data.name,
        email: data.email,
        bio: data.bio,
        avatar: data.avatar,
        graduation: data.graduation,
        company_name: data.company_name,
        company_size: data.company_size,
        industry: data.industry,
        website: data.website,
        skills: tempSkills,
        primary_goals: data.primary_goals,
        desired_positions: tempPositions
      };

      const response = await userAPI.updateProfile(profileData);

      if (response.success) {
        if (fetchMe) await fetchMe();
        toast({
          title: 'Success',
          description: 'Profile updated successfully'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to update profile'
      });
    } finally {
      setIsSaving(false);
    }
  };


  // 🧩 Skill management
  const addSkill = () => {
    if (newSkill.trim() && !tempSkills.includes(newSkill.trim())) {
      const updated = [...tempSkills, newSkill.trim()];
      setTempSkills(updated);
      form.setValue('skills', updated);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    const updated = tempSkills.filter(s => s !== skill);
    setTempSkills(updated);
    form.setValue('skills', updated);
  };

  // 🧩 Desired position management
  const addPosition = () => {
    if (newPosition.trim() && !tempPositions.includes(newPosition.trim())) {
      const updated = [...tempPositions, newPosition.trim()];
      setTempPositions(updated);
      form.setValue('desired_positions', updated);
      setNewPosition('');
    }
  };

  const removePosition = (position) => {
    const updated = tempPositions.filter(p => p !== position);
    setTempPositions(updated);
    form.setValue('desired_positions', updated);
  };

  const currentUser = authUser || {};

  if (isLoading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF7000]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" >
            Settings
          </h1>
          <p className="text-[#4B5563]">Manage your account and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* 🧾 Profile Tab */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Form key={form.watch('email')} {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-[#FFE4CC]">
                          <AvatarImage src={form.watch('avatar')} alt={form.watch('name')} />
                          <AvatarFallback>{form.watch('name')?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <Button type="button" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90">
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0F151D] mb-1">{form.watch('name')}</h3>
                        <p className="text-sm text-[#4B5563] mb-2">{form.watch('email')}</p>
                        <Badge className="bg-[#FFE4CC] capitalize text-[#FF7000] hover:bg-[#FFE4CC]">
                          {currentUser.plan}
                        </Badge>
                      </div>
                    </div>

                    {/* Basic Fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl><Input {...field} placeholder="Enter your name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl><Input {...field} type="email" /></FormControl>
                          <FormDescription>Email cannot be changed</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {currentUser.role === 'student' && (
                        <FormField control={form.control} name="graduation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Graduation</FormLabel>
                            <FormControl><Input {...field} type="date" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}

                      <FormField control={form.control} name="avatar" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar URL</FormLabel>
                          <FormControl><Input {...field} placeholder="https://example.com/avatar.jpg" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Bio */}
                    <FormField control={form.control} name="bio" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Tell us about yourself..." rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Student Skills */}
                    {currentUser.role === 'student' && (
                      <>
                        <div className="space-y-3">
                          <Label>Skills</Label>
                          <div className="flex gap-2">
                            <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addSkill();
                                }
                              }}
                            />
                            <Button type="button" onClick={addSkill} size="icon"><Plus className="w-4 h-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tempSkills.map((skill) => (
                              <Badge key={skill} className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF] pr-1">
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-600">
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Desired Positions */}
                        <div className="space-y-3">
                          <Label>Desired Positions</Label>
                          <div className="flex gap-2">
                            <Input value={newPosition} onChange={(e) => setNewPosition(e.target.value)} placeholder="Add a desired position"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addPosition();
                                }
                              }}
                            />
                            <Button type="button" onClick={addPosition} size="icon"><Plus className="w-4 h-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tempPositions.map((position) => (
                              <Badge key={position} className="bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC] pr-1">
                                {position}
                                <button type="button" onClick={() => removePosition(position)} className="ml-2 hover:text-red-600">
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Employer Fields */}
                    {currentUser.role === 'employer' && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {['company_name', 'company_size', 'industry', 'website'].map((field) => (
                          <FormField key={field} control={form.control} name={field} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</FormLabel>
                              <FormControl><Input {...f} placeholder={`Enter ${field.replace('_', ' ')}`} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        ))}
                      </div>
                    )}

                    <Button type="submit" className=" hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white" disabled={isSaving}>
                      {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save Changes</>)}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Job Matches', description: 'Get notified when new jobs match your profile', defaultChecked: true },
                  { label: 'Application Updates', description: 'Status changes on your applications', defaultChecked: true },
                  { label: 'Interview Reminders', description: 'Reminders for upcoming interviews', defaultChecked: true },
                  { label: 'Mentor Messages', description: 'Messages from your mentors', defaultChecked: true },
                  { label: 'Learning Progress', description: 'Course completion and milestones', defaultChecked: false },
                  { label: 'Marketing Emails', description: 'Tips, newsletters, and promotions', defaultChecked: false }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#0F151D]">{item.label}</p>
                      <p className="text-sm text-[#4B5563]">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your data and visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Profile Visibility', description: 'Allow employers to find your profile', defaultChecked: true },
                  { label: 'Show Activity Status', description: "Let others see when you're active", defaultChecked: true },
                  { label: 'Searchable by Email', description: 'Allow people to find you by email', defaultChecked: false },
                  { label: 'Anonymous Application', description: 'Hide your name until interview stage', defaultChecked: false }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#0F151D]">{item.label}</p>
                      <p className="text-sm text-[#4B5563]">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-[#0F151D] mb-2">Data Management</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="justify-start w-full">
                      Download Your Data
                    </Button>
                    <Button variant="outline" className="justify-start w-full text-red-600 border-red-600 hover:bg-red-50">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>Manage your plan and payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-[#FFFDFA] rounded-lg border-2 border-[#FFE4CC]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#0F151D]">Free Plan</h3>
                      <p className="text-sm text-[#4B5563]">Basic features for getting started</p>
                    </div>
                    <Badge className="bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC]">
                      Current Plan
                    </Badge>
                  </div>
                  <Button className="w-fullhover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white">
                    Upgrade to Premium
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium text-[#0F151D] mb-3">Payment Methods</h4>
                  <p className="text-sm text-[#4B5563] mb-4">No payment method added</p>
                  <Button variant="outline">
                    Add Payment Method
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium text-[#0F151D] mb-3">Billing History</h4>
                  <p className="text-sm text-[#4B5563]">No billing history available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
