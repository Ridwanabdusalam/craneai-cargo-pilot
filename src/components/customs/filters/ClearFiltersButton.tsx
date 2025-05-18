
import React from 'react';
import { FilterX } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ClearFiltersButtonProps {
  disabled: boolean;
  onClick: () => void;
}

const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({ disabled, onClick }) => {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={onClick}
      disabled={disabled}
    >
      <FilterX size={16} />
    </Button>
  );
};

export default ClearFiltersButton;
