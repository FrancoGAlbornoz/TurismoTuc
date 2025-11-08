// src/Components/publicComponents/Carrito/CarritoItem.jsx
import { Card, Button } from "react-bootstrap";
import useCarritoStore from "../../../store/useCarritoStore";

export default function CarritoItem({ item }) {
  const { updateCantidad, removeItem } = useCarritoStore();

  const handleActualizarCantidad = async (nuevaCantidad) => {
    // si baja a 0, preguntar si lo saca
    if (nuevaCantidad <= 0) {
      if (window.confirm("¿Deseas quitar esta excursión del carrito?")) {
        await removeItem(item.id_item);
      }
      return;
    }

    // dejamos que el backend valide el cupo real
    try {
      await updateCantidad(item.id_item, nuevaCantidad);
    } catch (err) {
      // el store ya alerta, así que acá no hace falta
    }
  };

  return (
    <Card className="mb-3 shadow-sm border-0 rounded-4">
      <Card.Body className="d-flex align-items-center justify-content-between flex-wrap">
        <div className="flex-grow-1">
          <h6 className="fw-bold mb-1">{item.excursion}</h6>
          <p className="text-muted small mb-1">
            Fecha:{" "}
            {item.fecha
              ? new Date(item.fecha).toLocaleDateString("es-AR")
              : "A definir"}
          </p>

          {/* Controles de cantidad */}
          <div className="d-flex align-items-center gap-3 small mt-2">
            <span className="fw-semibold">Personas:</span>

            <div className="d-flex align-items-center border rounded px-2 py-1 bg-light">
              <Button
                variant="outline-secondary"
                size="sm"
                className="px-2 py-0"
                onClick={() =>
                  handleActualizarCantidad(item.cantidad_personas - 1)
                }
              >
                −
              </Button>

              <span className="mx-3 fw-semibold">{item.cantidad_personas}</span>

              <Button
                variant="outline-secondary"
                size="sm"
                className="px-2 py-0"
                onClick={() =>
                  handleActualizarCantidad(item.cantidad_personas + 1)
                }
              >
                +
              </Button>
            </div>

            <span>
              — Precio unitario: $
              {Number(item.precio_unitario || 0).toLocaleString("es-AR")}
            </span>
          </div>

          <p className="text-success fw-semibold mt-2 mb-0">
            Subtotal: $
            {Number(
              item.subtotal ||
                (item.precio_unitario || 0) * item.cantidad_personas
            ).toLocaleString("es-AR")}
          </p>
        </div>

        <div>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => removeItem(item.id_item)}
          >
            Quitar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
