
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getValidationRules, createSampleValidationRules } from '@/services/documentService';
import { toast } from 'sonner';

interface ValidationRule {
  id: string;
  rule_name: string;
  rule_code: string;
  document_type: string;
  condition_field: string;
  condition_type: string;
  condition_value?: string;
  error_message: string;
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
  description: string;
}

export const ValidationRulesManager: React.FC = () => {
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadValidationRules();
  }, []);

  const loadValidationRules = async () => {
    try {
      setLoading(true);
      const fetchedRules = await getValidationRules('PDF Document');
      setRules(fetchedRules);
    } catch (error) {
      console.error('Error loading validation rules:', error);
      toast.error('Failed to load validation rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSampleRules = async () => {
    try {
      await createSampleValidationRules();
      toast.success('Sample validation rules created successfully');
      loadValidationRules();
    } catch (error) {
      console.error('Error creating sample rules:', error);
      toast.error('Failed to create sample validation rules');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading validation rules...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Validation Rules Manager</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={handleCreateSampleRules} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Sample Rules
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">No validation rules found.</p>
            <Button onClick={handleCreateSampleRules}>
              Create Sample Rules
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.rule_name}</TableCell>
                  <TableCell>{rule.document_type}</TableCell>
                  <TableCell>{rule.condition_field}</TableCell>
                  <TableCell>
                    {rule.condition_type}
                    {rule.condition_value && `: ${rule.condition_value}`}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(rule.severity)}>
                      {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
