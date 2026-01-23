import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // CAMBIO: Usamos useLocation
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
import useTuristaStore from "../../store/useTuristaStore";

export default function PreguntasPersonalizadas() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useTuristaStore();

  // Recibimos las reservas del paso anterior (Checkout)
  const reservasRealizadas = location.state?.reservasRealizadas || [];

  const [datosCompletos, setDatosCompletos] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay reservas (ej: recarga de página), redirigir al perfil
    if (reservasRealizadas.length === 0) {
      setLoading(false);
      return;
    }

    const fetchPreguntasMultiples = async () => {
      try {
        // Pedimos preguntas para cada excursión en paralelo
        const promesas = reservasRealizadas.map(async (reserva) => {
          const res = await axios.get(`http://localhost:8000/api/personalizacion/excursion/${reserva.id_excursion}`);
          return {
            ...reserva, // id_reserva, nombre_excursion
            preguntas: res.data // Array de preguntas
          };
        });

        const resultados = await Promise.all(promesas);
        
        // Filtramos: solo nos interesan las que tienen preguntas configuradas
        setDatosCompletos(resultados.filter(r => r.preguntas && r.preguntas.length > 0));

      } catch (err) {
        console.error("Error al traer preguntas:", err);
        Swal.fire("Error", "No se pudieron cargar las preguntas.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPreguntasMultiples();
  }, [reservasRealizadas]);

  const handleChange = (idReserva, idPregunta, valor) => {
    // Clave compuesta para no mezclar respuestas entre excursiones
    setRespuestas((prev) => ({ ...prev, [`${idReserva}-${idPregunta}`]: valor }));
  };

  const handleGuardarTodo = async () => {
    try {
      // Preparamos los datos para tu nuevo controlador "guardarRespuestas" (formato bloques)
      const bloques = datosCompletos.map(grupo => ({
        id_reserva: grupo.id_reserva,
        respuestas: grupo.preguntas.map(p => ({
          id_pregunta: p.id_pregunta,
          valor_respuesta: respuestas[`${grupo.id_reserva}-${p.id_pregunta}`] || ""
        }))
      }));

      // Enviamos todo en una sola petición
      await axios.post("http://localhost:8000/api/personalizacion/respuestas", 
        { bloques },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: "¡Todo listo!",
        text: "Tus respuestas y reservas se guardaron correctamente 🌿",
        icon: "success",
        confirmButtonColor: "#0e7667",
      }).then(() => navigate("/perfil-turista"));

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron guardar las respuestas", "error");
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  // Si no hay preguntas para ninguna excursión
  if (datosCompletos.length === 0) {
    return (
      <Container className="text-center mt-5">
        <Card className="p-5 shadow">
          <h3>¡Reserva Exitosa!</h3>
          <p>Tus excursiones no requieren información adicional.</p>
          <Button variant="primary" onClick={() => navigate("/perfil-turista")}>Ir a Mis Reservas</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h3 className="mb-4 text-center text-primary">Personalización de tu Viaje</h3>
      
      {/* Renderizamos una tarjeta por cada excursión */}
      {datosCompletos.map((grupo) => (
        <Card key={grupo.id_reserva} className="shadow p-4 mb-4 border-success">
          <h4 className="text-success border-bottom pb-2 mb-3">
            Excursión: {grupo.nombre_excursion}
          </h4>

          <Form>
            {grupo.preguntas.map((p) => (
              <Form.Group key={p.id_pregunta} className="mb-3">
                <Form.Label className="fw-bold">{p.texto_pregunta}</Form.Label>

                {/* RADIO BUTTONS */}
                {p.tipo_respuesta === "checkbox" && (
                  <div className="d-flex gap-4 mt-2">
                    {["Sí", "No"].map(opc => (
                      <Form.Check
                        key={opc}
                        type="radio"
                        label={opc}
                        // Name único para que no se mezclen grupos
                        name={`preg-${grupo.id_reserva}-${p.id_pregunta}`}
                        onChange={(e) => handleChange(grupo.id_reserva, p.id_pregunta, opc)}
                      />
                    ))}
                  </div>
                )}

                {/* TEXTO LIBRE */}
                {p.tipo_respuesta === "texto" && (
                  <Form.Control
                    type="text"
                    placeholder="Tu respuesta..."
                    onChange={(e) => handleChange(grupo.id_reserva, p.id_pregunta, e.target.value)}
                  />
                )}

                {/* SELECT */}
                {p.tipo_respuesta === "select" && (
                  <Form.Select onChange={(e) => handleChange(grupo.id_reserva, p.id_pregunta, e.target.value)}>
                    <option value="">Seleccioná una opción</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                    <option value="No aplica">No aplica</option>
                  </Form.Select>
                )}
              </Form.Group>
            ))}
          </Form>
        </Card>
      ))}

      <div className="text-center mt-4">
        <Button variant="success" size="lg" onClick={handleGuardarTodo}>
          Confirmar y Finalizar Todo
        </Button>
      </div>
    </Container>
  );
}