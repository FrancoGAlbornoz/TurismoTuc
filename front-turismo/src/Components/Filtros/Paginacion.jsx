import React from "react";

const Paginacion = ({ paginaActual, totalPaginas, onPageChange }) => {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <div className="d-flex justify-content-center mt-3">
      <nav>
        <ul className="pagination pagination-sm mb-0">
          {/* Flecha izquierda */}
          <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(Math.max(paginaActual - 1, 1))}
            >
              &laquo;
            </button>
          </li>

          {/* Números de página */}
          {paginas.map((num) => (
            <li
              key={num}
              className={`page-item ${paginaActual === num ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(num)}>
                {num}
              </button>
            </li>
          ))}

          {/* Flecha derecha */}
          <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(Math.min(paginaActual + 1, totalPaginas))}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Paginacion;
