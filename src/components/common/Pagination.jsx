// src/components/common/Pagination.jsx

import React from 'react';

const PAGE_RANGE = 5; 

function Pagination({ totalPages, currentPage, onPageChange }) {
    
    if (totalPages <= 1 || !totalPages) return null;

    const pages = [];

    let startPage = Math.max(1, currentPage - Math.floor((PAGE_RANGE - 1) / 2));
    let endPage = Math.min(totalPages, startPage + PAGE_RANGE - 1);

    if (endPage - startPage + 1 < PAGE_RANGE) {
        startPage = Math.max(1, endPage - PAGE_RANGE + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        
        const buttonClasses = `
            mx-1 px-2 py-1 border border-gray-300 rounded transition-colors duration-150 ease-in-out
            text-sm 
            ${isActive 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100' 
            }
        `;
        
        pages.push(
            <button
                key={i}
                onClick={() => onPageChange(i)}
                className={buttonClasses.trim()} 
            >
                {i}
            </button>
        );
    }
    
    const firstPageButton = startPage > 1 ? (
        <button
            key={1}
            onClick={() => onPageChange(1)}
            className="mx-1 px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-100 text-sm"
        >
            1
        </button>
    ) : null;
    
    const startEllipsis = startPage > 2 ? (
        <span className="mx-1 px-2 py-1 text-gray-700">...</span>
    ) : null;

    const lastPageButton = endPage < totalPages ? (
        <button
            key={totalPages}
            onClick={() => onPageChange(totalPages)}
            className="mx-1 px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-100 text-sm"
        >
            {totalPages}
        </button>
    ) : null;

    const endEllipsis = endPage < totalPages - 1 ? (
        <span className="mx-1 px-2 py-1 text-gray-700">...</span>
    ) : null;

    return (
        <div className="flex justify-center mt-4 text-sm">
            
            <button
                onClick={() => onPageChange(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className="mx-1 px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-sm"
            >
                «
            </button>

            {firstPageButton}
            {startEllipsis}
            {pages}
            {endEllipsis}
            {lastPageButton}
            
            <button
                onClick={() => onPageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className="mx-1 px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-sm"
            >
                »
            </button>
        </div>
    );
}

export default Pagination;