import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { formsApi } from '@/lib/api';
import type { Activity } from '@/lib/api';
import LoadingCard from '@/components/common/LoadingCard';
import EmptyState from '@/components/common/EmptyState';
import ActivityItem from '@/components/activity/ActivityItem';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Activity() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: activities, isLoading } = useQuery({
    queryKey: ['user-activities', statusFilter, page],
    queryFn: () => formsApi.getUserActivities(statusFilter, page, itemsPerPage),
  });

  const totalPages = activities?.data.total ? Math.ceil(activities.data.total / itemsPerPage) : 0;

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, page - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={i === page}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Activity History</h1>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {isLoading ? (
            <LoadingCard message="Loading activities..." />
          ) : activities?.data.data.length === 0 ? (
            <EmptyState message="No activities found." />
          ) : (
            <>
              <div className="space-y-3">
                {activities?.data.data.map((activity: Activity) => (
                  <ActivityItem key={`${activity.form_id}-${activity.completed_at || activity.last_modified}`} activity={activity} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent className="flex-wrap">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {renderPaginationItems()}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 