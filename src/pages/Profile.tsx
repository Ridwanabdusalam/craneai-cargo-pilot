
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getProfile, updateProfile, Profile } from '@/services/profileService';
import { Loader2, Save, User, Shield, Bell, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    website: '',
    bio: '',
    avatar_url: ''
  });
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profileData = await getProfile(user.id);
        if (profileData) {
          setProfile(profileData);
          setFormData({
            username: profileData.username || '',
            full_name: profileData.full_name || '',
            website: profileData.website || '',
            bio: profileData.bio || '',
            avatar_url: profileData.avatar_url || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error loading profile',
          description: 'Failed to load your profile information.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user, navigate, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSaving(true);
    try {
      const updatedProfile = await updateProfile(user.id, formData);
      setProfile(updatedProfile);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: 'Failed to update your profile information.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2);
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-crane-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-crane-blue">My Profile</h1>
        <p className="text-muted-foreground">Manage your account and settings</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card className="border-none shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user?.email || ''} />
                <AvatarFallback className="bg-crane-blue/10 text-crane-blue text-xl">
                  {getInitials(profile?.full_name || user?.email?.split('@')[0] || 'User')}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h2 className="text-lg font-medium">{profile?.full_name || 'User'}</h2>
                <p className="text-sm text-muted-foreground">@{profile?.username || 'username'}</p>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                variant="outline" 
                className="w-full mt-2 text-destructive" 
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="ml-6">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="mr-2 h-4 w-4" /> Security
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="mr-2 h-4 w-4" /> Notifications
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Username"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input 
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="avatar_url">Avatar URL</Label>
                      <Input 
                        id="avatar_url"
                        name="avatar_url"
                        value={formData.avatar_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself"
                        rows={4}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-crane-blue hover:bg-opacity-90"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </>
                      )}
                    </Button>
                  </CardContent>
                </form>
              </TabsContent>
              
              <TabsContent value="security">
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">Security settings will be implemented in a future update.</p>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="notifications">
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">Notification settings will be implemented in a future update.</p>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
