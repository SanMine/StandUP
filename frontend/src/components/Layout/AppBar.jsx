import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, HelpCircle, User, LogOut } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

const AppBar = ({ user }) => {
  const navigate = useNavigate();
  const { signout } = useAuth();

  const handleSignOut = async () => {
    try {
      await signout();
      navigate('/auth');
    } catch (err) {
      // ignore - user will be redirected
      navigate('/auth');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://customer-assets.emergentagent.com/job_9597193e-4ccf-48a0-a66a-1efa796a5b1d/artifacts/ufitgc6x_stand.png" 
            alt="Stand Up Logo" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search roles, companies, mentors..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-[#FF7000] rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>

          <div className="w-px h-6 bg-gray-200 mx-2"></div>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hover:bg-gray-100 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white transition-all"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppBar;
