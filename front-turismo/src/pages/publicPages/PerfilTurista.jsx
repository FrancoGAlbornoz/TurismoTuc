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
  Table,
  Badge
} from "react-bootstrap";
import Swal from "sweetalert2";
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

  useEffect(() => {
    const fetchReservas = async () => {
      if (!turista) return;
      try {
        const res = await axios.get(
          `http://localhost:8000/api/turistas/${turista.id}/reservas`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const data = res.data || [];
        
        // Ordenamos: más recientes primero y máximo 10
        const procesadas = data
          .sort((a, b) => b.id_reserva - a.id_reserva)
          .slice(0, 10);
          
        setReservas(procesadas);
      } catch (err) {
        console.error("Error al cargar reservas:", err);
        setError("No se pudieron cargar tus reservas.");
      } finally {
        setLoading(false);
      }
    };

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
      fetchReservas();
    }
  }, [turista, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:8000/api/turistas/${turista.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTurista(res.data.turista);
      setEditMode(false);
      Swal.fire("¡Éxito!", "Tus datos han sido actualizados.", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar el perfil.", "error");
    }
  };

  if (loading) return (
    <div className="text-center mt-5">
      <Spinner animation="border" variant="success" />
      <p className="mt-2 text-success">Cargando tu perfil...</p>
    </div>
  );

  return (
    <Container className="py-5">
      {/* Título Principal Personalizado */}
      <div className="mb-5">
        <h2 className="fw-bold text-success display-6 mb-1">
          ¡Hola, {turista.nombre}! 👋
        </h2>
        <p className="text-muted fs-5">
          Gestioná tu información y revisá tus últimas aventuras.
        </p>
      </div>

      <Row>
        {/* Columna Izquierda: Mis Datos */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-success mb-0">
                  <i className="bi bi-person-lines-fill me-2"></i>Mis Datos
                </h5>
                {!editMode && (
                  <Button variant="outline-success" size="sm" onClick={() => setEditMode(true)}>
                    <i className="bi bi-pencil-square"></i> Editar
                  </Button>
                )}
              </div>

              {editMode ? (
                <Form onSubmit={handleUpdate}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">Nombre</Form.Label>
                    <Form.Control 
                      size="sm" 
                      value={formData.nombre} 
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">Apellido</Form.Label>
                    <Form.Control 
                      size="sm" 
                      value={formData.apellido} 
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})} 
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Teléfono</Form.Label>
                    <Form.Control 
                      size="sm" 
                      value={formData.telefono} 
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                    />
                  </Form.Group>
                  <div className="d-grid gap-2">
                    <Button variant="success" size="sm" type="submit">Guardar Cambios</Button>
                    <Button variant="light" size="sm" onClick={() => setEditMode(false)}>Cancelar</Button>
                  </div>
                </Form>
              ) : (
                <div className="text-dark">
                  <p className="mb-2"><strong>Nombre:</strong> {turista.nombre} {turista.apellido}</p>
                  <p className="mb-2"><strong>Email:</strong> {turista.email}</p>
                  <p className="mb-0"><strong>Teléfono:</strong> {turista.telefono || "-"}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Derecha: Tabla de Reservas */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-success">
                <i className="bi bi-journal-check me-2"></i>Mis Reservas
              </h5>
              <Badge bg="success" pill>Últimas 10</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {error && <Alert variant="danger" className="m-3">{error}</Alert>}
              
              {reservas.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Aún no tienes reservas realizadas.</p>
                </div>
              ) : (
                <Table hover responsive className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3 text-success">Excursión</th>
                      <th className="text-success">Fecha de excursión</th>
                      <th className="text-success">Estado</th>
                      <th className="text-center text-success">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map((r) => (
                      <tr key={r.id_reserva}>
                        <td className="ps-3 py-3">
                          <div className="fw-bold">{r.excursion_nombre}</div>
                          <small className="text-muted">{r.cantidad_personas} personas</small>
                        </td>
                        <td>
                          {new Date(r.fecha_salida).toLocaleDateString("es-AR")}
                        </td>
                        <td>
                          <Badge 
                            bg={
                              r.estado_reserva === "confirmada" ? "success" :
                              r.estado_reserva === "pendiente" ? "warning text-dark" :
                              r.estado_reserva === "finalizada" ? "primary" : "secondary"
                            }
                          >
                            {r.estado_reserva.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="text-center">
                          {r.estado_reserva === "finalizada" && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="rounded-pill"
                              onClick={() => navigate(`/calificar/${r.id_reserva}`)}
                            >
                              <i className="bi bi-star-fill me-1"></i> Calificar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}