import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditUsuario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    id_rol: "",
    estado: "activo",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/usuarios/${id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/usuarios/roles`),
        ]);

        setForm({
          nombre: userRes.data.nombre,
          apellido: userRes.data.apellido,
          email: userRes.data.email,
          telefono: userRes.data.telefono,
          id_rol:
            rolesRes.data.find((r) => r.nombre_rol === userRes.data.nombre_rol)
              ?.id_rol || "",
          estado: userRes.data.estado || "activo",
        });

        setRoles(rolesRes.data);
      } catch (err) {
        console.error("Error al cargar usuario:", err);
        setError("No se pudo cargar la información del usuario.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/usuarios/${id}`, form);
      setMessage("✅ Usuario actualizado correctamente.");
      setTimeout(() => navigate("/dashboard-admin/usuarios"), 1500);
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setError("No se pudo actualizar el usuario.");
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <div className="mt-2">Cargando datos del usuario...</div>
      </Container>
    );
  }

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
            <h4 className="fw-bold text-success mb-0">Editar Usuario</h4>
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
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={form.telefono || ""}
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
                    {roles.map((r) => (
                      <option key={r.id_rol} value={r.id_rol}>
                        {r.nombre_rol}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button type="submit" variant="primary">
                Guardar Cambios
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}