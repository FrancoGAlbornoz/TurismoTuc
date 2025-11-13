import { useEffect, useState } from "react";
import {
  Container,
  Tabs,
  Tab,
  Form,
  Button,
  Table,
  Card,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";

export default function PreguntasPersonalizacionAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [excursiones, setExcursiones] = useState([]);

  const [loading, setLoading] = useState(false);

  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [tipoRespuesta, setTipoRespuesta] = useState("checkbox");
  const [excursionSeleccionada, setExcursionSeleccionada] = useState("");
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState("");

  // =============================
  // CARGA INICIAL
  // =============================
  useEffect(() => {
    fetchCategorias();
    fetchPreguntas();
    fetchExcursiones();
  }, []);

  const fetchCategorias = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/personalizacion/categorias"
    );
    setCategorias(res.data);
  };

  const fetchPreguntas = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/personalizacion/preguntas"
    );
    setPreguntas(res.data);
  };

  const fetchExcursiones = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/excursiones");
      setExcursiones(res.data);
    } catch (err) {
      console.error("Error al traer excursiones:", err);
    }
  };

  // =============================
  // CREAR CATEGORÍA
  // =============================
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;

    try {
      await axios.post("http://localhost:8000/api/personalizacion/categorias", {
        nombre_categoria: nuevaCategoria,
      });
      Swal.fire("¡Listo!", "Categoría creada correctamente", "success");
      setNuevaCategoria("");
      fetchCategorias();
    } catch (err) {
      Swal.fire("Error", "No se pudo crear la categoría", "error");
    }
  };

  // =============================
  // CREAR PREGUNTA
  // =============================
  const handleCrearPregunta = async (e) => {
    e.preventDefault();
    if (!nuevaPregunta.trim() || !categoriaSeleccionada)
      return Swal.fire("Atención", "Completá todos los campos", "warning");

    try {
      await axios.post("http://localhost:8000/api/personalizacion/preguntas", {
        id_categoria: categoriaSeleccionada,
        texto_pregunta: nuevaPregunta,
        tipo_respuesta: tipoRespuesta,
      });
      Swal.fire("¡Listo!", "Pregunta creada correctamente", "success");
      setNuevaPregunta("");
      fetchPreguntas();
    } catch (err) {
      Swal.fire("Error", "No se pudo crear la pregunta", "error");
    }
  };

  // =============================
  // ASOCIAR PREGUNTA A EXCURSIÓN
  // =============================
  const handleAsociarPregunta = async (e) => {
    e.preventDefault();
    if (!excursionSeleccionada || !preguntaSeleccionada)
      return Swal.fire(
        "Atención",
        "Seleccioná la excursión y la pregunta",
        "warning"
      );

    try {
      await axios.post("http://localhost:8000/api/personalizacion/excursion", {
        id_excursion: excursionSeleccionada,
        id_pregunta: preguntaSeleccionada,
      });
      Swal.fire(
        "✅ Hecho",
        "Pregunta asociada correctamente a la excursión",
        "success"
      );
      setPreguntaSeleccionada("");
      setExcursionSeleccionada("");
    } catch (err) {
      Swal.fire("Error", "No se pudo asociar la pregunta", "error");
    }
  };
  const handleEliminarCategoria = async (id) => {
  const confirm = await Swal.fire({
    title: "¿Eliminar categoría?",
    text: "Esta acción no eliminará las preguntas asociadas, pero ocultará la categoría.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirm.isConfirmed) return;

  try {
    await axios.put(`http://localhost:8000/api/personalizacion/categorias/eliminar/${id}`);
    Swal.fire("Eliminada", "La categoría fue eliminada correctamente.", "success");
    fetchCategorias();
  } catch (err) {
    Swal.fire("Error", "No se pudo eliminar la categoría.", err);
  }
};


  return (
    <Container className="my-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-bold text-success mb-4">
            Gestión de Personalización de Excursiones
          </h5>

          {loading ? (
            <div className="text-center mt-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <Tabs
              defaultActiveKey="categorias"
              id="tabs-personalizacion"
              className="mb-3 custom-tabs"
              fill
            >
              {/* ==================== CATEGORÍAS ==================== */}
              <Tab eventKey="categorias" title="Categorías">
                <Form onSubmit={handleCrearCategoria} className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Control
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      placeholder="Ej: Salud, Alimentación..."
                    />
                  </Form.Group>
                  <Button type="submit" variant="success">
                    Crear Categoría
                  </Button>
                </Form>

                <Table striped bordered hover responsive>
                  <thead className="table-success">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th style={{ width: "120px" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((cat) => (
                      <tr key={cat.id_categoria}>
                        <td>{cat.id_categoria}</td>
                        <td>{cat.nombre_categoria}</td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleEliminarCategoria(cat.id_categoria)
                            }
                          >
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>

              {/* ==================== PREGUNTAS ==================== */}
              <Tab eventKey="preguntas" title="Preguntas">
                <Form onSubmit={handleCrearPregunta} className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Select
                      value={categoriaSeleccionada}
                      onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                    >
                      <option value="">Seleccioná una categoría</option>
                      {categorias.map((c) => (
                        <option key={c.id_categoria} value={c.id_categoria}>
                          {c.nombre_categoria}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Control
                      value={nuevaPregunta}
                      onChange={(e) => setNuevaPregunta(e.target.value)}
                      placeholder="Ej: ¿Sufre de hipertensión?"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Select
                      value={tipoRespuesta}
                      onChange={(e) => setTipoRespuesta(e.target.value)}
                    >
                      <option value="checkbox">Sí / No</option>
                      <option value="texto">Texto libre</option>
                      <option value="select">
                        Opciones (Sí / No / No aplica)
                      </option>
                    </Form.Select>
                  </Form.Group>

                  <Button type="submit" variant="success">
                    Crear Pregunta
                  </Button>
                </Form>

                <Table striped bordered hover responsive>
                  <thead className="table-success">
                    <tr>
                      <th>ID</th>
                      <th>Categoría</th>
                      <th>Pregunta</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preguntas.map((p) => (
                      <tr key={p.id_pregunta}>
                        <td>{p.id_pregunta}</td>
                        <td>{p.nombre_categoria}</td>
                        <td>{p.texto_pregunta}</td>
                        <td>{p.tipo_respuesta}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>

              {/* ==================== ASOCIAR ==================== */}
              <Tab eventKey="asociar" title="Asociar a Excursión">
                <Form onSubmit={handleAsociarPregunta} className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Select
                      value={excursionSeleccionada}
                      onChange={(e) => setExcursionSeleccionada(e.target.value)}
                    >
                      <option value="">Seleccioná una excursión</option>
                      {excursiones.map((ex) => (
                        <option key={ex.id_excursion} value={ex.id_excursion}>
                          {ex.titulo}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Select
                      value={preguntaSeleccionada}
                      onChange={(e) => setPreguntaSeleccionada(e.target.value)}
                    >
                      <option value="">Seleccioná una pregunta</option>
                      {preguntas.map((p) => (
                        <option key={p.id_pregunta} value={p.id_pregunta}>
                          {p.texto_pregunta}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Button type="submit" variant="success">
                    Asociar Pregunta
                  </Button>
                </Form>
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
