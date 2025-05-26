import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { formsApi } from '@/lib/api';
import FormVotersTable from '@/components/search/FormVotersTable';
import UserVoteChecker from '@/components/search/UserVoteChecker';
import LoadingCard from '@/components/common/LoadingCard';
import EmptyState from '@/components/common/EmptyState';

export default function Search() {
  const [selectedFormId, setSelectedFormId] = useState<string>('');

  const { data: forms, isLoading: formsLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: formsApi.getAll,
  });

  const { data: voters, isLoading: votersLoading } = useQuery({
    queryKey: ['form-voters', selectedFormId],
    queryFn: () => formsApi.getVoters(Number(selectedFormId)),
    enabled: !!selectedFormId,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search & Analytics</h1>
      
      {/* Form Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Form</CardTitle>
        </CardHeader>
        <CardContent>
          {formsLoading ? (
            <LoadingCard message="Loading forms..." />
          ) : forms?.data.length === 0 ? (
            <EmptyState message="No forms available. Create a form first." />
          ) : (
            <Select value={selectedFormId} onValueChange={setSelectedFormId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a form to view analytics" />
              </SelectTrigger>
              <SelectContent>
                {forms?.data.map((form) => (
                  <SelectItem key={form.id} value={form.id.toString()}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedFormId && (
        <>
          <UserVoteChecker formId={Number(selectedFormId)} />

          <Card>
            <CardHeader>
              <CardTitle>Form Voters</CardTitle>
            </CardHeader>
            <CardContent>
              {votersLoading ? (
                <LoadingCard message="Loading voters..." />
              ) : voters?.data ? (
                <FormVotersTable voters={voters.data} />
              ) : (
                <EmptyState message="Failed to load voters data." />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 