import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BarChart3,
  Users,
  ClipboardCheck,
  Calendar,
  MessageSquare,
  UserCog,
  Settings,
  LogOut,
  Menu,
  Building,
  FileSearch,
  FileText,
  UserPlus,
  DollarSign,
  PieChart,
  Upload,
  Briefcase,
  Shield,
  UserCheck,
  Eye,
  Plus,
  ChevronDown,
  ChevronRight,
  UserCircle,
  Clock,
  Landmark,
  BadgeCheck,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  UserX
} from 'lucide-react';

// Define menu items per role
const menuItems: Record<UserRole, ({ title: string; path: string; icon: React.ElementType } | { title: string; icon: React.ElementType; isDropdown: true; subItems: { title: string; path: string; icon: React.ElementType }[] })[]> = {
  'ceo': [
    { title: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { title: 'Admin Panel', path: '/admin', icon: Shield },
    {
      title: 'Roles Management',
      icon: UserCheck,
      isDropdown: true,
      subItems: [
        { title: 'View Roles', path: '/roles', icon: Eye },
        { title: 'Add Role', path: '/roles/add', icon: Plus }
      ]
    },
    {
      title: 'Branches',
      icon: Building,
      isDropdown: true,
      subItems: [
        { title: 'List Branches', path: '/branches', icon: Eye },
        { title: 'Add Branch', path: '/branches/add', icon: Plus }
      ]
    },
    {
      title: 'Human Resources',
      icon: UserCircle,
      isDropdown: true,
      subItems: [
        { title: 'Employee List', path: '/profiles', icon: Users },
        { title: 'Employee Add', path: '/hr/employees/add', icon: UserPlus },
        { title: 'Employee Attendance', path: '/hr/attendance', icon: Clock },
        { title: 'Payroll', path: '/hr/payroll', icon: DollarSign },
        { title: 'Department', path: '/hr/departments', icon: Building },
        { title: 'Designation', path: '/hr/designations', icon: BadgeCheck },
        { title: 'Apply Leave', path: '/hr/leave/apply', icon: CalendarDays },
        { title: 'Leave Type', path: '/hr/leave/types', icon: CalendarCheck },
        { title: 'Leave Request', path: '/hr/leave/requests', icon: CalendarX },
        { title: 'Disable Employees', path: '/hr/employees/disabled', icon: UserX }
      ]
    },
    { title: 'Teams', path: '/teams', icon: Users },
    { title: 'Jobs Management', path: '/jobs-management', icon: Briefcase },
    { title: 'Resume Upload', path: '/resume-upload', icon: Upload },
    { title: 'Candidates', path: '/candidates', icon: ClipboardCheck },
    { title: 'Screenings', path: '/screenings', icon: FileSearch },
    { title: 'Interviews', path: '/interviews', icon: Calendar },
    { title: 'Reports', path: '/reports', icon: PieChart },
    { title: 'Profit Calculator', path: '/profit-calculator', icon: DollarSign },
    { title: 'Settings', path: '/settings', icon: Settings },
  ],
  'branch-manager': [
    { title: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    {
      title: 'Branches',
      icon: Building,
      isDropdown: true,
      subItems: [
        { title: 'List Branches', path: '/branches', icon: Eye },
        { title: 'Add Branch', path: '/branches/add', icon: Plus }
      ]
    },
    {
      title: 'Human Resources',
      icon: UserCircle,
      isDropdown: true,
      subItems: [
        { title: 'Employee List', path: '/profiles', icon: Users },
        { title: 'Employee Add', path: '/hr/employees/add', icon: UserPlus },
        { title: 'Employee Attendance', path: '/hr/attendance', icon: Clock },
        { title: 'Payroll', path: '/hr/payroll', icon: DollarSign },
        { title: 'Department', path: '/hr/departments', icon: Building },
        { title: 'Designation', path: '/hr/designations', icon: BadgeCheck },
        { title: 'Apply Leave', path: '/hr/leave/apply', icon: CalendarDays },
        { title: 'Leave Type', path: '/hr/leave/types', icon: CalendarCheck },
        { title: 'Leave Request', path: '/hr/leave/requests', icon: CalendarX },
        { title: 'Disable Employees', path: '/hr/employees/disabled', icon: UserX }
      ]
    },
    { title: 'Resume Upload', path: '/resume-upload', icon: Upload },
    { title: 'Teams', path: '/teams', icon: Users },
    { title: 'Jobs Management', path: '/jobs-management', icon: Briefcase },
    { title: 'Candidates', path: '/candidates', icon: ClipboardCheck },
    { title: 'Screenings', path: '/screenings', icon: FileSearch },
    { title: 'Interviews', path: '/interviews', icon: Calendar },
    { title: 'Reports', path: '/reports', icon: PieChart },
    { title: 'Profit Calculator', path: '/profit-calculator', icon: DollarSign },
    { title: 'Settings', path: '/settings', icon: Settings },
  ],
  'marketing-head': [
    { title: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    {
      title: 'Human Resources',
      icon: UserCircle,
      isDropdown: true,
      subItems: [
        { title: 'Employee List', path: '/profiles', icon: Users },
        { title: 'Employee Add', path: '/hr/employees/add', icon: UserPlus },
        { title: 'Employee Attendance', path: '/hr/attendance', icon: Clock },
        { title: 'Payroll', path: '/hr/payroll', icon: DollarSign },
        { title: 'Department', path: '/hr/departments', icon: Building },
        { title: 'Designation', path: '/hr/designations', icon: BadgeCheck },
        { title: 'Apply Leave', path: '/hr/leave/apply', icon: CalendarDays },
        { title: 'Leave Type', path: '/hr/leave/types', icon: CalendarCheck },
        { title: 'Leave Request', path: '/hr/leave/requests', icon: CalendarX },
        { title: 'Disable Employees', path: '/hr/employees/disabled', icon: UserX }
      ]
    },
    { title: 'Resume Upload', path: '/resume-upload', icon: Upload },
    { title: 'Teams', path: '/teams', icon: Users },
    { title: 'Jobs Management', path: '/jobs-management', icon: Briefcase },
    { title: 'Candidates', path: '/candidates', icon: Users },
    { title: 'Reports', path: '/reports', icon: PieChart },
    { title: 'Profit Calculator', path: '/profit-calculator', icon: DollarSign },
    { title: 'Settings', path: '/settings', icon: Settings },
  ],
  'marketing-supervisor': [
    { title: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    {
      title: 'Human Resources',
      icon: UserCircle,
      isDropdown: true,
      subItems: [
        { title: 'Employee List', path: '/profiles', icon: Users },
        { title: 'Employee Add', path: '/hr/employees/add', icon: UserPlus },
        { title: 'Employee Attendance', path: '/hr/attendance', icon: Clock },
        { title: 'Payroll', path: '/hr/payroll', icon: DollarSign },
        { title: 'Department', path: '/hr/departments', icon: Building },
        { title: 'Designation', path: '/hr/designations', icon: BadgeCheck },
        { title: 'Apply Leave', path: '/hr/leave/apply', icon: CalendarDays },
        { title: 'Leave Type', path: '/hr/leave/types', icon: CalendarCheck },
        { title: 'Leave Request', path: '/hr/leave/requests', icon: CalendarX },
        { title: 'Disable Employees', path: '/hr/employees/disabled', icon: UserX }
      ]
    },
    { title: 'Resume Upload', path: '/resume-upload', icon: Upload },
    { title: 'Teams', path: '/teams', icon: Users },
    { title: 'Jobs Management', path: '/jobs-management', icon: Briefcase },
    { title: 'Candidates', path: '/candidates', icon: Users },
    { title: 'Reports', path: '/reports', icon: PieChart },
    { title: 'Profit Calculator', path: '/profit-calculator', icon: DollarSign },
    { title: 'Settings', path: '/settings', icon: Settings },
  ],
  'marketing-recruiter': [
    { title: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    {
      title: 'Human Resources',
      icon: UserCircle,
      isDropdown: true,
      subItems: [
        { title: 'Employee List', path: '/profiles', icon: Users },
        { title: 'Employee Add', path: '/hr/employees/add', icon: UserPlus },
        { title: 'Employee Attendance', path: '/hr/attendance', icon: Clock },
        { title: 'Payroll', path: '/hr/payroll', icon: DollarSign },
        { title: 'Department', path: '/hr/departments', icon: Building },
        { title: 'Designation', path: '/hr/designations', icon: BadgeCheck },
        { title: 'Apply Leave', path: '/hr/leave/apply', icon: CalendarDays },
        { title: 'Leave Type', path: '/hr/leave/types', icon: CalendarCheck },
        { title: 'Leave Request', path: '/hr/leave/requests', icon: CalendarX },
        { title: 'Disable Employees', path: '/hr/employees/disabled', icon: UserX }
      ]
    },
    { title: 'Jobs Management', path: '/jobs-management', icon: Briefcase },
    { title: 'Resume Upload', path: '/resume-upload', icon: Upload },
    { title: 'Candidates', path: '/candidates', icon: Users },
    { title: 'Screenings', path: '/screenings', icon: FileSearch },
    { title: 'Settings', path: '/settings', icon: Settings },
  ],
  'marketing-associate': [
    { title: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    {
      title: 'Human Resources',
      icon: UserCircle,
      isDropdown: true,
      subItems: [
        { title: 'Employee List', path: '/profiles', icon: Users },
        { title: 'Employee Add', path: '/hr/employees/add', icon: UserPlus },
        { title: 'Employee Attendance', path: '/hr/attendance', icon: Clock },
        { title: 'Payroll', path: '/hr/payroll', icon: DollarSign },
        { title: 'Department', path: '/hr/departments', icon: Building },
        { title: 'Designation', path: '/hr/designations', icon: BadgeCheck },
        { title: 'Apply Leave', path: '/hr/leave/apply', icon: CalendarDays },
        { title: 'Leave Type', path: '/hr/leave/types', icon: CalendarCheck },
        { title: 'Leave Request', path: '/hr/leave/requests', icon: CalendarX },
        { title: 'Disable Employees', path: '/hr/employees/disabled', icon: UserX }
      ]
    },
    { title: 'Jobs Management', path: '/jobs-management', icon: Briefcase },
    { title: 'Resume Upload', path: '/resume-upload', icon: Upload },
    { title: 'Interviews', path: '/interviews', icon: Calendar },
    { title: 'Candidates', path: '/candidates', icon: Users },
    { title: 'Settings', path: '/settings', icon: Settings },
  ],
  'applicant': [
    { title: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { title: 'My Application', path: '/application', icon: ClipboardCheck },
    { title: 'Screenings', path: '/screenings', icon: FileSearch },
    { title: 'Interviews', path: '/interviews', icon: Calendar },
    { title: 'Settings', path: '/settings', icon: Settings },
  ],
};

interface AppSidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isMobile?: boolean;
}

const AppSidebar = ({
  isOpen = true,
  onOpenChange,
  isMobile = false
}: AppSidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Update parent component when sidebar is collapsed/expanded
  useEffect(() => {
    if (onOpenChange && !isMobile) {
      onOpenChange(!collapsed);
    }
  }, [collapsed, onOpenChange, isMobile]);

  if (!user) return null;

  const items = menuItems[user.role];

  // Render sidebar content
  const renderSidebarContent = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          {(!collapsed || isMobile) && (
            <div className="text-sidebar-foreground font-bold text-xl">
              QORE
            </div>
          )}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-sidebar-foreground p-1 rounded-md hover:bg-sidebar-accent"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 px-2 py-4 overflow-y-auto">
          <nav className="space-y-2">
            {items.map((item, index) => {
              // Handle dropdown menu items
              if ('isDropdown' in item) {
                const isActive = location.pathname.startsWith('/roles');
                const isOpen = openDropdowns[item.title] || false;

                const toggleDropdown = () => {
                  setOpenDropdowns(prev => ({
                    ...prev,
                    [item.title]: !prev[item.title]
                  }));
                };

                // Collapsed sidebar with tooltip
                if (collapsed && !isMobile) {
                  return (
                    <div key={index} className="relative">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "flex items-center w-full px-3 py-2 rounded-md transition-colors justify-center",
                                isActive
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground hover:bg-sidebar-accent"
                              )}
                              onClick={toggleDropdown}
                            >
                              <item.icon size={20} className="flex-shrink-0" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="font-normal">
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {isOpen && (
                        <div className="absolute left-full top-0 ml-2 bg-popover rounded-md shadow-md border border-border p-1 min-w-[160px] z-50">
                          {item.subItems.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              to={subItem.path}
                              className={cn(
                                "flex items-center px-3 py-2 rounded-md transition-colors text-sm",
                                location.pathname === subItem.path
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground hover:bg-accent/50"
                              )}
                              onClick={() => isMobile && onOpenChange?.(false)}
                            >
                              <subItem.icon size={16} className="flex-shrink-0 mr-2" />
                              <span>{subItem.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Expanded sidebar with collapsible dropdown
                return (
                  <Collapsible
                    key={index}
                    open={isOpen}
                    onOpenChange={toggleDropdown}
                    className={cn(
                      "rounded-md overflow-hidden",
                      isActive && !isOpen && "bg-sidebar-primary text-sidebar-primary-foreground"
                    )}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center w-full px-3 py-2 rounded-md transition-colors",
                          isActive && !isOpen
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <item.icon size={20} className="flex-shrink-0" />
                        <span className="ml-3 flex-1 text-left">{item.title}</span>
                        {isOpen ? (
                          <ChevronDown size={16} className="opacity-70" />
                        ) : (
                          <ChevronRight size={16} className="opacity-70" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animate-collapsible-down">
                      <div className="pl-8 pr-2 py-1 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={cn(
                              "flex items-center px-3 py-2 rounded-md transition-colors",
                              location.pathname === subItem.path
                                ? "bg-accent text-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                            onClick={() => isMobile && onOpenChange?.(false)}
                          >
                            <subItem.icon size={16} className="flex-shrink-0 mr-2" />
                            <span>{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              // Regular menu items
              const regularItem = item as { title: string; path: string; icon: React.ElementType };

              // Collapsed sidebar with tooltip
              if (collapsed && !isMobile) {
                return (
                  <TooltipProvider key={regularItem.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={regularItem.path}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md transition-colors justify-center",
                            location.pathname === regularItem.path
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent"
                          )}
                          onClick={() => isMobile && onOpenChange?.(false)}
                        >
                          <regularItem.icon size={20} className="flex-shrink-0" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-normal">
                        {regularItem.title}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }

              // Expanded sidebar with regular link
              return (
                <Link
                  key={regularItem.path}
                  to={regularItem.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    location.pathname === regularItem.path
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  onClick={() => isMobile && onOpenChange?.(false)}
                >
                  <regularItem.icon size={20} className="flex-shrink-0" />
                  <span className="ml-3">{regularItem.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          {collapsed && !isMobile ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-3 py-2 rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent justify-center"
                  >
                    <LogOut size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-normal">
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // Mobile sidebar uses Sheet component
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-[280px] bg-sidebar text-sidebar-foreground">
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <aside className={cn(
      "h-screen bg-sidebar fixed left-0 top-0 z-40 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {renderSidebarContent()}
    </aside>
  );
};

export default AppSidebar;
