import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useTuristaStore from "../../../store/useTuristaStore";

export default function CarritoResumen({
  subtotal = 0,
  impuestos = 0,
  total = 0,
}) {
  const navigate = useNavigate();
  const { turista } = useTuristaStore();

  const handleIrAReservar = () => {
    if (!turista) {
      Swal.fire({
        icon: "warning",
        title: "Iniciá sesión",
        text: "Debes iniciar sesión antes de continuar con la reserva.",
        confirmButtonText: "Ir al login",
      }).then(() => {
        navigate("/login-turista");
      });
      return;
    }

    navigate("/checkout");
  };

  const handleSeguirExplorando = () => {
    navigate("/catalogo");
  };

  return (
    <Card className="shadow-sm border-0 rounded-4">
      <Card.Body>
        <h5 className="fw-bold mb-3">RESUMEN DE PAGO</h5>

        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <span>${Number(subtotal).toLocaleString("es-AR")}</span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>Impuestos</span>
          <span>${Number(impuestos).toLocaleString("es-AR")}</span>
        </div>

        <hr />

        <div className="d-flex justify-content-between mb-3">
          <span className="fw-bold">TOTAL</span>
          <span className="fw-bold">${Number(total).toLocaleString("es-AR")}</span>
        </div>

        <Button
          variant="success"
          className="w-100 mb-2 fw-semibold"
          onClick={handleIrAReservar}
        >
          IR A RESERVAR
        </Button>

        <Button
          variant="warning"
          className="w-100 fw-semibold"
          onClick={handleSeguirExplorando}
        >
          SEGUIR EXPLORANDO
        </Button>
      </Card.Body>
    </Card>
  );
}