import { Button } from "react-bootstrap";

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}) {
  if (totalPages <= 1) return null;

  const handlePrev = () => currentPage > 1 && onPageChange(currentPage - 1);
  const handleNext = () => currentPage < totalPages && onPageChange(currentPage + 1);

  // Calculamos startPage y endPage
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = startPage + maxVisible - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex justify-content-center align-items-center gap-1 mt-3 flex-wrap">
      <Button size="sm" variant="outline-primary" onClick={handlePrev} disabled={currentPage === 1}>
        &lt;
      </Button>

      {startPage > 1 && (
        <>
          <Button size="sm" variant="outline-primary" onClick={() => onPageChange(1)}>1</Button>
          {startPage > 2 && <span className="mx-1">…</span>}
        </>
      )}

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

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="mx-1">…</span>}
          <Button size="sm" variant="outline-primary" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button size="sm" variant="outline-primary" onClick={handleNext} disabled={currentPage === totalPages}>
        &gt;
      </Button>
    </div>
  );
}
