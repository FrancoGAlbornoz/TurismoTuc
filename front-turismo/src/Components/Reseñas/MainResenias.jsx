import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Table, Button, Badge, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import PaginationComponent from "../Filtros/Paginacion";
import BuscadorGeneral from "../Filtros/BuscadorGeneral";

const API = "http://localhost:8000/api";

export default function MainResenias() {
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [orden, setOrden] = useState(null); // null | 'desc' | 'asc'
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchReseñas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/resenias`, {
        // ACÁ ESTABA EL ERROR: Agregamos "ordenCalificacion: orden" para que el backend lo reciba
        params: { page: currentPage, limit: 10, q: busqueda, ordenCalificacion: orden },
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

  // Si cambia la búsqueda o el orden, reseteamos a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, orden]);

  // Se ejecuta cada vez que cambia la página, la búsqueda o el orden
  useEffect(() => {
    fetchReseñas();
  }, [currentPage, busqueda, orden]);

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
      <Card className="shadow-sm">
        <Card.Body className="p-3">
          {/* Cabecera Profesional */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="fw-bold text-success mb-0">Gestión de Reseñas</h5>
            
            <div className="d-flex gap-2">
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
            </div>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {loading ? (
             <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
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
                    <td><Badge bg="warning" text="dark">⭐ {r.calificacion}</Badge></td>
                    <td style={{ maxWidth: "250px" }} className="text-truncate" title={r.comentario}>{r.comentario}</td>
                    <td>{new Date(r.fecha_resena).toLocaleDateString("es-AR")}</td>
                    <td>
                      <Badge className="text-uppercase" bg={r.estado === "publicada" ? "success" : "secondary"}>
                        {r.estado}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => navigate(`/dashboard-admin/reseñas/edit/${r.id_resena}`)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleEliminar(r.id_resena)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No hay reseñas para mostrar.</td></tr>
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