import { useState } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPen,
  FaCommentDots,
  FaPaperPlane,
} from "react-icons/fa";

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });

  const [errors, setErrors] = useState({
    nombre: false,
    email: false,
    asunto: false,
    mensaje: false,
  });

  const validateField = (name, value) => {
    switch (name) {
      case "nombre":
        return value.trim().length > 0 && value.length <= 100;
      case "email":
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) && value.length <= 100;
      case "asunto":
        return value.trim().length > 0 && value.length <= 150;
      case "mensaje":
        return value.trim().length > 0 && value.length <= 1000;
      default:
        return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: !validateField(name, value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      nombre: !validateField("nombre", form.nombre),
      email: !validateField("email", form.email),
      asunto: !validateField("asunto", form.asunto),
      mensaje: !validateField("mensaje", form.mensaje),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err);
    if (hasErrors) {
      Swal.fire({
        icon: "warning",
        title: "Formulario incompleto",
        text: "Por favor completá todos los campos correctamente.",
      });
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/contacto", form);
      Swal.fire({
        icon: "success",
        title: "Mensaje enviado",
        text: "Gracias por contactarnos. Te responderemos pronto.",
      });
      setForm({ nombre: "", email: "", asunto: "", mensaje: "" });
      setErrors({ nombre: false, email: false, asunto: false, mensaje: false });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "No se pudo enviar el mensaje. Intentalo más tarde.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    }
  };

  return (
    <div className="container py-5">
      <Card className="shadow-sm border-0 rounded-4 p-4">
        <h4 className="fw-bold mb-4 text-center">📬 Contactanos</h4>
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="gy-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <FaUser className="me-2" /> Nombre
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  maxLength={100}
                  isInvalid={errors.nombre}
                  isValid={form.nombre && !errors.nombre}
                  placeholder="Tu nombre completo"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El nombre es obligatorio y debe tener menos de 100 caracteres.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <FaEnvelope className="me-2" /> Email
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={100}
                  isInvalid={errors.email}
                  isValid={form.email && !errors.email}
                  placeholder="ejemplo@correo.com"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Ingresá un email válido (máx. 100 caracteres).
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  <FaPen className="me-2" /> Asunto
                </Form.Label>
                <Form.Control
                  type="text"
                  name="asunto"
                  value={form.asunto}
                  onChange={handleChange}
                  maxLength={150}
                  isInvalid={errors.asunto}
                  isValid={form.asunto && !errors.asunto}
                  placeholder="¿Sobre qué querés consultarnos?"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El asunto es obligatorio (máx. 150 caracteres).
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  <FaCommentDots className="me-2" /> Mensaje
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  maxLength={1000}
                  isInvalid={errors.mensaje}
                  isValid={form.mensaje && !errors.mensaje}
                  placeholder="Escribí tu consulta o comentario..."
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El mensaje es obligatorio (máx. 1000 caracteres).
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} className="text-center mt-4">
              <Button variant="success" type="submit" className="px-4 fw-semibold">
                <FaPaperPlane className="me-2" />
                Enviar mensaje
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}