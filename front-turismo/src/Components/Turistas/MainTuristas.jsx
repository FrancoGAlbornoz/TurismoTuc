import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card, Button, Table, Spinner, Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import { useDebounce } from "../../hooks/useDeBounce";

export default function MainTuristas() {
  const [turistas, setTuristas] = useState([]);
  const [filtro, setFiltro] = useState("activas");
  const [loading, setLoading] = useState(true);
  const [dniBuscar, setDniBuscar] = useState("");
  const debouncedDni = useDebounce(dniBuscar, 500);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const porPagina = 10;

  const navigate = useNavigate();

  // Función para obtener turistas
  const fetchTuristas = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/turistas?filtro=${filtro}&page=${page}&limit=${porPagina}`
      );
      setTuristas(res.data.data || []);
      setTotalPaginas(res.data.totalPages || 1);
      setPaginaActual(res.data.currentPage || 1);
    } catch (err) {
      console.error("Error al obtener turistas:", err);
      Swal.fire("Error", "No se pudieron cargar los turistas.", "error");
      setTuristas([]);
      setTotalPaginas(1);
      setPaginaActual(1);
    } finally {
      setLoading(false);
    }
  };

  // Función de búsqueda por DNI
  const buscarPorDNI = async (dni, page = 1) => {
    if (!dni) {
      fetchTuristas(page);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/turistas/buscar?dni=${dni}`
      );
      setTuristas(res.data.data || []);
      setTotalPaginas(res.data.totalPages || 1);
      setPaginaActual(res.data.currentPage || 1);
    } catch (err) {
      console.error("Error al buscar por DNI:", err);
      setTuristas([]);
      setTotalPaginas(1);
      setPaginaActual(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);
  
  useEffect(() => {
    buscarPorDNI(debouncedDni, 1);
  }, [debouncedDni]);

  useEffect(() => {
    fetchTuristas(paginaActual);
  }, [paginaActual, filtro]);

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "¿Eliminar turista?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/api/turistas/${id}`);
      Swal.fire({
        icon: "success",
        title: "Turista eliminado",
        text: "El turista fue eliminado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      // Refrescar la página actual
      buscarPorDNI(debouncedDni, paginaActual);
    } catch (err) {
      console.error("Error al eliminar turista:", err);
      Swal.fire("Error", "No se pudo eliminar el turista.", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h5 className="fw-bold text-success mb-2 mb-md-0">
              Gestión de Turistas
            </h5>
            <div className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar por DNI..."
                value={dniBuscar}
                onChange={(e) => setDniBuscar(e.target.value)}
                style={{ maxWidth: "200px" }}
              />
              <Button
                as={Link}
                to="/dashboard-admin/turistas/create"
                variant="success"
                size="sm"
              >
                <i className="bi bi-plus-circle me-1"></i> Crear Turista
              </Button>

              {/* Dropdown: Filtrar activas / eliminadas / todas */}
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-primary" size="sm">
                  <i className="bi bi-funnel"></i> Filtrar Eliminados
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setFiltro("activas")}>
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Activas
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setFiltro("eliminadas")}>
                    <i className="bi bi-x-circle text-danger me-2"></i>
                    Eliminadas
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setFiltro("todas")}>
                    <i className="bi bi-list-ul text-secondary me-2"></i>
                    Todas
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-3 text-muted">Cargando turistas...</p>
            </div>
          ) : (
            <>
              <Table hover responsive className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turistas.length > 0 ? (
                    turistas.map((t) => (
                      <tr key={t.id_turista}>
                        <td>{t.id_turista}</td>
                        <td>
                          {t.nombre} {t.apellido}
                        </td>
                        <td>{t.dni}</td>
                        <td>{t.email}</td>
                        <td>{t.telefono}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/dashboard-admin/turistas/view/${t.id_turista}`
                                )
                              }
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/dashboard-admin/turistas/edit/${t.id_turista}`
                                )
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(t.id_turista)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No hay turistas registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li
                        className={`page-item ${
                          paginaActual === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPaginaActual(paginaActual - 1)}
                        >
                          &laquo;
                        </button>
                      </li>

                      {Array.from(
                        { length: totalPaginas },
                        (_, i) => i + 1
                      ).map((num) => (
                        <li
                          key={num}
                          className={`page-item ${
                            paginaActual === num ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setPaginaActual(num)}
                          >
                            {num}
                          </button>
                        </li>
                      ))}

                      <li
                        className={`page-item ${
                          paginaActual === totalPaginas ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPaginaActual(paginaActual + 1)}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
