
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    // Close sidebar by default on mobile, open on desktop
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
        <Header toggleSidebar={toggleSidebar} />
        
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
