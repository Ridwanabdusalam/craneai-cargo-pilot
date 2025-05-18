
import React, { useState, useEffect } from 'react';
import { DocumentFilters as IDocumentFilters } from '@/types/documents';
import SearchInput from './filters/SearchInput';
import DocumentTypeFilter from './filters/DocumentTypeFilter';
import SortMenu, { SortOption } from './filters/SortMenu';
import ClearFiltersButton from './filters/ClearFiltersButton';

interface DocumentFilterProps {
  totalCount: number;
  onFilterChange: (filters: IDocumentFilters) => void;
  onSearch: (query: string) => void;
}

const DocumentFilter: React.FC<DocumentFilterProps> = ({ 
  totalCount, 
  onFilterChange, 
  onSearch 
}) => {
  const [search, setSearch] = useState('');
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
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
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <SearchInput totalCount={totalCount} onSearch={onSearch} />
      
      <div className="flex gap-2">
        <DocumentTypeFilter 
          documentTypes={documentTypes} 
          onChange={setDocumentTypes}
        />
        
        <SortMenu 
          sortBy={sortBy} 
          onSortChange={handleSortChange} 
        />
        
        <ClearFiltersButton 
          onClick={handleClearFilters}
          disabled={search === '' && documentTypes.length === 0 && sortBy === 'newest'}
        />
      </div>
    </div>
  );
};

export default DocumentFilter;
