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

export default function ViewPago() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pago, setPago] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPago = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/pagos");
        const encontrado = res.data.find((p) => p.id_pago === Number(id));
        setPago(encontrado);
      } catch (err) {
        console.error("Error al obtener pago:", err);
        setError("No se pudo cargar la información del pago.");
      }
    };
    fetchPago();
  }, [id]);

  if (error)
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Volver
        </Button>
      </Container>
    );

  if (!pago)
    return (
      <Container className="text-center py-4">
        <Spinner animation="border" variant="success" />
        <div className="mt-2">Cargando información...</div>
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
          <h4 className="fw-bold text-success mb-4">Detalle del Pago</h4>

          <ListGroup variant="flush">
            <ListGroup.Item>
              <strong>ID:</strong> {pago.id_pago}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Turista:</strong> {pago.turista_nombre} {pago.turista_apellido}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Método:</strong> {pago.metodo}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Monto:</strong> ${pago.monto?.toLocaleString("es-AR")}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Estado:</strong> {pago.estado_pago}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Referencia:</strong> {pago.referencia || "—"}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Reserva asociada:</strong> {pago.id_reserva}
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
}