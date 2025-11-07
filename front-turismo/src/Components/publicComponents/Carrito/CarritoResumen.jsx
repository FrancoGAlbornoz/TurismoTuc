// src/Components/publicComponents/Carrito/CarritoResumen.jsx
import { Card, Button } from "react-bootstrap";

export default function CarritoResumen({ subtotal = 0, impuestos = 0, total = 0 }) {
  return (
    <Card className="shadow-sm border-0 rounded-4">
      <Card.Body>
        <h5 className="fw-bold mb-3">Resumen</h5>

        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString("es-AR")}</span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>Impuestos</span>
          <span>${impuestos.toLocaleString("es-AR")}</span>
        </div>

        <hr />

        <div className="d-flex justify-content-between mb-3">
          <span className="fw-bold">Total</span>
          <span className="fw-bold">${total.toLocaleString("es-AR")}</span>
        </div>

        <Button variant="warning" className="w-100 mb-2 fw-semibold">
          Ir a reservar
        </Button>
        <Button variant="outline-secondary" className="w-100 fw-semibold">
          Seguir explorando
        </Button>
      </Card.Body>
    </Card>
  );
}
