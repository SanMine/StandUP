import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import EmployerLayout from '../components/Layout/EmployerLayout';
import { useToast } from '../hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  company_name: z.string().optional(),
  company_size: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal(''))
});

const EmployerSettings = () => {
  const { user: authUser, fetchMe } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      avatar: '',
      company_name: '',
      company_size: '',
      industry: '',
      website: ''
    },
    mode: 'onChange'
  });

  // Fetch employer profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await userAPI.getProfile();

        if (response.success && response.profile) {
          const profile = response.profile;

          form.reset({
            name: profile.name || '',
            email: profile.email || '',
            bio: profile.bio || '',
            avatar: profile.avatar || '',
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

  // Submit handler
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);

      const profileData = {
        name: data.name,
        email: data.email,
        bio: data.bio,
        avatar: data.avatar,
        company_name: data.company_name,
        company_size: data.company_size,
        industry: data.industry,
        website: data.website
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

  const currentUser = authUser || {};

  if (isLoading) {
    return (
      <EmployerLayout user={currentUser}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF7000]" />
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout user={currentUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" >
            Employer Settings
          </h1>
          <p className="text-[#4B5563]">Manage your company profile and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Update your company information</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Form key={form.watch('email')} {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-[#FFE4CC]">
                          <AvatarImage src={form.watch('avatar')} alt={form.watch('name')} />
                          <AvatarFallback>{form.watch('name')?.charAt(0) || 'C'}</AvatarFallback>
                        </Avatar>
                        <Button type="button" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full text-white hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90">
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0F151D] mb-1">{form.watch('company_name') || form.watch('name')}</h3>
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
                          <FormLabel>Contact Name *</FormLabel>
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

                      <FormField control={form.control} name="company_name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl><Input {...field} placeholder="Enter company name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="company_size" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g., 1-10, 11-50, 51-200" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="industry" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl><Input {...field} placeholder="Enter industry" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="website" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website</FormLabel>
                          <FormControl><Input {...field} placeholder="https://example.com" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="avatar" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl><Input {...field} placeholder="https://example.com/logo.jpg" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Bio */}
                    <FormField control={form.control} name="bio" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Tell us about your company..." rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

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
                  { label: 'New Applications', description: 'Get notified when candidates apply to your jobs', defaultChecked: true },
                  { label: 'Application Updates', description: 'Updates on candidate application status', defaultChecked: true },
                  { label: 'Interview Reminders', description: 'Reminders for scheduled interviews', defaultChecked: true },
                  { label: 'Candidate Messages', description: 'Messages from candidates', defaultChecked: true },
                  { label: 'Event Updates', description: 'Updates on your posted events', defaultChecked: false },
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
                  { label: 'Company Profile Visibility', description: 'Allow candidates to find your company', defaultChecked: true },
                  { label: 'Show Activity Status', description: "Let others see when you're active", defaultChecked: true },
                  { label: 'Searchable by Email', description: 'Allow people to find you by email', defaultChecked: false },
                  { label: 'Anonymous Job Postings', description: 'Hide company name until application review', defaultChecked: false }
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
                      <h3 className="text-lg font-semibold text-[#0F151D]">Business Plan</h3>
                      <p className="text-sm text-[#4B5563]">Full features for hiring teams</p>
                    </div>
                    <Badge className="bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC]">
                      Current Plan
                    </Badge>
                  </div>
                  <Button className="w-full hover: bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] text-white/90 text-white">
                    Upgrade to Enterprise
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
    </EmployerLayout>
  );
};

export default EmployerSettings;
