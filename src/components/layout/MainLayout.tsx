
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import AppSidebar from './AppSidebar';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Add a slight delay for the animation to take effect
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // If no user, don't render the layout (will be handled by auth protection)
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        isOpen={sidebarOpen}
        onOpenChange={setSidebarOpen}
        isMobile={isMobile}
      />
      <div
        className={`
          transition-all duration-300
          ${isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-16'}
          min-h-screen
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`pt-20 ${isMobile ? 'px-4' : 'px-8'} pb-12`}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
