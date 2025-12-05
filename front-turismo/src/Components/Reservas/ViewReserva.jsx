import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Card,
  ListGroup,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";

export default function ViewReserva() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reserva, setReserva] = useState(null);
  const [respuestas, setRespuestas] = useState([]); // ← respuestas personalizadas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Cargar la reserva
        const res = await axios.get(`http://localhost:8000/api/reservas/${id}`);
        setReserva(res.data);

        // 2️⃣ Cargar respuestas personalizadas
        const resp = await axios.get(
          `http://localhost:8000/api/personalizacion/reserva/${id}`
        );
        setRespuestas(resp.data || []);

      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la reserva");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <Container className="text-center py-4">
        <Spinner animation="border" variant="success" />
        <div className="mt-2">Cargando reserva...</div>
      </Container>
    );

  if (error)
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Volver
        </Button>
      </Container>
    );

  if (!reserva)
    return (
      <Container className="py-4">
        <Alert variant="warning">Reserva no encontrada</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Volver
        </Button>
      </Container>
    );

  return (
    <Container className="py-4">
      <div className="col-12 col-md-6 mb-2 mb-md-0">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
          ← Volver
        </Button>
        <br />
      </div>
      <br />

      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="fw-bold text-success mb-4">Detalle de Reserva</h4>

          <ListGroup variant="flush">
            <ListGroup.Item><strong>ID:</strong> {reserva.id_reserva}</ListGroup.Item>
            <ListGroup.Item><strong>Turista:</strong> {reserva.turista}</ListGroup.Item>
            <ListGroup.Item><strong>Excursión:</strong> {reserva.excursion}</ListGroup.Item>
            <ListGroup.Item>
              <strong>Fecha Excursión:</strong>{" "}
              {new Date(reserva.fecha_excursion).toLocaleDateString()}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Cantidad de Personas:</strong> {reserva.cantidad_personas}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Monto Total:</strong> ${parseFloat(reserva.monto_total).toFixed(2)}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Estado:</strong> {reserva.estado_reserva}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Fecha de Reserva:</strong>{" "}
              {new Date(reserva.fecha_reserva).toLocaleDateString()}
            </ListGroup.Item>
          </ListGroup>

          {/* 🔥 SECCIÓN DE RESPUESTAS PERSONALIZADAS */}
          <hr className="my-4" />

          <h5 className="fw-bold text-primary mb-3">Preguntas Respondidas</h5>

          {respuestas.length === 0 ? (
            <p className="text-muted">El turista no completó preguntas personalizadas.</p>
          ) : (
            <ListGroup variant="flush">
              {respuestas.map((r) => (
                <ListGroup.Item key={r.id_respuesta}>
                  <strong>{r.texto_pregunta}:</strong> {r.valor_respuesta || "—"}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
