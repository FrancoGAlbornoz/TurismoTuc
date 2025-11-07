import { Card, Button } from "react-bootstrap";
import useCarritoStore from "../../../store/useCarritoStore";

export default function CarritoItem({ item }) {
  const { removeItem } = useCarritoStore();

  if (!item) return null;

  // 🔹 Aseguramos tipos correctos
  const excursion = item.excursion || "Excursión desconocida";
  const fecha = item.fecha
    ? new Date(item.fecha).toLocaleDateString("es-AR")
    : "Sin fecha";
  const cantidad = Number(item.cantidad_personas) || 1;
  const precio = Number(item.precio_unitario) || 0;
  const subtotal = Number(item.subtotal) || precio * cantidad;

  return (
    <Card className="mb-3 shadow-sm border-0 rounded-3">
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold text-teal mb-1">{excursion}</h5>
          <p className="text-muted mb-1">Fecha: {fecha}</p>
          <p className="mb-0">
            Personas: {cantidad} — Precio unitario: $
            {precio.toLocaleString("es-AR")}
          </p>
          <p className="fw-semibold text-success mt-1">
            Subtotal: ${subtotal.toLocaleString("es-AR")}
          </p>
        </div>

        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => removeItem(item.id_item)}
        >
          <i className="bi bi-trash3"></i> Quitar
        </Button>
      </Card.Body>
    </Card>
  );
}
