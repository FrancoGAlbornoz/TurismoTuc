import { useState } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
        title: t("contactUs.alert.incompleteTitle"),
        text: t("contactUs.alert.incompleteText"),
      });
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/contacto", form);
      Swal.fire({
        icon: "success",
        title: t("contactUs.alert.successTitle"),
        text: t("contactUs.alert.successText"),
      });
      setForm({ nombre: "", email: "", asunto: "", mensaje: "" });
      setErrors({ nombre: false, email: false, asunto: false, mensaje: false });
    } catch (error) {
      console.error("Error al enviar contacto:", error.message, error.stack);
      const msg =
        error?.response?.data?.message ||
        t("contactUs.alert.errorText");
      Swal.fire({
        icon: "error",
        title: t("contactUs.alert.errorTitle"),
        text: msg,
      });
    }
  };

  return (
    <div className="container py-5">
      <Card className="shadow-sm border-0 rounded-4 p-4">
        <h4 className="fw-bold mb-4 text-center">{t("contactUs.title")}</h4>

        <Form noValidate  onSubmit={handleSubmit}>
          <Row className="gy-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <FaUser className="me-2" /> {t("contactUs.name")}
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  onChange={handleChange}
                  placeholder={t("contactUs.placeholder.name")}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  <FaEnvelope className="me-2" /> {t("contactUs.email")}
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder={t("contactUs.placeholder.email")}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  <FaPen className="me-2" /> {t("contactUs.subject")}
                </Form.Label>
                <Form.Control
                  type="text"
                  name="asunto"
                  onChange={handleChange}
                  placeholder={t("contactUs.placeholder.subject")}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>
                  <FaCommentDots className="me-2" /> {t("contactUs.message")}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="mensaje"
                  onChange={handleChange}
                  placeholder={t("contactUs.placeholder.message")}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} className="text-center mt-4">
              <Button variant="success" type="submit" className="px-4 fw-semibold">
                <FaPaperPlane className="me-2" />
                {t("contactUs.message")}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}