import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

export default function CreateUsuario() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    id_rol: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/usuarios/roles`);
        setRoles(res.data);
      } catch (err) {
        console.error("Error al cargar roles:", err);
        setError("No se pudieron cargar los roles.");
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/usuarios`, form);
      setMessage("✅ Usuario creado exitosamente.");
      setTimeout(() => navigate("/dashboard-admin/usuarios"), 1500);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      setError("No se pudo crear el usuario. Verifica los datos.");
    }
  };

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
          <div className="d-flex justify-content-between align-items-center mb-3">

            <h4 className="fw-bold text-success mb-0">Crear Nuevo Usuario</h4>
          </div>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    name="id_rol"
                    value={form.id_rol}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar rol...</option>
                    {roles.length > 0 ? (
                      roles.map((r) => (
                        <option key={r.id_rol} value={r.id_rol}>
                          {r.nombre_rol}
                        </option>
                      ))
                    ) : (
                      <option disabled>Cargando roles...</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button type="submit" variant="success">
                Guardar Usuario
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}