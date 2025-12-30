// src/hooks/usePagination.js

import { useState, useMemo } from 'react';

const ITEMS_PER_PAGE = 10;

function usePagination(data) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    if (!data || !Array.isArray(data)) return 1;
    return Math.ceil(data.length / ITEMS_PER_PAGE);
  }, [data]);

  const paginatedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    return data.slice(start, end);
  }, [data, currentPage]);

  return { 
    currentPage, 
    setCurrentPage, 
    paginatedData, 
    totalPages,
    totalItems: data ? data.length : 0
  };
}

export default usePagination;