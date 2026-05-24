import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Table, Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import PaginationComponent from "../Filtros/Paginacion.jsx";
import BuscadorGeneral from "../Filtros/BuscadorGeneral.jsx"; // Ajustá la ruta según tu carpeta

export default function MainExcursiones() {
  const [excursiones, setExcursiones] = useState([]);
  const navigate = useNavigate();

  // Estados de Filtros y Paginación
  const [mostrarArchivadas, setMostrarArchivadas] = useState(false);
  const [estadoExcursion, setEstadoExcursion] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const porPagina = 10;

  const fetchExcursiones = async () => {
    try {
      const params = {
        page: paginaActual,
        limit: porPagina,
        mostrarArchivadas: mostrarArchivadas ? "true" : "false",
        estado: estadoExcursion,
        q: busqueda,
      };

      const res = await axios.get("http://localhost:8000/api/excursiones", { params });
      setExcursiones(res.data.data || []);
      setTotalPaginas(res.data.totalPages);
    } catch (err) {
      console.error("Error al obtener excursiones:", err);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las excursiones.",
        icon: "error",
      });
    }
  };

  // Resetear a página 1 cuando cambia un filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [mostrarArchivadas, estadoExcursion, busqueda]);

  // Cargar datos
  useEffect(() => {
    fetchExcursiones();
  }, [mostrarArchivadas, estadoExcursion, busqueda, paginaActual]);

  const handleEliminar = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Archivar excursión?",
      text: "La excursión pasará al historial de archivadas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, archivar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/api/excursiones/${id}`);
      Swal.fire({
        title: "Archivada",
        text: "Excursión archivada correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      fetchExcursiones();
    } catch (err) {
      console.error("Error al archivar excursión:", err);
      Swal.fire("Error", "No se pudo archivar la excursión.", "error");
    }
  };

  const handleRestore = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Restaurar excursión?",
      text: "Volverá a estar activa en el catálogo.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.put(`http://localhost:8000/api/excursiones/restore/${id}`);
      Swal.fire({
        title: "Restaurada",
        text: "Excursión restaurada correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      fetchExcursiones();
    } catch (err) {
      console.error("Error al restaurar excursión:", err);
      Swal.fire("Error", "No se pudo restaurar la excursión.", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-3">
          
          {/* Encabezado y Filtros */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h5 className="fw-bold text-success mb-2">
                Gestión de Excursiones{" "}
                <small className="text-muted" style={{ textTransform: "lowercase" }}>
                  ({mostrarArchivadas ? "archivadas" : "catálogo activo"})
                </small>
              </h5>

              {/* Integración del Buscador General */}
              <div style={{ maxWidth: "250px" }}>
                <BuscadorGeneral 
                  placeholder="Buscar excursión o ubicación..." 
                  onBuscar={(valor) => setBusqueda(valor)} 
                />
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => navigate("/dashboard-admin/excursiones/create")}
              >
                <i className="bi bi-plus-circle me-1"></i> Nueva Excursión
              </Button>

              {/* Toggle Archivadas */}
              <Button
                variant={mostrarArchivadas ? "success" : "outline-danger"}
                size="sm"
                onClick={() => setMostrarArchivadas(!mostrarArchivadas)}
              >
                {mostrarArchivadas ? (
                  <><i className="bi bi-arrow-left-circle me-1"></i> Volver al Catálogo</>
                ) : (
                  <><i className="bi bi-archive-fill me-1"></i> Mostrar Archivadas</>
                )}
              </Button>

              {/* Filtro de Estado */}
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-primary" size="sm">
                  <i className="bi bi-funnel"></i> Filtrar estado
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setEstadoExcursion("activa")}>
                    <i className="bi bi-check-circle text-success me-2"></i> Activas
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setEstadoExcursion("inactiva")}>
                    <i className="bi bi-dash-circle text-warning me-2"></i> Inactivas
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setEstadoExcursion("todas")}>
                    <i className="bi bi-list-ul text-secondary me-2"></i> Todas
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

            </div>
          </div>

          <Table hover responsive className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Ubicación</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Categorías</th>
                <th>Guía</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {excursiones.length > 0 ? (
                excursiones.map((e) => (
                  <tr key={e.id_excursion}>
                    <td>{e.id_excursion}</td>
                    <td>{e.titulo}</td>
                    <td>{e.ubicacion}</td>
                    <td>${e.precio_base}</td>
                    <td>
                      <span
                        className={`badge text-uppercase ${
                          e.estado === "activa" ? "bg-success" : "bg-warning"
                        }`}
                      >
                        {e.estado}
                      </span>
                    </td>
                    <td>
                      {e.categorias?.length > 0 ? (
                        e.categorias.map((cat, idx) => (
                          <span
                            key={`${e.id_excursion}-${cat.id_categoria_excursion}-${idx}`}
                            className="badge bg-info text-uppercase me-1"
                          >
                            {cat.nombre_categoria}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">Sin categoría</span>
                      )}
                    </td>
                    <td>
                      {e.nombre_guia ? (
                        <span
                          className="text-primary text-decoration-underline"
                          role="button"
                          onClick={() => navigate(`/dashboard-admin/usuarios/view/${e.id_guia}`)}
                        >
                          {e.nombre_guia} {e.apellido_guia}
                        </span>
                      ) : (
                        <span className="text-muted">Sin guía</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => navigate(`/dashboard-admin/excursiones/view/${e.id_excursion}`)}
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>

                        {!e.eliminado && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/dashboard-admin/excursiones/edit/${e.id_excursion}`)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        )}

                        {e.eliminado ? (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleRestore(e.id_excursion)}
                            title="Restaurar excursión"
                          >
                            <i className="bi bi-arrow-counterclockwise"></i>
                          </Button>
                        ) : (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminar(e.id_excursion)}
                            title="Archivar excursión"
                          >
                            <i className="bi bi-archive"></i>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    No hay excursiones registradas para este filtro
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Componente de Paginación Compartido */}
          <PaginationComponent
            currentPage={paginaActual}
            totalPages={totalPaginas}
            onPageChange={(page) => setPaginaActual(page)}
          />

        </Card.Body>
      </Card>
    </div>
  );
}