import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Card, Form, Button, Spinner, Row, Col } from "react-bootstrap";

export default function FechasEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [excursiones, setExcursiones] = useState([]);
  const [form, setForm] = useState({
    id_excursion: "",
    fecha: "",
    hora_salida: "",
    cupo_maximo: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchExcursiones = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/excursiones");
      setExcursiones(res.data);
    } catch (err) {
      console.error("Error al cargar excursiones:", err);
      Swal.fire("Error", "No se pudieron cargar las excursiones.", "error");
    }
  };

  const fetchFecha = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/excursiones/fechas/${id}`);
      const { id_excursion, fecha, hora_salida, cupo_maximo } = res.data;
      setForm({
        id_excursion,
        fecha: fecha.slice(0, 10),
        hora_salida: hora_salida?.slice(0, 5),
        cupo_maximo,
      });
    } catch (err) {
      console.error("Error al cargar fecha:", err);
      Swal.fire("Error", "No se pudo cargar la fecha.", "error");
    }
  };

  useEffect(() => {
    fetchExcursiones();
    fetchFecha();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.put(`http://localhost:8000/api/excursiones/fechas/${id}`, form);

      await Swal.fire({
        icon: "success",
        title: "Fecha actualizada",
        text: res.data.message || "Los cambios se guardaron correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/dashboard-admin/fechas");
    } catch (err) {
      console.error("Error al actualizar fecha:", err);
      Swal.fire("Error", err.response?.data?.message || "No se pudo actualizar la fecha.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <h5 className="fw-bold text-primary mb-2 mb-md-0">Editar Fecha de Excursión</h5>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
              ← Cancelar
            </Button>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Excursión</Form.Label>
              <Form.Select
                name="id_excursion"
                value={form.id_excursion}
                onChange={handleChange}
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

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Hora de salida</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora_salida"
                    value={form.hora_salida}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Cupo máximo</Form.Label>
              <Form.Control
                type="number"
                name="cupo_maximo"
                value={form.cupo_maximo}
                onChange={handleChange}
                required
                min={1}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : "Actualizar Fecha"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}