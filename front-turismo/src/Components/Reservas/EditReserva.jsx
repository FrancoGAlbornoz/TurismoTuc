import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

export default function EditReserva() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reserva, setReserva] = useState({
    id_reserva: "",
    id_excursion: "",
    id_fecha: "",
    dni: "",
    turista: "",
    excursion: "",
    fecha_excursion: "",
    cantidad_personas: 1,
    monto_total: 0,
    estado_reserva: "pendiente",
  });

  const [excursiones, setExcursiones] = useState([]);
  const [fechasExcursion, setFechasExcursion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reservaRes, excursionesRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/reservas/${id}`),
          // 👈 SOLUCIÓN 1: Le pedimos 100 excursiones para que el select esté completo
          axios.get("http://localhost:8000/api/excursiones?limit=100"), 
        ]);

        const reservaData = reservaRes.data;
        setReserva(reservaData);
        
        // 👈 SOLUCIÓN 2: Extraemos el array sin importar si viene paginado o no
        const excurData = excursionesRes.data.data ? excursionesRes.data.data : excursionesRes.data;
        setExcursiones(Array.isArray(excurData) ? excurData : []);

        if (reservaData.id_excursion) {
          const fechasRes = await axios.get(
            `http://localhost:8000/api/excursiones/${reservaData.id_excursion}/fechas`
          );
          setFechasExcursion(fechasRes.data);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudo cargar la reserva o excursiones");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleExcursionChange = async (e) => {
    const id_excursion = e.target.value;
    setReserva((prev) => ({ ...prev, id_excursion, id_fecha: "" }));

    if (id_excursion) {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/excursiones/${id_excursion}/fechas`
        );
        setFechasExcursion(res.data);
      } catch (err) {
        console.error("Error al cargar fechas:", err);
        Swal.fire("Error", "No se pudieron cargar las fechas", "error");
      }
    } else {
      setFechasExcursion([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReserva((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/reservas/${id}`, reserva);
      Swal.fire({
        icon: "success",
        title: "Reserva actualizada",
        text: "Los cambios se guardaron correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/dashboard-admin/reservas");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo actualizar la reserva", "error");
    }
  };

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
          <h4 className="fw-bold text-success mb-4">Editar Reserva</h4>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>DNI del Turista</Form.Label>
              <Form.Control type="text" value={reserva.dni || ""} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre y Apellido</Form.Label>
              <Form.Control type="text" value={reserva.turista || ""} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Excursión</Form.Label>
              <Form.Select
                name="id_excursion"
                value={reserva.id_excursion || ""}
                onChange={handleExcursionChange}
                required
              >
                <option value="">Seleccionar excursión</option>
                {excursiones.map((e) => (
                  <option key={e.id_excursion} value={e.id_excursion}>
                    {e.titulo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de Excursión</Form.Label>
              <Form.Select
                name="id_fecha"
                value={reserva.id_fecha || ""}
                onChange={handleChange}
                required
                disabled={!fechasExcursion.length}
              >
                <option value="">
                  {fechasExcursion.length
                    ? "Seleccionar fecha disponible"
                    : "Seleccione una excursión primero"}
                </option>
                {fechasExcursion.map((f) => (
                  <option
                    key={f.id_fecha}
                    value={f.id_fecha}
                    disabled={f.cupo_disponible <= 0}
                  >
                    {new Date(f.fecha).toLocaleDateString()} —{" "}
                    {f.cupo_disponible > 0
                      ? `Cupo: ${f.cupo_disponible}`
                      : "Sin cupo"}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cantidad de Personas</Form.Label>
                  <Form.Control
                    type="number"
                    name="cantidad_personas"
                    value={reserva.cantidad_personas}
                    onChange={handleChange}
                    min={1}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Monto Total</Form.Label>
                  <Form.Control
                    type="number"
                    name="monto_total"
                    value={reserva.monto_total}
                    onChange={handleChange}
                    step="0.01"
                    min={0}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="estado_reserva"
                value={reserva.estado_reserva}
                onChange={handleChange}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="success">
                Guardar cambios
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}