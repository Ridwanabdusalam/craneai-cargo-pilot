
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    // Close sidebar by default on mobile, open on desktop
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Define page titles and subtitles based on current route
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'CraneAI Logistics Suite',
          subtitle: 'Welcome to your intelligent logistics command center'
        };
      case '/support':
        return {
          title: 'Support Hub',
          subtitle: 'Get assistance with your logistics needs and documentation'
        };
      case '/logistics':
        return {
          title: 'Logistics Control Center',
          subtitle: 'Monitor and manage your shipments in real-time'
        };
      case '/clearance':
        return {
          title: 'Smart Clearance',
          subtitle: 'AI-powered customs documentation and compliance'
        };
      case '/quotes':
        return {
          title: 'Smart Quote',
          subtitle: 'Get instant freight quotes with AI optimization'
        };
      case '/profile':
        return {
          title: 'Profile',
          subtitle: 'Manage your account settings and preferences'
        };
      case '/settings':
        return {
          title: 'Settings',
          subtitle: 'Configure your application preferences'
        };
      default:
        return {
          title: 'CraneAI Logistics Suite',
          subtitle: ''
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isMobile={!!isMobile}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <Header 
          toggleSidebar={toggleSidebar} 
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
        />
        
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
        
        <footer className="bg-white border-t border-border p-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Crane World Logistics • CraneAI Logistics Suite
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
