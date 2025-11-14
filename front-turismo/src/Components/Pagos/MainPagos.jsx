import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Spinner,
  Dropdown,
  Pagination,
} from "react-bootstrap";
import Swal from "sweetalert2";

export default function MainPagos() {
  const [pagos, setPagos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const fetchPagos = async (estado = filtro, page = currentPage) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/pagos", {
        params:
          estado !== "todos"
            ? { estado, page, limit }
            : { page, limit },
      });
      setPagos(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
    } catch (err) {
      console.error("Error al obtener pagos:", err);
      setError("No se pudieron cargar los pagos.");
      setTimeout(() => setError(""), 2500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos(filtro, currentPage);
  }, [filtro, currentPage]);

  const actualizarEstado = async (id_pago, nuevo_estado) => {
    const confirmacion = await Swal.fire({
      title: `¿Confirmar cambio a "${nuevo_estado}"?`,
      text: "Esta acción actualizará el estado del pago.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.put(`http://localhost:8000/api/pagos/${id_pago}`, {
        nuevo_estado,
      });
      setPagos((prev) =>
        prev.map((p) =>
          p.id_pago === id_pago ? { ...p, estado_pago: nuevo_estado } : p
        )
      );
      setMensaje(`Pago actualizado a "${nuevo_estado}"`);
      setTimeout(() => setMensaje(""), 2500);
    } catch (err) {
      console.error("Error al actualizar pago:", err);
      setError("No se pudo actualizar el estado del pago.");
      setTimeout(() => setError(""), 2500);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <h5 className="fw-bold text-success mb-2 mb-md-0">
            Gestión de Pagos{""}
            <small className="text-muted">({filtro})</small>
          </h5>

          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-primary" size="sm">
              <i className="bi bi-funnel"></i> Filtrar por estado
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFiltro("todos")}>
                <i className="bi bi-list-ul text-secondary me-2"></i>
                Todos
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFiltro("aprobado")}>
                <i className="bi bi-check-circle text-success me-2"></i>
                Aprobado
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFiltro("pendiente")}>
                <i className="bi bi-hourglass-split text-warning me-2"></i>
                Pendiente
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFiltro("rechazado")}>
                <i className="bi bi-x-circle text-danger me-2"></i>
                Rechazado
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {mensaje && (
          <Alert variant="success" onClose={() => setMensaje("")} dismissible>
            {mensaje}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        <Table hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Turista</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Referencia</th>
              <th>Reserva</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-3">
                  <Spinner animation="border" size="sm" /> Cargando pagos...
                </td>
              </tr>
            ) : pagos.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted py-3">
                  No hay pagos registrados.
                </td>
              </tr>
            ) : (
              pagos.map((p) => (
                <tr key={p.id_pago}>
                  <td>{p.id_pago}</td>
                  <td>{p.turista_nombre} {p.turista_apellido}</td>
                  <td>{p.metodo}</td>
                  <td>${p.monto?.toLocaleString("es-AR")}</td>
                  <td>
                    <Badge
                      bg={
                        p.estado_pago === "aprobado"
                          ? "success"
                          : p.estado_pago === "pendiente"
                          ? "warning text-dark"
                          : "danger"
                      }
                    >
                      {p.estado_pago}
                    </Badge>
                  </td>
                  <td>{p.referencia || "—"}</td>
                  <td>{p.id_reserva}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          navigate(`/dashboard-admin/pagos/view/${p.id_pago}`)
                        }
                      >
                        <i className="bi bi-eye"></i>
                      </Button>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() =>
                          navigate(`/dashboard-admin/pagos/edit/${p.id_pago}`)
                        }
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>

                      {p.estado_pago === "pendiente" && (
                        <>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() =>
                              actualizarEstado(p.id_pago, "aprobado")
                            }
                          >
                            <i className="bi bi-check2-circle"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              actualizarEstado(p.id_pago, "rechazado")
                            }
                          >
                            <i className="bi bi-x-circle"></i>
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {totalPages > 1 && renderPagination()}
      </Card.Body>
    </Card>
  );
}
