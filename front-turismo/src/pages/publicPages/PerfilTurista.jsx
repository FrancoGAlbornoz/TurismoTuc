import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Button } from "react-bootstrap";
import axios from "axios";
import useTuristaStore from "../../store/useTuristaStore";

export default function PerfilTurista() {
  const { turista, token } = useTuristaStore();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservas = async () => {
      if (!turista) return;
      try {
        const res = await axios.get(
          `http://localhost:8000/api/turistas/${turista.id}/reservas`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReservas(res.data);
      } catch (err) {
        console.error("Error al obtener reservas:", err);
        setError("No se pudieron cargar tus reservas.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [turista, token]);

  if (!turista) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          Debés iniciar sesión para acceder a tu perfil.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <h2 className="fw-bold text-success mb-4 text-center">Mi Perfil</h2>

          {/* Datos personales */}
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="fw-bold text-success mb-3">Datos personales</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Nombre:</strong> {turista.nombre} {turista.apellido}</p>
                  <p><strong>DNI:</strong> {turista.dni}</p>
                  <p><strong>Email:</strong> {turista.email}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Teléfono:</strong> {turista.telefono}</p>
                  <p><strong>Dirección:</strong> {turista.direccion}</p>
                  <p><strong>Nacionalidad:</strong> {turista.nacionalidad}</p>
                </Col>
              </Row>
              <Button variant="outline-success" disabled>
                Editar datos (próximamente)
              </Button>
            </Card.Body>
          </Card>

          {/* Reservas */}
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-bold text-success mb-3">Mis reservas</h5>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : reservas.length === 0 ? (
                <p className="text-muted">No tenés reservas registradas.</p>
              ) : (
                reservas.map((r) => (
                  <div key={r.id_reserva} className="border rounded p-3 mb-3">
                    <h6 className="fw-bold">{r.excursion}</h6>
                    <p className="mb-1">
                      <strong>Ubicación:</strong> {r.ubicacion}
                    </p>
                    <p className="mb-1">
                      <strong>Fecha de salida:</strong> {r.fecha_salida} - {r.hora_salida}
                    </p>
                    <p className="mb-1">
                      <strong>Cantidad de personas:</strong> {r.cantidad_personas}
                    </p>
                    <p className="mb-1">
                      <strong>Monto total:</strong> ${r.monto_total}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      <span
                        className={
                          r.estado_reserva === "confirmada"
                            ? "text-success fw-semibold"
                            : r.estado_reserva === "pendiente"
                            ? "text-warning fw-semibold"
                            : "text-danger fw-semibold"
                        }
                      >
                        {r.estado_reserva}
                      </span>
                    </p>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
