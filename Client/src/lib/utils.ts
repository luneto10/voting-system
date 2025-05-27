import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  // Handle Go zero time value
  if (dateString === '0001-01-01T00:00:00Z') return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  // Check for Go zero time value
  if (dateString === '0001-01-01T00:00:00Z') return false;
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export function paginateItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): PaginationResult<T> {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalPages,
    startIndex,
    endIndex,
  };
}

interface ServerPaginationResult {
  totalPages: number;
  startPage: number;
  endPage: number;
  hasStartEllipsis: boolean;
  hasEndEllipsis: boolean;
}

export function calculateServerPagination(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number = 5
): ServerPaginationResult {
  const halfVisible = Math.floor(maxVisiblePages / 2);
  
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  return {
    totalPages,
    startPage,
    endPage,
    hasStartEllipsis: startPage > 2,
    hasEndEllipsis: endPage < totalPages - 1,
  };
}
