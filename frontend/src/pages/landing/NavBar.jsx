import { Menu, LogOut, LayoutDashboard, Briefcase, FolderKanban, Users2, GraduationCap, AwardIcon, SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from '../../components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../../components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';

const NavBar = () => {
    const { user, signout } = useAuth();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navigation items
    const navItems = [
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Why StandUP', href: '#why-standup' },
        { name: 'Jobs', href: '#featured-jobs' },
        { name: 'Mentors', href: '#mentors' },
        { name: 'Testimonials', href: '#testimonials' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Pricing', href: '#pricing' },
    ];

    // Menu items based on role
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

    // Smooth scroll function
    const scrollToSection = (href) => {
        const element = document.querySelector(href);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        setIsMobileMenuOpen(false);
    };

    const handleSignOut = async () => {
        try {
            await signout();
            navigate('/');
        } catch (err) {
            navigate('/');
        }
    };

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-md'
                    : 'bg-transparent'
            )}
        >
            <div className="container px-4 mx-auto">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Logo />

                    {/* Desktop Navigation */}
                    <div className="hidden lg:block">
                        <NavigationMenu>
                            <NavigationMenuList>
                                {navItems.map((item) => (
                                    <NavigationMenuItem key={item.name}>
                                        <NavigationMenuLink
                                            className={cn(
                                                'group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                                'hover:text-[#FF7000]',
                                                'focus:bg-[#FFE4CC]/50 focus:text-[#FF7000] focus:outline-none',
                                                'disabled:pointer-events-none disabled:opacity-50',
                                                isScrolled ? 'text-[#0F151D]' : 'text-[#0F151D]'
                                            )}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                scrollToSection(item.href);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {item.name}
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Desktop Auth Buttons / User Menu */}
                    <div className="items-center hidden gap-3 lg:flex">
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
                                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
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
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="text-red-600 cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    className="text-[#0F151D] hover:text-[#FF7000]"
                                    onClick={() => navigate('/auth')}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-[#FF7A2D] to-[#FF9547] hover:bg-[#FF7000]/90 text-white"
                                    onClick={() => navigate('/auth')}
                                >
                                    Get Started
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-[#0F151D]"
                                >
                                    <Menu className="size-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left">
                                        <Logo />
                                    </SheetTitle>
                                </SheetHeader>

                                {/* Mobile Navigation Links */}
                                <div className="flex flex-col gap-2 mt-8">
                                    {navItems.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => scrollToSection(item.href)}
                                            className="text-left px-4 py-3 text-[#0F151D] hover:text-[#FF7000] rounded-lg transition-colors font-medium"
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Mobile User Menu or Auth Buttons */}
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 px-4 py-4 mt-8 border-t">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback className="bg-[#FF7000] text-white">
                                                    {user.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 mt-4">
                                            {(user.role === 'employer' ? employerMenuItems : studentMenuItems).map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <button
                                                        key={item.path}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(false);
                                                            navigate(item.path);
                                                        }}
                                                        className="flex items-center gap-3 px-4 py-3 text-left text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        <span className="text-sm font-medium">{item.name}</span>
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    handleSignOut();
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 text-left text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm font-medium">Sign Out</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Mobile Auth Buttons */}
                                        <div className="flex flex-col gap-3 pt-8 mt-8 border-t">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-center border-[#FF7000] text-[#FF7000] hover:bg-[#FFE4CC]/50"
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    navigate('/auth');
                                                }}
                                            >
                                                Sign In
                                            </Button>
                                            <Button
                                                className="w-full justify-center bg-[#FF7000] hover:bg-[#FF7000]/90 text-white shadow-lg shadow-[#FF7000]/20"
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    navigate('/auth');
                                                }}
                                            >
                                                Get Started
                                            </Button>
                                        </div>

                                        {/* Mobile Footer Info */}
                                        <div className="pt-8 mt-8 border-t">
                                            <p className="text-sm text-[#4B5563] text-center">
                                                Join thousands of students finding their dream careers
                                            </p>
                                        </div>
                                    </>
                                )}
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;