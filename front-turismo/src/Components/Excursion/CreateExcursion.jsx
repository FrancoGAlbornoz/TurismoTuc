import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Row, Col, Button, Card } from "react-bootstrap";

export default function CreateExcursion() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    precio_base: "",
    duracion: "",
    ubicacion: "",
    incluye: "",
    politicas: "",
    estado: "activa",
    id_categoria_excursion: "",
    id_guia: "",
  });

  const [urlImagen, setUrlImagen] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [guias, setGuias] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/categorias");
        setCategorias(res.data);
      } catch (err) {
        console.error("Error al obtener categorías:", err);
      }
    };

    const fetchGuias = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/excursiones/guias");
        setGuias(res.data);
      } catch (err) {
        console.error("Error al obtener guías:", err);
      }
    };

    fetchCategorias();
    fetchGuias();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/excursiones", form);
      const id_excursion = res.data.id;

      if (urlImagen.trim() !== "") {
        await axios.post("http://localhost:8000/api/excursiones/multimedia", {
          id_excursion,
          url: urlImagen,
          descripcion: "Imagen principal de la excursión",
          tipo: "foto",
        });
      }

      await Swal.fire({
        icon: "success",
        title: "Excursión creada correctamente",
        showConfirmButton: false,
        timer: 2000,
      });

      navigate("/dashboard-admin/excursiones");
    } catch (err) {
      console.error("Error al crear excursión:", err);
      Swal.fire({
        icon: "error",
        title: "Error al crear excursión",
        text: "Por favor, revisa los datos ingresados.",
      });
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


      <Form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
        <div className="col-12 col-md-6 text-md-end">
              <h4 className="fw-bold text-success mb-0">Nueva Excursión</h4>
            </div>
          <Card.Body>
            <h6 className="fw-semibold mb-3">Información general</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Título</Form.Label>
                  <Form.Control name="titulo" value={form.titulo} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control name="ubicacion" value={form.ubicacion} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Precio Base</Form.Label>
                  <Form.Control type="number" name="precio_base" value={form.precio_base} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Duración</Form.Label>
                  <Form.Control name="duracion" value={form.duracion} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select name="estado" value={form.estado} onChange={handleChange}>
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={4} name="descripcion" value={form.descripcion} onChange={handleChange} />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Incluye</Form.Label>
                  <Form.Control as="textarea" rows={2} name="incluye" value={form.incluye} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Políticas</Form.Label>
                  <Form.Control as="textarea" rows={2} name="politicas" value={form.politicas} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select name="id_categoria_excursion" value={form.id_categoria_excursion} onChange={handleChange}>
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id_categoria_excursion} value={cat.id_categoria_excursion}>
                        {cat.nombre_categoria}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Guía asignado</Form.Label>
                  <Form.Select name="id_guia" value={form.id_guia} onChange={handleChange}>
                    <option value="">Seleccionar guía</option>
                    {guias.map((g) => (
                      <option key={g.id_usuario} value={g.id_usuario}>
                        {g.nombre} {g.apellido}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>URL de imagen principal</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://tuservidor.com/imagenes/excursion.jpg"
                value={urlImagen}
                onChange={(e) => setUrlImagen(e.target.value)}
              />
              <Form.Text className="text-muted">
                Pegá la URL de la imagen principal de la excursión (por ahora solo una).
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="success">Crear excursión</Button>
            </div>
          </Card.Body>
        </Card>
      </Form>
    </div>
  );
}