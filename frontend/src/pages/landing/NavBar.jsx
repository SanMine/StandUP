import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { AwardIcon, Briefcase, FolderKanban, GraduationCap, LayoutDashboard, LogOut, SettingsIcon, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

export default function NavBar() {
    const navigate = useNavigate();
    const { user, signout } = useAuth();

    const handleSignOut = async () => {
        try {
            await signout();
            navigate('/');
        } catch (err) {
            navigate('/');
        }
    };

    const studentMenuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', path: '/jobs', icon: Briefcase },
        { name: 'Applications', path: '/applications', icon: FolderKanban },
        { name: 'Mentors', path: '/mentors', icon: Users2 },
        { name: 'Learning', path: '/learning', icon: GraduationCap },
        { name: 'Skills', path: '/skills', icon: AwardIcon },
        { name: 'Settings', path: '/settings', icon: SettingsIcon }
    ];

    const employerMenuItems = [
        { name: 'Dashboard', path: '/employer-dashboard', icon: LayoutDashboard },
        { name: 'Settings', path: '/employer-settings', icon: SettingsIcon }
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/75 backdrop-blur-sm">
            <div className="flex items-center justify-between h-16 px-4 mx-auto lg:px-0 max-w-7xl">
                <Logo />
                <div className="flex items-center gap-4">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 px-3 py-2 transition-colors rounded-lg hover:bg-gray-100">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-[#FF7000] text-white">
                                            {user.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden text-sm font-medium text-gray-700 md:flex">{user.name}</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {(user.role === 'employer' ? employerMenuItems : studentMenuItems).map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <DropdownMenuItem
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            className="cursor-pointer"
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            <span>{item.name}</span>
                                        </DropdownMenuItem>
                                    );
                                })}
                                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/auth')}
                                className="text-gray-700 hover:text-[#FF7000] transition-colors"
                            >
                                Sign In
                            </Button>
                            <Button
                                onClick={() => navigate('/auth')}
                                className="bg-[#FF7000] hover:bg-[#FF7000]/90 text-white px-6 transition-all shadow-sm hover:shadow-md"
                            >
                                Get Started
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
