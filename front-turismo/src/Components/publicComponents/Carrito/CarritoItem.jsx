// src/Components/publicComponents/Carrito/CarritoItem.jsx
import { Card, Button } from "react-bootstrap";
import useCarritoStore from "../../../store/useCarritoStore";

export default function CarritoItem({ item }) {
  const { updateCantidad, removeItem } = useCarritoStore();

  const cantidad = Number(item.cantidad_personas) || 0;
  const precioUnitario = Number(item.precio_unitario) || 0;
  const subtotalCalc = Number(item.subtotal) || cantidad * precioUnitario;
  const cupo = Number(item.cupo_disponible) || 0;

  // 🔹 Actualiza la cantidad validando antes de mandar al backend
  const handleActualizarCantidad = async (nuevaCantidad) => {
    const cant = Number(nuevaCantidad);

    // No permitir cantidades menores a 1
    if (cant <= 0) {
      const confirmar = window.confirm(
        "¿Querés quitar esta excursión del carrito?"
      );
      if (confirmar) await removeItem(item.id_item);
      return;
    }

    // No permitir superar el cupo disponible
    if (cant > cupo) {
      alert(`Solo hay ${cupo} lugares disponibles para esta excursión.`);
      return;
    }

    try {
      await updateCantidad(item.id_item, cant);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Ocurrió un error al actualizar la cantidad.";
      alert(msg);
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

          <div className="d-flex align-items-center gap-3 small mt-2">
            <span className="fw-semibold">Personas:</span>

            <div className="d-flex align-items-center border rounded px-2 py-1 bg-light">
              <Button
                variant="outline-secondary"
                size="sm"
                className="px-2 py-0"
                onClick={() => handleActualizarCantidad(cantidad - 1)}
              >
                −
              </Button>

              <span className="mx-3 fw-semibold">{cantidad}</span>

              <Button
                variant="outline-secondary"
                size="sm"
                className="px-2 py-0"
                onClick={() => handleActualizarCantidad(cantidad + 1)}
              >
                +
              </Button>
            </div>

            <span>
              — Precio unitario: ${precioUnitario.toLocaleString("es-AR")}
            </span>
          </div>

          <p className="text-success fw-semibold mt-2 mb-0">
            Subtotal: ${subtotalCalc.toLocaleString("es-AR")}
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
