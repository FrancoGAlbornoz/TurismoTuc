import React from "react";
import { Button } from "react-bootstrap";

export default function PaginationComponent({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; // Oculta si hay 1 página o menos

  const handlePrev = () => onPageChange(currentPage - 1);
  const handleNext = () => onPageChange(currentPage + 1);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
      <Button
        size="sm"
        variant="outline-primary"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        &lt;
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === currentPage ? "primary" : "outline-primary"}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      <Button
        size="sm"
        variant="outline-primary"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        &gt;
      </Button>
    </div>
  );
}
