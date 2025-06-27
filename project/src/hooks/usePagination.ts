import { useState, useMemo, useEffect } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
  initialPage?: number;
  persistKey?: string; // Optional key to persist pagination state in localStorage
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  currentData: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  setItemsPerPage: (count: number) => void;
  itemsPerPage: number;
  resetPage: () => void;
}

export function usePagination<T>({
  data,
  itemsPerPage: initialItemsPerPage = 10,
  initialPage = 1,
  persistKey
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  // Try to load persisted state if persistKey is provided
  const getInitialState = () => {
    if (persistKey) {
      try {
        const savedState = localStorage.getItem(`pagination_${persistKey}`);
        if (savedState) {
          const { page, itemsCount } = JSON.parse(savedState);
          return {
            currentPage: page || initialPage,
            itemsPerPage: itemsCount || initialItemsPerPage
          };
        }
      } catch (error) {
        console.error('Error loading pagination state:', error);
      }
    }
    return {
      currentPage: initialPage,
      itemsPerPage: initialItemsPerPage
    };
  };

  const { currentPage: initialCurrentPage, itemsPerPage: initialItemsCount } = getInitialState();
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsCount);

  // Reset to page 1 when data changes significantly
  useEffect(() => {
    if (currentPage > 1 && data.length <= itemsPerPage) {
      setCurrentPage(1);
    }
  }, [data.length, itemsPerPage]);

  // Save state to localStorage if persistKey is provided
  useEffect(() => {
    if (persistKey) {
      try {
        localStorage.setItem(
          `pagination_${persistKey}`,
          JSON.stringify({
            page: currentPage,
            itemsCount: itemsPerPage
          })
        );
      } catch (error) {
        console.error('Error saving pagination state:', error);
      }
    }
  }, [currentPage, itemsPerPage, persistKey]);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  
  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);
  
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, data.length);

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
    startIndex,
    endIndex,
    totalItems: data.length,
    setItemsPerPage: (count: number) => {
      setItemsPerPage(count);
      setCurrentPage(1); // Reset to first page when changing items per page
    },
    itemsPerPage,
    resetPage
  };
}