import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Table, Button, Alert, Badge } from "react-bootstrap";
import PaginationComponent from "../Filtros/Paginacion"; // <-- importamos

export default function MainResenias() {
  const [reseñas, setReseñas] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ordenCalificacion, setOrdenCalificacion] = useState(null); // null = sin ordenar
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(2); // items por página
  const navigate = useNavigate();

  // =============================
  // CARGAR RESEÑAS CON PAGINACIÓN
  // =============================
  const fetchReseñas = async (page = 1) => {
    try {
      const res = await axios.get("http://localhost:8000/api/resenias", {
        params: { page, limit },
      });

      setReseñas(res.data.data);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error al obtener reseñas:", err);
      setError("No se pudieron cargar las reseñas.");
    }
  };

  useEffect(() => {
    fetchReseñas(currentPage);
  }, [currentPage]);

  // =============================
  // ORDENAR CALIFICACIÓN
  // =============================
  const toggleOrdenCalificacion = () => {
    if (ordenCalificacion === null) setOrdenCalificacion("desc");
    else if (ordenCalificacion === "desc") setOrdenCalificacion("asc");
    else setOrdenCalificacion("desc");
  };

  const reseñasOrdenadas = [...reseñas];
  if (ordenCalificacion) {
    reseñasOrdenadas.sort((a, b) =>
      ordenCalificacion === "asc" ? a.calificacion - b.calificacion : b.calificacion - a.calificacion
    );
  }

  // =============================
  // ELIMINAR RESEÑA
  // =============================
  const handleEliminar = async (id) => {
    try {
      const confirmar = window.confirm("¿Seguro que deseas eliminar esta reseña?");
      if (!confirmar) return;

      await axios.delete(`http://localhost:8000/api/resenias/${id}`);
      setMensaje("🗑️ Reseña eliminada correctamente.");
      fetchReseñas(currentPage);
      setTimeout(() => setMensaje(""), 2500);
    } catch (err) {
      console.error("Error al eliminar reseña:", err);
      setError("No se pudo eliminar la reseña.");
    }
  };

  // =============================
  // RENDER
  // =============================
  const getIconoOrden = () => {
    if (ordenCalificacion === "asc") return "bi-sort-numeric-up";
    if (ordenCalificacion === "desc") return "bi-sort-numeric-down";
    return "bi-sort";
  };

  return (
    <Card className="shadow-sm mt-5">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-success mb-0">Gestión de Reseñas</h5>

          <Button
            variant="outline-primary"
            size="sm"
            onClick={toggleOrdenCalificacion}
            className="d-flex align-items-center gap-1"
          >
            <i className={`bi ${getIconoOrden()}`}></i>
            {ordenCalificacion === "asc"
              ? "Calificación ↑"
              : ordenCalificacion === "desc"
              ? "Calificación ↓"
              : "Ordenar por calificación"}
          </Button>
        </div>

        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        {mensaje && <Alert variant="success" className="py-2">{mensaje}</Alert>}

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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reseñasOrdenadas.length > 0 ? (
              reseñasOrdenadas.map((r) => (
                <tr key={r.id_resena}>
                  <td>{r.id_resena}</td>
                  <td>{r.excursion}</td>
                  <td>{r.turista || "Sin asignar"}</td>
                  <td>
                    <Badge bg="warning" text="dark">
                      ⭐ {r.calificacion}
                    </Badge>
                  </td>
                  <td>{r.comentario || "—"}</td>
                  <td>{new Date(r.fecha_resena).toLocaleDateString()}</td>
                  <td>
                    <Badge bg={r.estado === "publicada" ? "success" : "secondary"}>
                      {r.estado}
                    </Badge>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() =>
                          navigate(`/dashboard-admin/reseñas/edit/${r.id_resena}`)
                        }
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleEliminar(r.id_resena)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-3">
                  No hay reseñas disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* ================= PAGINACIÓN ================= */}
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card.Body>
    </Card>
  );
}
