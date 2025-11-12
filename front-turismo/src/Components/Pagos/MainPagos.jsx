import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Table, Button, Badge, Alert } from "react-bootstrap";
import Swal from "sweetalert2";

export default function MainPagos() {
  const [pagos, setPagos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchPagos = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/pagos");
      setPagos(res.data);
    } catch (err) {
      console.error("Error al obtener pagos:", err);
      setError("No se pudieron cargar los pagos.");
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

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
      setMensaje(`Pago actualizado a ${nuevo_estado}`);
      fetchPagos();
      setTimeout(() => setMensaje(""), 2500);
    } catch (err) {
      console.error("Error al actualizar pago:", err);
      setError("No se pudo actualizar el estado del pago.");
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-success mb-0">Gestión de Pagos</h5>
        </div>

        {mensaje && <Alert variant="success" className="py-2">{mensaje}</Alert>}
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}

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
            {pagos.length > 0 ? (
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
                        onClick={() => navigate(`/dashboard-admin/pagos/view/${p.id_pago}`)}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/dashboard-admin/pagos/edit/${p.id_pago}`)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>

                      {p.estado_pago === "pendiente" && (
                        <>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => actualizarEstado(p.id_pago, "aprobado")}
                          >
                            <i className="bi bi-check2-circle"></i>
                          </Button>
                          <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => actualizarEstado(p.id_pago, "rechazado")}
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-3">
                  No hay pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}