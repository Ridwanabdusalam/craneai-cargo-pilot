
import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  totalCount: number;
  onSearch: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ totalCount, onSearch }) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Debounce search to prevent too many API calls
    const timeoutId = setTimeout(() => {
      onSearch(search);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [search, onSearch]);

  return (
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
  );
};

export default SearchInput;
