import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Table, Button, Alert, Badge, Spinner } from "react-bootstrap";
import PaginationComponent from "../Filtros/Paginacion";
import BuscadorGeneral from "../Filtros/BuscadorGeneral"; // Agregamos buscador

export default function MainResenias() {
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  
  const [orden, setOrden] = useState(null);
  const [busqueda, setBusqueda] = useState(""); // Nuevo estado
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchReseñas = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/resenias", {
        params: { page: currentPage, limit: 10, q: busqueda }, // Ajustado a 10
      });
      setReseñas(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError("No se pudieron cargar las reseñas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReseñas();
  }, [currentPage, busqueda]); // Recarga si cambia página o búsqueda

  const handleEliminar = async (id) => {
    // ... tu lógica de SweetAlert de siempre
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
              <Button variant="outline-primary" size="sm" onClick={() => setOrden(orden === 'asc' ? 'desc' : 'asc')}>
                <i className={`bi bi-sort-numeric-${orden === 'asc' ? 'up' : 'down'}`}></i> Calificación
              </Button>
            </div>
          </div>

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
                    <td style={{ maxWidth: "250px" }} className="text-truncate">{r.comentario}</td>
                    <td>{new Date(r.fecha_resena).toLocaleDateString()}</td>
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
                  <tr><td colSpan="8" className="text-center py-4">No hay reseñas para mostrar.</td></tr>
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