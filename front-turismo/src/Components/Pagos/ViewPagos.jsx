import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function ViewPago() {
  const { id } = useParams();
  const [pago, setPago] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPago = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/pagos");
        const encontrado = res.data.find((p) => p.id_pago === Number(id));
        setPago(encontrado);
      } catch (err) {
        console.error("Error al obtener pago:", err);
        setError("No se pudo cargar la información del pago.");
      }
    };
    fetchPago();
  }, [id]);

  if (error) return <div className="alert alert-danger mt-4">{error}</div>;
  if (!pago) return <div className="text-center mt-5">Cargando información...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h4 className="text-success fw-bold mb-3">Detalle del Pago</h4>
        <p><strong>ID:</strong> {pago.id_pago}</p>
        <p><strong>Turista:</strong> {pago.turista_nombre} {pago.turista_apellido}</p>
        <p><strong>Método:</strong> {pago.metodo}</p>
        <p><strong>Monto:</strong> ${pago.monto?.toLocaleString("es-AR")}</p>
        <p><strong>Estado:</strong> {pago.estado_pago}</p>
        <p><strong>Referencia:</strong> {pago.referencia || "—"}</p>
        <p><strong>Reserva asociada:</strong> {pago.id_reserva}</p>

        <Link to="/dashboard-admin/pagos" className="btn btn-outline-success mt-3">
          ← Volver al listado
        </Link>
      </div>
    </div>
  );
}
