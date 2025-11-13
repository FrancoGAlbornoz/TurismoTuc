import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import useTuristaStore from "../../store/useTuristaStore";

export default function PerfilTurista() {
  const { t } = useTranslation();
  const { turista, token, setTurista } = useTuristaStore();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
    nacionalidad: "",
  });
    const navigate = useNavigate();
  // 🔹 Cargar reservas
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
        setError(t("profile.errors.fetchReservations"));
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [turista, token]);

  // 🔹 Inicializar datos del formulario
  useEffect(() => {
    if (turista) {
      setFormData({
        nombre: turista.nombre || "",
        apellido: turista.apellido || "",
        dni: turista.dni || "",
        email: turista.email || "",
        telefono: turista.telefono || "",
        direccion: turista.direccion || "",
        nacionalidad: turista.nacionalidad || "",
      });
    }
  }, [turista]);

  // 🔹 Cambiar valores del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Guardar cambios
  const handleGuardar = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/turistas/${turista.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTurista(res.data);
      setEditMode(false);
      alert(t("profile.alerts.updated"));
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      alert(t("profile.alerts.updateError"));
    }
  };

  if (!turista) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          {t("profile.errors.notLoggedIn")}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <h2 className="fw-bold text-success mb-4 text-center">
            {t("profile.title")}
          </h2>

          {/* DATOS PERSONALES */}
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="fw-bold text-success mb-3">
                {t("profile.personalData")}
              </h5>

              {editMode ? (
                <>
                  <Form>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("profile.name")}</Form.Label>
                          <Form.Control
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("profile.lastname")}</Form.Label>
                          <Form.Control
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("profile.dni")}</Form.Label>
                          <Form.Control
                            name="dni"
                            value={formData.dni}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("profile.email")}</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("profile.phone")}</Form.Label>
                          <Form.Control
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("profile.address")}</Form.Label>
                          <Form.Control
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("profile.nationality")}</Form.Label>
                          <Form.Control
                            name="nacionalidad"
                            value={formData.nacionalidad}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  <div className="d-flex gap-2 mt-3">
                    <Button variant="success" onClick={handleGuardar}>
                      {t("profile.save")}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setEditMode(false)}
                    >
                      {t("profile.cancel")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>{t("profile.name")}:</strong> {turista.nombre}{" "}
                        {turista.apellido}
                      </p>
                      <p>
                        <strong>{t("profile.dni")}:</strong> {turista.dni}
                      </p>
                      <p>
                        <strong>{t("profile.email")}:</strong> {turista.email}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>{t("profile.phone")}:</strong> {turista.telefono}
                      </p>
                      <p>
                        <strong>{t("profile.address")}:</strong>{" "}
                        {turista.direccion}
                      </p>
                      <p>
                        <strong>{t("profile.nationality")}:</strong>{" "}
                        {turista.nacionalidad}
                      </p>
                    </Col>
                  </Row>
                  <Button
                    variant="outline-success"
                    onClick={() => setEditMode(true)}
                  >
                    {t("profile.edit")}
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>

          {/* RESERVAS */}
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-bold text-success mb-3">
                {t("profile.reservations")}
              </h5>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : reservas.length === 0 ? (
                <p className="text-muted">{t("profile.noReservations")}</p>
              ) : (
                reservas.map((r) => (
                  <div key={r.id_reserva} className="border rounded p-3 mb-3">
                    <h6 className="fw-bold">{r.excursion}</h6>
                    <p className="mb-1">
                      <strong>{t("profile.location")}:</strong> {r.ubicacion}
                    </p>
                    <p className="mb-1">
                      <strong>{t("profile.departureDate")}:</strong>{" "}
                      {r.fecha_salida} - {r.hora_salida}
                    </p>
                    <p className="mb-1">
                      <strong>{t("profile.people")}:</strong>{" "}
                      {r.cantidad_personas}
                    </p>
                    <p className="mb-1">
                      <strong>{t("profile.totalAmount")}:</strong> ${r.monto_total}
                    </p>

                    <p className="mb-2">
                      <strong>{t("profile.status")}:</strong>{" "}
                      <span
                        className={
                          r.estado_reserva === "confirmada"
                            ? "text-success fw-semibold"
                            : r.estado_reserva === "pendiente"
                            ? "text-warning fw-semibold"
                            : r.estado_reserva === "finalizada"
                            ? "text-danger fw-semibold"
                            : "text-secondary fw-semibold"
                        }
                      >
                        {t(`profile.statuses.${r.estado_reserva}`)}
                      </span>
                    </p>

                    {r.estado_reserva === "finalizada" && (
                      <div className="mt-2 text-center">
                        <p className="fw-semibold text-success mb-2">
                          {t("profile.ratePrompt")}
                        </p>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => navigate(`/calificar/${r.id_reserva}`)}
                        >
                          {t("profile.rateButton")}
                        </Button>
                      </div>
                    )}
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
