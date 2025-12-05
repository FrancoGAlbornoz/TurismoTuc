import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import "../../styles/components/login.css";

export default function RegisterTurista() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    password: "",
    telefono: "",
    direccion: "",
    nacionalidad: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🧠 Validar el campo DNI
    if (name === "dni") {
      // Solo permitir números
      const numericValue = value.replace(/\D/g, "");

      // Limitar a 8 caracteres
      if (numericValue.length > 8) return;

      setFormData({ ...formData, dni: numericValue });
      return;
    }

    // 🧠 Validar teléfono solo números (opcional)
    if (name === "telefono") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, telefono: numericValue });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validación extra del DNI antes de enviar
    if (formData.dni.length < 7 || formData.dni.length > 9) {
      setError("El DNI debe tener entre 7 y 8 dígitos.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/auth/turistas/register", formData);
      if (res.status === 201) {
        setSuccess("Cuenta creada correctamente. Ya podés iniciar sesión.");
        setTimeout(() => navigate("/login-turista"), 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al registrarse.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="p-0" style={{ overflow: "hidden" }}>
      <div className="login-page">
        <Row className="justify-content-center w-100">
          <Col xs={12} md={7} lg={5}>
            <Card className="shadow">
              <Card.Body className="p-4">
                <div className="brand mb-3 text-center">
                  <span className="brand-dot"></span>
                  <h1>{t("registerTurista.title")}</h1>
                </div>
                <h4 className="text-center text-success fw-bold mb-4">{t("registerTurista.subtitle")}</h4>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t("registerTurista.name")}</Form.Label>
                        <Form.Control
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t("registerTurista.lastname")}</Form.Label>
                        <Form.Control
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t("registerTurista.dni")}</Form.Label>
                        <Form.Control
                          name="dni"
                          value={formData.dni}
                          onChange={handleChange}
                          maxLength={8}
                          inputMode="numeric"
                          placeholder={t("registerTurista.dniPlaceholder")}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t("registerTurista.nationality")}</Form.Label>
                        <Form.Control
                          name="nacionalidad"
                          value={formData.nacionalidad}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>{t("registerTurista.email")}</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t("registerTurista.password")}</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t("registerTurista.phone")}</Form.Label>
                    <Form.Control
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder={t("registerTurista.phonePlaceholder")}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t("registerTurista.address")}</Form.Label>
                    <Form.Control
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="success" className="w-100" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" /> {t("registerTurista.loading")}
                      </>
                    ) : (
                      t("registerTurista.button")
                    )}
                  </Button>

                  <div className="text-center mt-3">
                    <small>{t("registerTurista.haveAccount")}</small>
                    <br />
                    <Button
                      variant="link"
                      className="text-success fw-semibold p-0"
                      onClick={() => navigate("/login-turista")}
                    >
                      {t("registerTurista.login")}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
