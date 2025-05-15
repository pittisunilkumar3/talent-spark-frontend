import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'ceo' | 'branch-manager' | 'marketing-head' | 'marketing-supervisor' | 'marketing-recruiter' | 'marketing-associate' | 'applicant';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  locationId?: string;
  departmentId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for different roles
const demoUsers: Record<UserRole, User> = {
  'ceo': {
    id: '1',
    name: 'Sarah Chen',
    email: 'ceo@qore.io',
    role: 'ceo',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    // CEO has access to all locations and departments
  },
  'branch-manager': {
    id: '2',
    name: 'Michael Thompson',
    email: 'branch-manager@qore.io',
    role: 'branch-manager',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-1' // Miami Headquarters
  },
  'marketing-head': {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'marketing-head@qore.io',
    role: 'marketing-head',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    departmentId: 'dept-1' // Marketing (Recruitment)
  },
  'marketing-supervisor': {
    id: '4',
    name: 'David Kim',
    email: 'marketing-supervisor@qore.io',
    role: 'marketing-supervisor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-1', // Miami Headquarters
    departmentId: 'dept-1' // Marketing (Recruitment)
  },
  'marketing-recruiter': {
    id: '5',
    name: 'Jordan Lee',
    email: 'recruiter@qore.io',
    role: 'marketing-recruiter',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-1', // Miami Headquarters
    departmentId: 'dept-1' // Marketing (Recruitment)
  },
  'marketing-associate': {
    id: '6',
    name: 'Taylor Smith',
    email: 'associate@qore.io',
    role: 'marketing-associate',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    locationId: 'loc-1', // Miami Headquarters
    departmentId: 'dept-1' // Marketing (Recruitment)
  },
  'applicant': {
    id: '7',
    name: 'Alex Johnson',
    email: 'applicant@qore.io',
    role: 'applicant',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // For demo purposes only
  const login = async (email: string, password: string) => {
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple email-based role assignment for demo
    if (email.includes('ceo')) {
      setUser(demoUsers['ceo']);
    } else if (email.includes('branch-manager')) {
      setUser(demoUsers['branch-manager']);
    } else if (email.includes('marketing-head')) {
      setUser(demoUsers['marketing-head']);
    } else if (email.includes('marketing-supervisor')) {
      setUser(demoUsers['marketing-supervisor']);
    } else if (email.includes('recruiter')) {
      setUser(demoUsers['marketing-recruiter']);
    } else if (email.includes('associate')) {
      setUser(demoUsers['marketing-associate']);
    } else {
      setUser(demoUsers['applicant']);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // For demo purposes - allows switching roles
  const setRole = (role: UserRole) => {
    setUser(demoUsers[role]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
