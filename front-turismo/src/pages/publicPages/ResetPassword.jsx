import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await axios.post(`http://localhost:8000/api/usuarios/reset-password/${token}`, {
        nuevaPassword,
      });
      Swal.fire({
        icon: "success",
        title: "Contraseña actualizada",
        text: "Ya podés iniciar sesión con tu nueva contraseña.",
      });
      navigate("/login-turista");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h4 className="text-center text-success fw-bold mb-4">Nueva contraseña</h4>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña nueva</Form.Label>
                  <Form.Control
                    type="password"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    required
                    placeholder="Ingresá tu nueva contraseña"
                  />
                </Form.Group>
                <Button type="submit" variant="success" className="w-100" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Guardando...
                    </>
                  ) : (
                    "Actualizar contraseña"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}