import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Card,
  Form,
  Button,
  Spinner,
  Row,
  Col,
  Container,
} from "react-bootstrap";

export default function CreateReserva() {
  const navigate = useNavigate();

  const [excursiones, setExcursiones] = useState([]);
  const [fechasExcursion, setFechasExcursion] = useState([]);
  const [nombreTurista, setNombreTurista] = useState("");

  const [reserva, setReserva] = useState({
    id_turista: "",
    id_fecha: "",
    dni: "",
    cantidad_personas: 1,
    estado_reserva: "pendiente",
    id_excursion: "",
  });

  const [saving, setSaving] = useState(false);

  // Cargar excursiones al iniciar
  useEffect(() => {
    const fetchExcursiones = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/excursiones`);
        setExcursiones(res.data.data || []);
      } catch (err) {
        console.error("Error cargando excursiones:", err);
        Swal.fire("Error", "No se pudieron cargar las excursiones", "error");
      }
    };
    fetchExcursiones();
  }, []);

  // Buscar turista exacto por DNI usando backend
  const buscarTuristaPorDNI = async () => {
    const dni = reserva.dni.trim();
    if (!dni) return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/turistas/exacto?dni=${dni}`);
      const turista = res.data; // backend debe devolver el objeto exacto o null/undefined

      if (turista) {
        setNombreTurista(turista.nombre_completo);
        setReserva(prev => ({ ...prev, id_turista: turista.id_turista }));
      } else {
        setNombreTurista("");
        setReserva(prev => ({ ...prev, id_turista: "" }));
        Swal.fire("Atención", "No se encontró un turista con ese DNI", "warning");
      }
    } catch (err) {
      console.error("Error buscando turista por DNI:", err);
      setNombreTurista("");
      setReserva(prev => ({ ...prev, id_turista: "" }));
      Swal.fire("Error", "No se pudo buscar el turista", "error");
    }
  };

  const handleExcursionChange = async (e) => {
    const id_excursion = e.target.value;
    setReserva(prev => ({ ...prev, id_excursion, id_fecha: "" }));

    if (id_excursion) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/excursiones/${id_excursion}/fechas`
        );
        setFechasExcursion(Array.isArray(res.data) ? res.data : []);
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
    setReserva(prev => ({
      ...prev,
      [name]: name === "cantidad_personas" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reserva.id_turista || !reserva.id_fecha) {
      Swal.fire("Atención", "Debe seleccionar un turista y una fecha", "warning");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reservas`, reserva);
      Swal.fire({
        icon: "success",
        title: "Reserva creada",
        text: "La reserva fue registrada correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/dashboard-admin/reservas");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo crear la reserva", "error");
    } finally {
      setSaving(false);
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
          <h4 className="fw-bold text-success mb-4">Crear Nueva Reserva</h4>
          <h5 className="mb-4">Datos del Turista - Recordar solicitar al turista que se registre o inicie sesión. </h5>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>DNI del Turista</Form.Label>
              <Form.Control
                type="text"
                name="dni"
                value={reserva.dni || ""}
                onChange={handleChange}
                onKeyDown={(e) => { if (e.key === "Enter") buscarTuristaPorDNI(); }}
                onBlur={buscarTuristaPorDNI}
                placeholder="Ingrese DNI del turista"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre y Apellido</Form.Label>
              <Form.Control
                type="text"
                value={nombreTurista || ""}
                readOnly
                placeholder="Se completa automáticamente"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Excursión</Form.Label>
              <Form.Select
                name="id_excursion"
                value={reserva.id_excursion}
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
                value={reserva.id_fecha}
                onChange={handleChange}
                required
                disabled={!fechasExcursion.length}
              >
                <option value="">
                  {fechasExcursion.length
                    ? "Seleccionar fecha disponible"
                    : "No hay fechas disponibles / Seleccione una excursión primero "}
                </option>
                {fechasExcursion.map((f) => (
                  <option
                    key={f.id_fecha}
                    value={f.id_fecha}
                    disabled={f.cupo_disponible <= 0}
                  >
                    {new Date(f.fecha).toLocaleDateString()} —{" "}
                    {f.cupo_disponible > 0
                      ? `Cupo disponible: ${f.cupo_disponible}`
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
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado_reserva"
                    value={reserva.estado_reserva}
                    onChange={handleChange}
                    required
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="success" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  "Crear Reserva"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
