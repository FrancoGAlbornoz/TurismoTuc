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
  Badge,
} from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";

export default function PreguntasPersonalizacionAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [excursiones, setExcursiones] = useState([]);
  // Nuevo estado para ver qué pregunta está en qué excursión
  const [asignaciones, setAsignaciones] = useState([]);

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
    fetchTodo();
  }, []);

  const fetchTodo = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCategorias(),
        fetchPreguntas(),
        fetchExcursiones(),
        fetchAsignaciones(),
      ]);
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/personalizacion/categorias",
    );
    setCategorias(res.data);
  };

  const fetchPreguntas = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/personalizacion/preguntas",
    );
    setPreguntas(res.data);
  };

  const fetchExcursiones = async () => {
    const res = await axios.get("http://localhost:8000/api/excursiones");
    setExcursiones(res.data.data || []);
  };

  const fetchAsignaciones = async () => {
    try {
      // Esta es la nueva ruta que creamos en el backend
      const res = await axios.get(
        "http://localhost:8000/api/personalizacion/asignaciones",
      );
      setAsignaciones(res.data);
    } catch (error) {
      console.error("Error al traer asignaciones", error);
    }
  };

  // =============================
  // MANEJADORES (ACCIONES)
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

  const handleEliminarCategoria = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: "Esto ocultará la categoría pero no borrará las preguntas asociadas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });
    if (result.isConfirmed) {
      try {
        await axios.put(
          `http://localhost:8000/api/personalizacion/categorias/eliminar/${id}`,
        );
        fetchCategorias();
        Swal.fire("Eliminado", "La categoría ha sido eliminada.", "success");
      } catch (err) {
        Swal.fire("Error", "No se pudo eliminar", "error");
      }
    }
  };

  const handleCrearPregunta = async (e) => {
    e.preventDefault();
    if (!nuevaPregunta.trim() || !categoriaSeleccionada) {
      return Swal.fire(
        "Atención",
        "Completá el texto y la categoría",
        "warning",
      );
    }
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

  const handleAsociarPregunta = async (e) => {
    e.preventDefault();
    if (!excursionSeleccionada || !preguntaSeleccionada) {
      return Swal.fire("Atención", "Seleccioná ambos campos", "warning");
    }
    try {
      await axios.post("http://localhost:8000/api/personalizacion/excursion", {
        id_excursion: excursionSeleccionada,
        id_pregunta: preguntaSeleccionada,
      });
      Swal.fire("✅ Hecho", "Pregunta asignada a la excursión", "success");
      setPreguntaSeleccionada("");
      fetchAsignaciones(); // Actualiza la tabla de abajo
    } catch (err) {
      Swal.fire("Error", "No se pudo asociar. Quizás ya existe.", "error");
    }
  };

  const handleQuitarPregunta = async (idExcursion, idPregunta) => {
    const result = await Swal.fire({
      title: "¿Quitar esta pregunta?",
      text: "Si está repetida, solo se quitará una de las copias.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, quitar",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        // Mandamos ambos IDs en la URL
        await axios.put(
          `http://localhost:8000/api/personalizacion/asignaciones/${idExcursion}/${idPregunta}`,
        );

        Swal.fire("Eliminado", "Pregunta quitada con éxito.", "success");
        fetchAsignaciones();
      } catch (err) {
        console.error("Error al borrar:", err);
        Swal.fire("Error", "No se pudo quitar la pregunta.", "error");
      }
    }
  };

  return (
    <Container className="my-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h4 className="fw-bold text-success mb-4">
            Gestión de Personalización
          </h4>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-2 text-muted">Cargando datos...</p>
            </div>
          ) : (
            <Tabs
              defaultActiveKey="categorias"
              id="tabs-personalizacion"
              className="mb-4"
              fill
            >
              {/* --- PESTAÑA 1: CATEGORÍAS --- */}
              <Tab eventKey="categorias" title="1. Categorías">
                <Form
                  onSubmit={handleCrearCategoria}
                  className="mb-4 d-flex gap-2"
                >
                  <Form.Control
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    placeholder="Ej: Salud, Alimentación, Equipamiento..."
                  />
                  <Button type="submit" variant="success">
                    Crear Categoría
                  </Button>
                </Form>

                <Table striped bordered hover responsive>
                  <thead className="table-success">
                    <tr>
                      <th>ID</th>
                      <th>Nombre de Categoría</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((c) => (
                      <tr key={c.id_categoria}>
                        <td>{c.id_categoria}</td>
                        <td>{c.nombre_categoria}</td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleEliminarCategoria(c.id_categoria)
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

              {/* --- PESTAÑA 2: PREGUNTAS --- */}
              <Tab eventKey="preguntas" title="2. Definir Preguntas">
                <Form
                  onSubmit={handleCrearPregunta}
                  className="mb-4 bg-light p-3 rounded border"
                >
                  <div className="row g-2">
                    <div className="col-md-4">
                      <Form.Label className="small fw-bold">
                        Categoría
                      </Form.Label>
                      <Form.Select
                        value={categoriaSeleccionada}
                        onChange={(e) =>
                          setCategoriaSeleccionada(e.target.value)
                        }
                      >
                        <option value="">Seleccionar...</option>
                        {categorias.map((c) => (
                          <option key={c.id_categoria} value={c.id_categoria}>
                            {c.nombre_categoria}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-md-5">
                      <Form.Label className="small fw-bold">
                        Texto de la Pregunta
                      </Form.Label>
                      <Form.Control
                        value={nuevaPregunta}
                        onChange={(e) => setNuevaPregunta(e.target.value)}
                        placeholder="Ej: ¿Tiene alguna alergia?"
                      />
                    </div>
                    <div className="col-md-3">
                      <Form.Label className="small fw-bold">
                        Tipo de Respuesta
                      </Form.Label>
                      <Form.Select
                        value={tipoRespuesta}
                        onChange={(e) => setTipoRespuesta(e.target.value)}
                      >
                        <option value="checkbox">Sí / No</option>
                        <option value="texto">Texto Libre</option>
                        <option value="select">Lista Opciones</option>
                      </Form.Select>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="success"
                    className="w-100 mt-3"
                  >
                    Guardar Pregunta General
                  </Button>
                </Form>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <Table striped bordered hover size="sm">
                    <thead className="table-success position-sticky top-0">
                      <tr>
                        <th>Categoría</th>
                        <th>Pregunta</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preguntas.map((p) => (
                        <tr key={p.id_pregunta}>
                          <td>
                            <Badge bg="secondary">{p.nombre_categoria}</Badge>
                          </td>
                          <td>{p.texto_pregunta}</td>
                          <td>
                            <small className="text-muted">
                              {p.tipo_respuesta}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab>

              {/* --- PESTAÑA 3: ASOCIAR A EXCURSIÓN (LO NUEVO) --- */}
              <Tab eventKey="asociar" title="3. Preguntas por Excursión">
                <Card className="mb-4 bg-light border">
                  <Card.Body>
                    <h6 className="fw-bold mb-3 text-primary">
                      Asignar pregunta a una excursión específica
                    </h6>
                    <Form
                      onSubmit={handleAsociarPregunta}
                      className="row g-2 align-items-end"
                    >
                      <div className="col-md-5">
                        <Form.Label className="small fw-bold">
                          Excursión
                        </Form.Label>
                        <Form.Select
                          value={excursionSeleccionada}
                          onChange={(e) =>
                            setExcursionSeleccionada(e.target.value)
                          }
                        >
                          <option value="">Seleccioná una excursión</option>
                          {excursiones.map((ex) => (
                            <option
                              key={ex.id_excursion}
                              value={ex.id_excursion}
                            >
                              {ex.titulo}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-5">
                        <Form.Label className="small fw-bold">
                          Pregunta
                        </Form.Label>
                        <Form.Select
                          value={preguntaSeleccionada}
                          onChange={(e) =>
                            setPreguntaSeleccionada(e.target.value)
                          }
                        >
                          <option value="">Seleccioná una pregunta</option>
                          {preguntas.map((p) => (
                            <option key={p.id_pregunta} value={p.id_pregunta}>
                              {p.texto_pregunta}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Button
                          type="submit"
                          variant="success"
                          className="w-100"
                        >
                          Asociar
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>

                {/* TABLA DE AUDITORÍA Y ELIMINACIÓN */}
                <h5 className="text-dark mt-4 mb-3">
                  📋 Listado de preguntas asignadas
                </h5>
                <Table striped hover bordered responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>Excursión</th>
                      <th>Pregunta</th>
                      <th className="text-center">Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.length > 0 ? (
                      asignaciones.map((asig) => (
                        <tr key={asig.id_asociacion}>
                          <td className="fw-bold text-success">
                            {asig.nombre_excursion}
                          </td>
                          <td>{asig.texto_pregunta}</td>
                          <td className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleQuitarPregunta(
                                  asig.id_excursion,
                                  asig.id_pregunta,
                                )
                              }
                            >
                              ❌
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No hay preguntas asignadas a ninguna excursión
                          todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
