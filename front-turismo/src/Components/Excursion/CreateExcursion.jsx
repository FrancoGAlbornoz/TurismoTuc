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
    id_guia: "",
  });

  const [urlImagen, setUrlImagen] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [guias, setGuias] = useState([]);

  // ids de categorías seleccionadas
  const [idsCategorias, setIdsCategorias] = useState([]);

  // NUEVO: archivo local y estado de subida
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

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
        const res = await axios.get(
          "http://localhost:8000/api/excursiones/guias"
        );
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

  const handleCategoriaToggle = (idCat) => {
    setIdsCategorias((prev) =>
      prev.includes(idCat)
        ? prev.filter((id) => id !== idCat)
        : [...prev, idCat]
    );
  };

  // NUEVO: subir archivo a Cloudinary usando tu ruta /api/excursiones/imagen
  const handleSubirArchivo = async () => {
    if (!archivoImagen) return;

    try {
      setSubiendoImagen(true);

      const formData = new FormData();
      formData.append("imagen", archivoImagen);

      const res = await axios.post(
        "http://localhost:8000/api/excursiones/imagen",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // tu backend devuelve { ok, message, url, public_id }
      const nuevaUrl = res.data.url || res.data.secure_url;
      setUrlImagen(nuevaUrl || "");

      await Swal.fire({
        icon: "success",
        title: "Imagen subida",
        text: "La URL se completó automáticamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      Swal.fire(
        "Error",
        "No se pudo subir la imagen a Cloudinary.",
        "error"
      );
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1) Crear excursión
      const res = await axios.post(
        "http://localhost:8000/api/excursiones",
        form
      );
      const id_excursion = res.data.id;

      // 2) Guardar categorías asociadas (si hay)
      if (idsCategorias.length > 0) {
        await axios.put(
          `http://localhost:8000/api/excursiones/${id_excursion}/categorias`,
          { ids_categorias: idsCategorias }
        );
      }

      // 3) Guardar imagen principal (URL)
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
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
        >
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
                  <Form.Control
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Precio Base</Form.Label>
                  <Form.Control
                    type="number"
                    name="precio_base"
                    value={form.precio_base}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Duración</Form.Label>
                  <Form.Control
                    name="duracion"
                    value={form.duracion}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}

                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Incluye</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="incluye"
                    value={form.incluye}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Políticas</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="politicas"
                    value={form.politicas}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                {/* CATEGORÍAS COMO BOTONES PILL */}
                <Form.Group>
                  <Form.Label>Categorías</Form.Label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {categorias.map((cat) => {
                      const idStr = String(cat.id_categoria_excursion);
                      const checked = idsCategorias.includes(idStr);

                      return (
                        <Button
                          key={cat.id_categoria_excursion}
                          type="button"
                          size="sm"
                          variant={checked ? "primary" : "outline-secondary"}
                          className="rounded-pill"
                          onClick={() => handleCategoriaToggle(idStr)}
                        >
                          {cat.nombre_categoria}
                        </Button>
                      );
                    })}
                  </div>
                  <Form.Text className="text-muted">
                    Seleccioná una o varias categorías.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Guía asignado</Form.Label>
                  <Form.Select
                    name="id_guia"
                    value={form.id_guia}
                    onChange={handleChange}
                    required
                  >
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

            {/* URL + SUBIDA A CLOUDINARY */}
            <Form.Group className="mb-4">
              <Form.Label>URL de imagen principal</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://tuservidor.com/imagenes/excursion.jpg"
                value={urlImagen}
                onChange={(e) => setUrlImagen(e.target.value)}
              />
              <Form.Text className="text-muted">
                Podés pegar una URL directamente o subir una imagen desde tu
                PC para que se cargue en Cloudinary.
              </Form.Text>

              <div className="mt-2">
                <Form.Label className="mb-1">Subir archivo de imagen</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setArchivoImagen(e.target.files[0] || null)
                  }
                />
                <Button
                  type="button"
                  variant="outline-primary"
                  size="sm"
                  className="mt-2"
                  onClick={handleSubirArchivo}
                  disabled={!archivoImagen || subiendoImagen}
                >
                  {subiendoImagen ? "Subiendo..." : "Subir a Cloudinary"}
                </Button>
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="success">
                Crear excursión
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Form>
    </div>
  );
}
