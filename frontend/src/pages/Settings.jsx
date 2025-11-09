import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Camera, Save } from 'lucide-react';
import { users } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';

const Settings = () => {
  const { user: authUser } = useAuth();

  const currentUser = authUser
    ? {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        avatar: authUser.avatar || users.student.avatar,
        role: authUser.role,
        profileStrength: authUser.profile_strength ?? authUser.profileStrength ?? 0,
        skills: Array.isArray(authUser.skills)
          ? authUser.skills.map(s => s.skill_name || s.name || s)
          : users.student.skills,
        graduation: authUser.graduation || users.student.graduation,
        bio: authUser.bio || users.student.bio
      }
    : users.student;
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F151D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
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

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-[#FFE4CC]">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#FF7000] hover:bg-[#FF7000]/90"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F151D] mb-1">{currentUser.name}</h3>
                    <p className="text-sm text-[#4B5563] mb-2">{currentUser.email}</p>
                    <Badge className="bg-[#FFE4CC] text-[#FF7000] hover:bg-[#FFE4CC]">
                      Free Plan
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={currentUser.name} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={currentUser.email} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+66 XX XXX XXXX" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Bangkok, Thailand" className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue={currentUser.bio} className="mt-1" />
                </div>

                <div>
                  <Label className="mb-3 block">Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.skills.map((skill) => (
                      <Badge key={skill} className="bg-[#E8F0FF] text-[#284688] hover:bg-[#E8F0FF]">
                        {skill}
                      </Badge>
                    ))}
                    <Button size="sm" variant="outline" className="h-6">
                      + Add Skill
                    </Button>
                  </div>
                </div>

                <Button className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
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

          <TabsContent value="privacy" className="space-y-6 mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your data and visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Profile Visibility', description: 'Allow employers to find your profile', defaultChecked: true },
                  { label: 'Show Activity Status', description: 'Let others see when you\'re active', defaultChecked: true },
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
                    <Button variant="outline" className="w-full justify-start">
                      Download Your Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6 mt-6">
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
                  <Button className="w-full bg-[#FF7000] hover:bg-[#FF7000]/90 text-white">
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
