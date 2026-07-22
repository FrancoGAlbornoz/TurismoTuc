import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Table, Button, Badge, Spinner, Form, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import PaginationComponent from "../Filtros/Paginacion";
import BuscadorGeneral from "../Filtros/BuscadorGeneral";
import * as XLSX from "xlsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const API = import.meta.env.VITE_API_URL;

export default function MainResenias() {
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [orden, setOrden] = useState(null); // null | 'desc' | 'asc'
  const [busqueda, setBusqueda] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchReseñas = async () => {
    setLoading(true);
    try {
      let fDesde = "";
      let fHasta = "";

      if (filtroAnio === "personalizado") {
        fDesde = fechaDesde;
        fHasta = fechaHasta;
      } else if (filtroAnio !== "") {
        fDesde = `${filtroAnio}-01-01`;
        fHasta = `${filtroAnio}-12-31`;
      }

      const res = await axios.get(`${API}/resenias`, {
        // ACÁ ESTABA EL ERROR: Agregamos "ordenCalificacion: orden" para que el backend lo reciba
        params: { page: currentPage, limit: 10, q: busqueda, ordenCalificacion: orden, fechaDesde: fDesde, fechaHasta: fHasta },
      });
      setReseñas(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error al cargar reseñas:", err);
      setError("No se pudieron cargar las reseñas.");
    } finally {
      setLoading(false);
    }
  };

  // Si cambia la búsqueda, el orden o las fechas, reseteamos a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, orden, filtroAnio, fechaDesde, fechaHasta]);

  // Se ejecuta cada vez que cambia la página, la búsqueda, el orden o las fechas
  useEffect(() => {
    fetchReseñas();
  }, [currentPage, busqueda, orden, filtroAnio, fechaDesde, fechaHasta]);

  const exportToExcel = () => {
    if (reseñas.length === 0) {
      return Swal.fire("Sin datos", "No hay reseñas para exportar", "info");
    }
    const ws = XLSX.utils.json_to_sheet(reseñas.map(r => ({
      ID: r.id_resena,
      Excursion: r.excursion,
      Turista: r.turista,
      Calificacion: r.calificacion,
      Comentario: r.comentario,
      Fecha: new Date(r.fecha_resena).toLocaleDateString("es-AR"),
      Estado: r.estado
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reseñas");
    XLSX.writeFile(wb, "Reseñas_Export.xlsx");
  };

  const toggleOrden = () => {
    if (orden === null) setOrden("desc");
    else if (orden === "desc") setOrden("asc");
    else setOrden(null); // Vuelve al orden por defecto
  };

  const getIconoOrden = () => {
    if (orden === "asc") return "bi-sort-numeric-up";
    if (orden === "desc") return "bi-sort-numeric-down-alt";
    return "bi-funnel";
  };

  const handleEliminar = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar reseña?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.delete(`${API}/resenias/${id}`);
      Swal.fire("Eliminada", "Reseña eliminada correctamente.", "success");
      fetchReseñas(); // Recargamos la tabla
    } catch (err) {
      console.error("Error al eliminar reseña:", err);
      Swal.fire("Error", "No se pudo eliminar la reseña.", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card className="card-premium shadow-sm">
        <Card.Body className="p-3">
          {/* Cabecera Profesional */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="fw-bold text-success mb-0">
              Gestión de Reseñas
            </h5>
            
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <InputGroup size="sm" style={{ width: "auto" }}>
                <InputGroup.Text><i className="bi bi-calendar-event me-1"></i> Año</InputGroup.Text>
                <Form.Select 
                  value={filtroAnio}
                  onChange={(e) => {
                    setFiltroAnio(e.target.value);
                    if (e.target.value !== "personalizado") {
                      setFechaDesde("");
                      setFechaHasta("");
                    }
                  }}
                >
                  <option value="">Este Año ({new Date().getFullYear()})</option>
                  <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                  <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                  <option value={new Date().getFullYear() - 3}>{new Date().getFullYear() - 3}</option>
                  <option value="personalizado">Personalizado</option>
                </Form.Select>
              </InputGroup>

              {filtroAnio === "personalizado" && (
                <>
                  <InputGroup size="sm" style={{ width: "auto" }}>
                    <InputGroup.Text>Desde</InputGroup.Text>
                    <Form.Control type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
                  </InputGroup>
                  <InputGroup size="sm" style={{ width: "auto" }}>
                    <InputGroup.Text>Hasta</InputGroup.Text>
                    <Form.Control type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
                  </InputGroup>
                </>
              )}
              
              <div style={{ width: "250px" }}>
                 <BuscadorGeneral placeholder="Turista o excursión..." onBuscar={setBusqueda} />
              </div>
              <Button 
                variant={orden ? "success" : "outline-primary"} 
                size="sm" 
                onClick={toggleOrden}
                className="d-flex align-items-center gap-1"
                title="Ordenar por calificación"
              >
                <i className={`bi ${getIconoOrden()}`}></i> 
                {orden === "asc" ? "Menor a Mayor" : orden === "desc" ? "Mayor a Menor" : "Calificación"}
              </Button>
              <Button variant="outline-success" size="sm" onClick={exportToExcel} title="Exportar a Excel">
                <i className="bi bi-file-earmark-excel"></i> Excel
              </Button>
            </div>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {loading ? (
             <div className="py-4"><Skeleton count={8} height={45} className="mb-2" /></div>
          ) : (
            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Excursión</th>
                  <th>Turista</th>
                  <th>Calificación</th>
                  <th>Comentario</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reseñas.length > 0 ? reseñas.map((r) => (
                  <tr key={r.id_resena}>
                    <td>{r.id_resena}</td>
                    <td><div className="fw-semibold">{r.excursion}</div></td>
                    <td>{r.turista}</td>
                    <td><span className="badge badge-soft-warning text-dark px-2 py-1">⭐ {r.calificacion}</span></td>
                    <td style={{ maxWidth: "250px" }} className="text-truncate" title={r.comentario}>{r.comentario}</td>
                    <td>{new Date(r.fecha_resena).toLocaleDateString("es-AR")}</td>
                    <td>
                      <span className={`badge text-uppercase ${r.estado === "publicada" ? "badge-soft-success" : "badge-soft-secondary"}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="text-center">
                      <Button variant="outline-primary" size="sm" className="btn-action me-2" onClick={() => navigate(`/dashboard-admin/reseñas/edit/${r.id_resena}`)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" className="btn-action" onClick={() => handleEliminar(r.id_resena)}>
                        <i className="bi bi-archive"></i>
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="d-flex flex-column align-items-center justify-content-center text-muted">
                        <i className="bi bi-inbox mb-2" style={{ fontSize: "3rem", opacity: 0.5 }}></i>
                        <h5>No hay reseñas registradas</h5>
                        <p className="mb-0 small">Intenta buscar con otros filtros o cambia de año.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}

          <div className="d-flex justify-content-center mt-3">
             <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}