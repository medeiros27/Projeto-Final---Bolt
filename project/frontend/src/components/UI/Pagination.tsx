import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Button from './Button';
import { clsx } from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
  totalItems?: number;
  itemsPerPage?: number;
  showItemsCount?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 7,
  className,
  totalItems,
  itemsPerPage,
  showItemsCount = true
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      const startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  
  // Calculate start and end item numbers
  const startItem = totalItems ? (currentPage - 1) * (itemsPerPage || 10) + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * (itemsPerPage || 10), totalItems) : null;

  return (
    <div className={clsx('flex flex-col items-center space-y-2', className)}>
      <nav className="flex items-center justify-center space-x-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {/* First page button (if not in visible pages) */}
        {showFirstLast && !visiblePages.includes(1) && (
          <>
            <Button
              variant={currentPage === 1 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </>
        )}

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return <MoreHorizontal key={`ellipsis-${index}`} className="h-4 w-4 text-gray-400" />;
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          );
        })}

        {/* Last page button (if not in visible pages) */}
        {showFirstLast && !visiblePages.includes(totalPages) && (
          <>
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
            <Button
              variant={currentPage === totalPages ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-2"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
      
      {/* Items count */}
      {showItemsCount && totalItems !== null && startItem !== null && endItem !== null && (
        <div className="text-sm text-gray-500">
          Mostrando {startItem} a {endItem} de {totalItems} itens
        </div>
      )}
    </div>
  );
};

export default Pagination;