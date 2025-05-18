
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface DocumentTypeFilterProps {
  documentTypes: string[];
  onChange: (updater: (prev: string[]) => string[]) => void;
}

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

const DocumentTypeFilter: React.FC<DocumentTypeFilterProps> = ({ documentTypes, onChange }) => {
  const handleDocumentTypeChange = (type: string) => {
    onChange(prev => {
      return prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type];
    });
  };

  return (
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
  );
};

export default DocumentTypeFilter;
