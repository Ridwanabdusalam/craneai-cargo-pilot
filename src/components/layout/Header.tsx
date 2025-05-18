
import React from 'react';
import { Bell, Menu, Search, ChevronDown, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const location = useLocation();
  
  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/support') return 'AI Support Hub';
    if (path === '/clearance') return 'SmartClearance Engine';
    if (path === '/logistics') return 'Logistics Control Tower AI';
    if (path === '/quotes') return 'SmartQuote Optimizer';
    if (path === '/settings') return 'Settings';
    
    return 'CraneAI Logistics Suite';
  };

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-crane-blue">{getPageTitle()}</h1>
            <p className="text-sm text-muted-foreground">Crane World Logistics</p>
          </div>
        </div>

        <div className="hidden md:flex items-center border rounded-md bg-muted px-3 py-2 w-96">
          <Search size={18} className="text-muted-foreground" />
          <input
            placeholder="Search..."
            className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm"
          />
        </div>

        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1.5 w-2 h-2 bg-crane-coral rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center ml-2">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>OP</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm font-medium">Operations Manager</span>
                <ChevronDown size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User size={16} className="mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
