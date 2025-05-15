import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import EnhancedNotificationCenter from '@/components/notifications/EnhancedNotificationCenter';

// Role display names
const roleNames: Record<UserRole, string> = {
  'ceo': 'CEO',
  'branch-manager': 'Branch Manager',
  'marketing-head': 'Marketing Head',
  'marketing-supervisor': 'Marketing Supervisor',
  'marketing-recruiter': 'Marketing Recruiter',
  'marketing-associate': 'Marketing Associate',
  'applicant': 'Applicant'
};

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout, setRole } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Link to="/">
              <Logo size={isMobile ? "sm" : "md"} />
            </Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notifications */}
            <EnhancedNotificationCenter />

            {/* User menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{roleNames[user.role]}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="w-full cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {/* Role switcher for demo purposes */}
                  <DropdownMenuLabel>Demo: Switch Role</DropdownMenuLabel>
                  <div className={isMobile ? "max-h-40 overflow-y-auto" : ""}>
                    <DropdownMenuItem onClick={() => setRole('ceo')}>
                      CEO
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole('branch-manager')}>
                      Branch Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole('marketing-head')}>
                      Marketing Head
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole('marketing-supervisor')}>
                      Marketing Supervisor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole('marketing-recruiter')}>
                      Marketing Recruiter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole('marketing-associate')}>
                      Marketing Associate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole('applicant')}>
                      Applicant
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;