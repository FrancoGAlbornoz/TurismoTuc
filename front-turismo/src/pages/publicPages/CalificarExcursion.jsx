import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import useTuristaStore from "../../store/useTuristaStore";

export default function CalificarExcursion() {
  const { id_reserva } = useParams();
  const { turista, token } = useTuristaStore();

  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [archivo, setArchivo] = useState(null);          // NUEVO: archivo de imagen
  const [enviando, setEnviando] = useState(false);       // NUEVO: loading general

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (puntuacion === 0) {
      Swal.fire({
        icon: "warning",
        title: "Seleccioná una puntuación",
        text: "Debés elegir entre 1 y 5 estrellas para calificar.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    try {
      setEnviando(true);

      // 1) Crear reseña
      const res = await axios.post(
        "http://localhost:8000/api/resenias",
        {
          id_reserva,
          id_turista: turista.id,
          puntuacion,
          comentario,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Asegurate que el backend devuelva el ID de la reseña.
      // Ajustá esta línea si tu backend responde con otra key.
      const id_resenia =
        res.data.id_resenia || res.data.id || res.data.resenia?.id_resenia;

      // 2) Si hay archivo y tenemos id_resenia, subir imagen
      if (archivo && id_resenia) {
        const formData = new FormData();
        formData.append("imagen", archivo);
        formData.append("id_turista", turista.id);

        await axios.post(
          `http://localhost:8000/api/resenas/${id_resenia}/imagen`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // 🎉 Alert bonito de éxito
      Swal.fire({
        icon: "success",
        title: "¡Gracias por calificarnos! 🥳",
        text: archivo
          ? "Tu reseña y tu foto se enviaron correctamente. La foto quedará pendiente de moderación."
          : "Tu reseña se envió correctamente.",
        confirmButtonText: "Volver al perfil",
        confirmButtonColor: "#198754",
      }).then(() => {
        navigate("/perfil-turista");
      });
    } catch (err) {
      console.error(err);

      // ⚠️ Alert elegante de error
      if (err.response?.data?.message?.includes("Ya realizaste una reseña")) {
        Swal.fire({
          icon: "info",
          title: "Ya calificaste esta excursión",
          text: "Solo se permite una reseña por reserva.",
          confirmButtonColor: "#198754",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al enviar reseña",
          text:
            err.response?.data?.message ||
            "Ocurrió un error inesperado. Intentá nuevamente.",
          confirmButtonColor: "#198754",
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  // 🔹 Renderizado de las estrellas
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            cursor: "pointer",
            color: i <= puntuacion ? "#ffc107" : "#ccc",
            fontSize: "1.8rem",
          }}
          onClick={() => setPuntuacion(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
        <Card.Body>
          <h3 className="fw-bold text-success text-center mb-4">
            Calificar Excursión
          </h3>

          <Form onSubmit={handleSubmit}>
            <div className="text-center mb-3">{renderStars()}</div>

            <Form.Group className="mb-3">
              <Form.Label>Comentario (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Contanos tu experiencia..."
              />
            </Form.Group>

            {/* NUEVO: subir foto opcional */}
            <Form.Group className="mb-3">
              <Form.Label>Foto de tu experiencia (opcional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setArchivo(e.target.files[0] || null)}
              />
              <Form.Text className="text-muted">
                Podés subir una foto de la excursión. Será revisada antes de
                publicarse.
              </Form.Text>
            </Form.Group>

            <Button
              variant="success"
              type="submit"
              className="w-100"
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar reseña"}
            </Button>

            <Button
              variant="outline-secondary"
              className="w-100 mt-2"
              onClick={() => navigate("/perfil-turista")}
              disabled={enviando}
            >
              Volver al perfil
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
