import { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/usuarios/forgot-password`, { email });
      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Revisá tu bandeja de entrada para cambiar tu contraseña.",
      });
      setEmail("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo enviar el correo.");
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
              <h4 className="text-center text-success fw-bold mb-4">Recuperar contraseña</h4>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Ingresá tu email registrado"
                  />
                </Form.Group>
                <Button type="submit" variant="success" className="w-100" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar enlace de recuperación"
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