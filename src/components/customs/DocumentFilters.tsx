
import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  SortAsc, 
  FilterX, 
  Check 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { DocumentFilters } from '@/types/documents';

interface DocumentFilterProps {
  totalCount: number;
  onFilterChange: (filters: DocumentFilters) => void;
  onSearch: (query: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'critical' | 'alpha';

const DocumentFilter: React.FC<DocumentFilterProps> = ({ 
  totalCount, 
  onFilterChange, 
  onSearch 
}) => {
  const [search, setSearch] = useState('');
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Document type options
  const documentTypeOptions = [
    'Commercial Invoice',
    'Bill of Lading', 
    'Packing List', 
    'Certificate of Origin',
    'Dangerous Goods Declaration',
    'Import/Export License',
    'Insurance Certificate',
    'Letter of Credit'
  ];

  useEffect(() => {
    // Debounce search to prevent too many API calls
    const timeoutId = setTimeout(() => {
      onSearch(search);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [search, onSearch]);

  const handleClearFilters = () => {
    setSearch('');
    setDocumentTypes([]);
    setSortBy('newest');
    onFilterChange({});
    onSearch('');
  };

  const handleSortChange = (sortOption: SortOption) => {
    setSortBy(sortOption);
    // Apply sorting logic based on selected option
    // This would typically be passed to the parent component
  };

  const handleDocumentTypeChange = (type: string) => {
    setDocumentTypes(prev => {
      const newTypes = prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type];
      
      // Update filters via the callback
      return newTypes;
    });
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          placeholder={`Search ${totalCount} documents...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter size={16} className="mr-2" />
              Filter
              {documentTypes.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
                  {documentTypes.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Filter Documents</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                Document Type
              </DropdownMenuLabel>
              {documentTypeOptions.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={documentTypes.includes(type)}
                  onCheckedChange={() => handleDocumentTypeChange(type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
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
              onClick={() => handleSortChange('newest')}
              className="flex justify-between"
            >
              Newest First
              {sortBy === 'newest' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleSortChange('oldest')}
              className="flex justify-between"
            >
              Oldest First
              {sortBy === 'oldest' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleSortChange('critical')}
              className="flex justify-between"
            >
              Critical Issues First
              {sortBy === 'critical' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleSortChange('alpha')}
              className="flex justify-between"
            >
              Alphabetically
              {sortBy === 'alpha' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleClearFilters}
          disabled={search === '' && documentTypes.length === 0 && sortBy === 'newest'}
        >
          <FilterX size={16} />
        </Button>
      </div>
    </div>
  );
};

export default DocumentFilter;
