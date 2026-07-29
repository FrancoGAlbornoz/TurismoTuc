import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import CatalogGrid from "../../Components/publicComponents/Catalogo/CatalogGrid";
import FilterSidebar from "../../Components/publicComponents/Catalogo/FilterSidebar";
import SortBar from "../../Components/publicComponents/Catalogo/SortBar";
import Paginacion from "../../Components/Filtros/Paginacion"; // ajustá la ruta si hace falta
import "../../styles/publicComponents/catalogo.css";

// Hook para leer parámetros de la URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Catalogo() {
  const { t } = useTranslation();

  const [excursiones, setExcursiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PAGINACIÓN
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const query = useQuery();
  const categoriaSeleccionada = query.get("categoria");

  const fetchExcursiones = async () => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_API_URL}/excursiones`;

      if (categoriaSeleccionada) {
        url += `?categoria=${encodeURIComponent(categoriaSeleccionada)}`;
      }

      const res = await axios.get(url);
      setExcursiones(res.data.data || []);
      setCurrentPage(1); // reset al cambiar data
    } catch (err) {
      console.error("Error al obtener excursiones:", err);
      setError("No se pudieron cargar las excursiones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExcursiones();
  }, [categoriaSeleccionada]);

  const handleFilterChange = (data) => {
    if (data) {
      setExcursiones(data);
    } else {
      fetchExcursiones();
      return;
    }
    setCurrentPage(1);
  };

  const handleSortChange = (order) => {
    const sorted = [...excursiones];

    switch (order) {
      case "precio_asc":
        sorted.sort((a, b) => a.precio_base - b.precio_base);
        break;
      case "precio_desc":
        sorted.sort((a, b) => b.precio_base - a.precio_base);
        break;
      case "fecha_nueva":
        sorted.sort(
          (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
        );
        break;
      case "fecha_vieja":
        sorted.sort(
          (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
        );
        break;
      default:
        return;
    }

    setExcursiones(sorted);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((excursiones.length || 0) / PAGE_SIZE);

  const excursionesPaginadas = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return excursiones.slice(start, start + PAGE_SIZE);
  }, [excursiones, currentPage]);

  useEffect(() => {
    if (totalPages <= 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <Container fluid className="catalogo-page py-4">
      <Row>
        {/* Sidebar con ordenar + filtros */}
        <Col md={3} lg={2}>
          <div className="sidebar-container">
            <h5 className="fw-bold mb-2 text-secondary">
              {t("filterSidebar.filter")}
            </h5>
            <SortBar onSortChange={handleSortChange} />
            <FilterSidebar onFilterChange={handleFilterChange} />
          </div>
        </Col>

        {/* Grilla principal */}
        <Col xs={12} md={9} lg={10}>
          {loading ? (
            <p>{t("catalogo.loading")}</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : excursiones.length === 0 ? (
            <p className="text-muted">{t("catalogo.empty")}</p>
          ) : (
            <>
              <CatalogGrid excursiones={excursionesPaginadas} />

              <Paginacion
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                maxVisible={5}
              />
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}