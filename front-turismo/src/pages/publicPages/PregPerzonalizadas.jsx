import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
import useTuristaStore from "../../store/useTuristaStore";

export default function PreguntasPersonalizadas() {
  const { id_reserva, id_excursion } = useParams();
  const { token } = useTuristaStore();
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/personalizacion/excursion/${id_excursion}`
        );
        setPreguntas(res.data);
      } catch (err) {
        console.error("Error al traer preguntas:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las preguntas personalizadas.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPreguntas();
  }, [id_excursion]);

  const handleChange = (id_pregunta, valor) => {
    setRespuestas((prev) => ({ ...prev, [id_pregunta]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = Object.entries(respuestas).map(([id_pregunta, valor_respuesta]) => ({
      id_reserva,
      id_pregunta,
      valor_respuesta,
    }));

    try {
      await axios.post("http://localhost:8000/api/personalizacion/reserva", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "¡Gracias!",
        text: "Tus respuestas fueron guardadas correctamente.",
        confirmButtonColor: "#3085d6",
      }).then(() => navigate("/perfil"));
    } catch (err) {
      console.error("Error al guardar respuestas:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar tus respuestas.",
      });
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (!preguntas.length)
    return (
      <Container className="text-center mt-5">
        <h4>No hay preguntas personalizadas para esta excursión.</h4>
      </Container>
    );

  return (
    <Container className="my-5">
      <Card className="shadow p-4">
        <h3 className="mb-4 text-center text-primary">Personalización de tu Excursión</h3>
        <Form onSubmit={handleSubmit}>
          {preguntas.map((p) => (
            <Form.Group key={p.id_pregunta} className="mb-3">
              <Form.Label>{p.texto_pregunta}</Form.Label>
              {p.tipo_respuesta === "checkbox" && (
                <Form.Check
                  type="checkbox"
                  label="Sí"
                  onChange={(e) =>
                    handleChange(p.id_pregunta, e.target.checked ? "Sí" : "No")
                  }
                />
              )}
              {p.tipo_respuesta === "texto" && (
                <Form.Control
                  type="text"
                  placeholder="Escribí tu respuesta..."
                  onChange={(e) => handleChange(p.id_pregunta, e.target.value)}
                />
              )}
              {p.tipo_respuesta === "select" && (
                <Form.Select onChange={(e) => handleChange(p.id_pregunta, e.target.value)}>
                  <option value="">Seleccioná una opción</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="No aplica">No aplica</option>
                </Form.Select>
              )}
            </Form.Group>
          ))}

          <div className="text-center mt-4">
            <Button type="submit" variant="success">
              Guardar respuestas
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
