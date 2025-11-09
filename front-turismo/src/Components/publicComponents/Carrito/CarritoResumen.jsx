// src/Components/publicComponents/Carrito/CarritoResumen.jsx
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useTuristaStore from "../../../store/useTuristaStore";

export default function CarritoResumen({ subtotal = 0, impuestos = 0, total = 0 }) {
  const navigate = useNavigate();
  const { turista } = useTuristaStore();

  const handleIrAReservar = () => {
    if (!turista) {
      // Si no hay usuario logueado, lo mandamos al login
      alert("Debes iniciar sesión antes de continuar con la reserva.");
      navigate("/login-turista");
      return;
    }

    // Si está logueado, lo redirigimos al checkout
    navigate("/checkout");
  };

  const handleSeguirExplorando = () => {
    navigate("/catalogo");
  };

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

        {/* 🔹 Botones */}
        <Button
          variant="warning"
          className="w-100 mb-2 fw-semibold"
          onClick={handleIrAReservar}
        >
          Ir a reservar
        </Button>

        <Button
          variant="outline-secondary"
          className="w-100 fw-semibold"
          onClick={handleSeguirExplorando}
        >
          Seguir explorando
        </Button>
      </Card.Body>
    </Card>
  );
}
