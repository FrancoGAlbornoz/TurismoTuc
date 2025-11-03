import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import FechasExcursion from "./FechaExcursion.jsx";

export default function EditExcursion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [excursion, setExcursion] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resExc = await axios.get(`http://localhost:8000/api/excursiones/${id}`);
        const data = resExc.data;

        const id_categoria_excursion = data.categorias?.[0]?.id_categoria_excursion || "";
        setExcursion({ ...data, id_categoria_excursion });

        const resImgs = await axios.get(`http://localhost:8000/api/multimedia/excursion/${id}`);
        setImagenes(resImgs.data);

        // ✅ Endpoint corregido
        const resCats = await axios.get("http://localhost:8000/api/excursiones/categorias-excursion");
        setCategorias(resCats.data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setExcursion({ ...excursion, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/excursiones/${id}`, excursion);

      if (excursion.id_categoria_excursion) {
        await axios.post("http://localhost:8000/api/excursiones/categoria", {
          id_excursion: id,
          id_categoria_excursion: excursion.id_categoria_excursion,
        });
      }

      navigate("/dashboard-admin/excursiones");
    } catch (err) {
      console.error("Error al actualizar excursión:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imagen", file);
    formData.append("id_excursion", id);
    formData.append("tipo", "foto");

    try {
      await axios.post("http://localhost:8000/api/multimedia", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const resImgs = await axios.get(`http://localhost:8000/api/multimedia/excursion/${id}`);
      setImagenes(resImgs.data);
    } catch (err) {
      console.error("Error al subir imagen:", err);
    }
  };

  if (!excursion) return <p className="text-center mt-4">Cargando...</p>;

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-3">Editar Excursión</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Título</label>
          <input type="text" name="titulo" className="form-control" value={excursion.titulo} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Ubicación</label>
          <input type="text" name="ubicacion" className="form-control" value={excursion.ubicacion} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Precio Base</label>
          <input type="number" name="precio_base" className="form-control" value={excursion.precio_base} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select name="estado" className="form-select" value={excursion.estado} onChange={handleChange}>
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea name="descripcion" className="form-control" rows={4} value={excursion.descripcion || ""} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Categoría</label>
          <select name="id_categoria_excursion" className="form-select" value={excursion.id_categoria_excursion} onChange={handleChange}>
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria_excursion} value={cat.id_categoria_excursion}>
                {cat.nombre_categoria}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Subir imagen</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
        </div>
        <button type="submit" className="btn btn-success">Guardar cambios</button>
      </form>

      {imagenes.length > 0 && (
        <div className="mt-4">
          <h6 className="fw-bold">Imágenes actuales</h6>
          <div className="d-flex flex-wrap gap-3">
            {imagenes.map((img) => (
              <img key={img.id_multimedia} src={img.url} alt="Imagen" className="img-thumbnail" style={{ maxHeight: "200px" }} />
            ))}
          </div>
        </div>
      )}

      <hr className="my-4" />
      <FechasExcursion id_excursion={id} />
    </div>
  );
}