import Logo from '@/pages/landing/Logo';
import { Bell, HelpCircle, LogOut, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const AppBar = ({ user }) => {
  const navigate = useNavigate();
  const { signout } = useAuth();

  const handleSignOut = async () => {
    try {
      await signout();
      navigate('/auth');
    } catch (err) {
      navigate('/auth');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <Logo />

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <Input
              type="text"
              placeholder="Search roles, companies, mentors..."
              className="pl-10 transition-colors border-gray-200 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative transition-colors hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-[#FF7000] rounded-full"></span>
          </Button>

          <Button variant="ghost" size="icon" className="transition-colors hover:bg-gray-100">
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </Button>

          <Button variant="ghost" size="icon" className="transition-colors hover:bg-gray-100">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </Button>

          <div className="w-px h-6 mx-2 bg-gray-200"></div>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-2 py-1 transition-colors rounded-lg hover:bg-gray-100"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="transition-colors hover:bg-gray-100"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-600" />
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
