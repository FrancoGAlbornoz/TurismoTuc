import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Row, Col, Button, Card } from "react-bootstrap";

export default function EditTurista() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turista, setTurista] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
    nacionalidad: ""
  });

  useEffect(() => {
    const fetchTurista = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/turistas/${id}`);
        setTurista(res.data);
      } catch (err) {
        console.error("Error al cargar turista:", err);
        Swal.fire("Error", "No se pudo cargar la información del turista.", "error");
      }
    };
    fetchTurista();
  }, [id]);

  const handleChange = (e) => {
    setTurista({ ...turista, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/turistas/${id}`, turista);

      await Swal.fire({
        icon: "success",
        title: "Turista actualizado",
        text: "Los cambios se guardaron correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/dashboard-admin/turistas");
    } catch (err) {
      console.error("Error al actualizar:", err);
      Swal.fire("Error", "No se pudo actualizar el turista.", "error");
    }
  };

  return (
    <div className="container py-4">
                    <div className="col-12 col-md-6 mb-2 mb-md-0">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
          <br />
        </div>
        <br />
      <Card className="shadow-sm">
      <div className="col-12 col-md-6 text-md-end">
              <h4 className="fw-bold text-success mb-0">Editar Turista</h4>
            </div>
        <Card.Body>

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={turista.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={turista.apellido}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>DNI</Form.Label>
                  <Form.Control
                    type="text"
                    name="dni"
                    value={turista.dni || ""}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={turista.email || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={turista.telefono || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={turista.direccion || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Nacionalidad</Form.Label>
              <Form.Control
                type="text"
                name="nacionalidad"
                value={turista.nacionalidad || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="success">
                Guardar cambios
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}