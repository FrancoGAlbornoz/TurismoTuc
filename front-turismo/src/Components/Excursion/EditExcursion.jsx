import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Row, Col, Form, Button, Spinner, Card } from "react-bootstrap";
import Swal from "sweetalert2";

export default function EditExcursion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [excursion, setExcursion] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [guias, setGuias] = useState([]);
  const [nuevaUrl, setNuevaUrl] = useState("");

  const [idsCategorias, setIdsCategorias] = useState([]);

  // NUEVO: archivo y estado de subida
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resExc = await axios.get(
          `http://localhost:8000/api/excursiones/${id}`
        );
        const data = resExc.data;

        const idsIniciales =
          data.categorias?.map((c) =>
            String(c.id_categoria_excursion)
          ) || [];

        setExcursion({ ...data, id_guia: data.id_guia || "" });
        setIdsCategorias(idsIniciales);

        const resImgs = await axios.get(
          `http://localhost:8000/api/excursiones/${id}/multimedia`
        );
        setImagenes(resImgs.data);

        const resCats = await axios.get(
          "http://localhost:8000/api/categorias"
        );
        setCategorias(resCats.data);

        const resGuias = await axios.get(
          "http://localhost:8000/api/excursiones/guias"
        );
        setGuias(resGuias.data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        Swal.fire("Error", "No se pudo cargar la excursión.", "error");
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setExcursion({ ...excursion, [e.target.name]: e.target.value });
  };

  const handleCategoriaToggle = (idCat) => {
    setIdsCategorias((prev) =>
      prev.includes(idCat)
        ? prev.filter((id) => id !== idCat)
        : [...prev, idCat]
    );
  };

  const handleEliminarImagen = async (id_multimedia) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/excursiones/multimedia/${id_multimedia}`
      );
      const resImgs = await axios.get(
        `http://localhost:8000/api/excursiones/${id}/multimedia`
      );
      setImagenes(resImgs.data);
    } catch (err) {
      console.error("Error al eliminar imagen:", err);
      Swal.fire("Error", "No se pudo eliminar la imagen.", "error");
    }
  };

  // NUEVO: subir archivo a Cloudinary
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

      const url = res.data.url || res.data.secure_url;
      setNuevaUrl(url || "");

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
      await axios.put(
        `http://localhost:8000/api/excursiones/${id}`,
        excursion
      );

      await axios.put(
        `http://localhost:8000/api/excursiones/${id}/categorias`,
        { ids_categorias: idsCategorias }
      );

      if (nuevaUrl.trim() !== "") {
        await axios.post("http://localhost:8000/api/excursiones/multimedia", {
          id_excursion: id,
          url: nuevaUrl,
          descripcion: "Imagen agregada desde la edición",
          tipo: "foto",
        });

        const resImgs = await axios.get(
          `http://localhost:8000/api/excursiones/${id}/multimedia`
        );
        setImagenes(resImgs.data);
        setNuevaUrl("");
      }

      await Swal.fire({
        title: "Excursión actualizada",
        text: "Los cambios se guardaron correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/dashboard-admin/excursiones");
    } catch (err) {
      console.error("Error al actualizar excursión:", err);
      Swal.fire("Error", "No se pudo actualizar la excursión.", "error");
    }
  };

  if (!excursion) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2">Cargando excursión...</p>
      </div>
    );
  }

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
        <Card className="shadow-sm mb-4">
          <div className="col-12 col-md-6 text-md-end">
            <h4 className="fw-bold text-success mb-0">Editar Excursión</h4>
          </div>
          <Card.Body>
            <h6 className="fw-semibold mb-3">Información general</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    name="titulo"
                    value={excursion.titulo}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    name="ubicacion"
                    value={excursion.ubicacion}
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
                    value={excursion.precio_base}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={excursion.estado}
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
                value={excursion.descripcion || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <h6 className="fw-semibold mb-3">Asignaciones</h6>
            <Row className="mb-3">
              <Col md={6}>
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
                    Tildá las categorías que correspondan.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Guía asignado</Form.Label>
                  <Form.Select
                    name="id_guia"
                    value={excursion.id_guia}
                    onChange={handleChange}
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

            <h6 className="fw-semibold mb-3">Agregar imagen</h6>
            <Form.Group className="mb-3">
              <Form.Label>URL de imagen principal</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://tuservidor.com/imagenes/excursion.jpg"
                value={nuevaUrl}
                onChange={(e) => setNuevaUrl(e.target.value)}
              />
              <Form.Text className="text-muted">
                Podés pegar una URL o subir una nueva imagen para esta excursión.
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
                Guardar cambios
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Form>

      {imagenes.length > 0 && (
        <div className="mt-4">
          <h6 className="fw-bold mb-3">Imágenes actuales</h6>
          <div className="row g-3">
            {imagenes.map((img) => (
              <div
                key={img.id_multimedia}
                className="col-6 col-sm-4 col-md-3 position-relative"
              >
                <Card className="shadow-sm h-100">
                  <Card.Img
                    variant="top"
                    src={img.url}
                    alt="Imagen"
                    style={{ height: "140px", objectFit: "cover" }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0"
                    onClick={() => handleEliminarImagen(img.id_multimedia)}
                  >
                    ×
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
