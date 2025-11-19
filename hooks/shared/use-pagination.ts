import { useState, useEffect } from "react";

interface UsePaginationProps {
  itemsPerPage?: number;
  totalItems: number;
  dependencies?: any[];
}

export function usePagination({
  itemsPerPage = 15,
  totalItems,
  dependencies = [],
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Resetear página cuando cambian las dependencias (filtros, etc.)
  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedItems = <T,>(items: T[]): T[] => {
    return items.slice(startIndex, endIndex);
  };

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage,
    paginatedItems,
  };
}

