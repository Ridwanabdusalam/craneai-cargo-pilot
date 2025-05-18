
import React from 'react';
import { SortAsc, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortOption = 'newest' | 'oldest' | 'critical' | 'alpha';

interface SortMenuProps {
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ sortBy, onSortChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <SortAsc size={16} className="mr-2" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onSortChange('newest')}
          className="flex justify-between"
        >
          Newest First
          {sortBy === 'newest' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onSortChange('oldest')}
          className="flex justify-between"
        >
          Oldest First
          {sortBy === 'oldest' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onSortChange('critical')}
          className="flex justify-between"
        >
          Critical Issues First
          {sortBy === 'critical' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onSortChange('alpha')}
          className="flex justify-between"
        >
          Alphabetically
          {sortBy === 'alpha' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortMenu;
