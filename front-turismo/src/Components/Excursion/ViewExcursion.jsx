import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewExcursion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [excursion, setExcursion] = useState(null);
  const [fechas, setFechas] = useState([]);
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resExc = await axios.get(`http://localhost:8000/api/excursiones/${id}`);
        setExcursion(resExc.data);

        const resFechas = await axios.get(`http://localhost:8000/api/excursiones/${id}/fechas`);
        setFechas(resFechas.data);

        const resImgs = await axios.get(`http://localhost:8000/api/multimedia/excursion/${id}`);
        setImagenes(resImgs.data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, [id]);

  if (!excursion) return <p className="text-center mt-4">Cargando excursión...</p>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">{excursion.titulo}</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>← Volver</button>
      </div>

      <div className="mb-3"><strong>Ubicación:</strong> {excursion.ubicacion}</div>
      <div className="mb-3"><strong>Precio base:</strong> ${excursion.precio_base}</div>
      <div className="mb-3"><strong>Estado:</strong> {excursion.estado}</div>
      <div className="mb-3"><strong>Descripción:</strong><p>{excursion.descripcion}</p></div>

      {/* ✅ Mostrar categorías */}
      <div className="mb-3">
        <strong>Categorías:</strong>{" "}
        {excursion.categorias?.length > 0 ? (
          excursion.categorias.map((cat) => (
            <span key={cat.id_categoria_excursion} className="badge bg-info me-1">
              {cat.nombre_categoria}
            </span>
          ))
        ) : (
          <span className="text-muted">Sin categoría</span>
        )}
      </div>

      {imagenes.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold">Imágenes</h6>
          <div className="d-flex flex-wrap gap-3">
            {imagenes.map((img) => (
              <div key={img.id_multimedia}>
                <img src={img.url} alt="Imagen" className="img-thumbnail" style={{ maxHeight: "200px" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <hr />
      <h5 className="fw-bold">Fechas disponibles</h5>
      {fechas.length === 0 ? (
        <p>No hay fechas registradas.</p>
      ) : (
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Cupo</th>
              <th>Disponible</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {fechas.map((f) => (
              <tr key={f.id_fecha}>
                <td>{new Date(f.fecha).toLocaleDateString()}</td>
                <td>{f.hora_salida?.slice(0, 5)}</td>
                <td>{f.cupo_maximo}</td>
                <td>{f.cupo_disponible}</td>
                <td>{f.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}