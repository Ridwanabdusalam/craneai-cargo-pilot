
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  Truck, 
  BarChart3, 
  Settings, 
  Home,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isMobile, isOpen, setIsOpen }: SidebarProps) => {
  const navItems = [
    { name: 'Dashboard', to: '/', icon: <Home size={20} /> },
    { name: 'AI Support Hub', to: '/support', icon: <MessageSquare size={20} /> },
    { name: 'SmartClearance', to: '/clearance', icon: <FileText size={20} /> },
    { name: 'Logistics Control', to: '/logistics', icon: <Truck size={20} /> },
    { name: 'SmartQuote', to: '/quotes', icon: <BarChart3 size={20} /> },
    { name: 'Settings', to: '/settings', icon: <Settings size={20} /> },
  ];

  const handleCloseSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-sidebar h-screen flex flex-col fixed top-0 left-0 z-40 transition-all duration-300",
        isMobile ? (isOpen ? "w-64" : "w-0 -translate-x-full") : "w-64"
      )}
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-crane-teal rounded-md flex items-center justify-center">
            <span className="font-bold text-white text-xl">C</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">CraneAI</h1>
            <p className="text-xs text-gray-300">Logistics Suite</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={handleCloseSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )
              }
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-sidebar-foreground rounded-md hover:bg-sidebar-accent transition-colors">
          <LogOut size={20} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
