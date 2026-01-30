import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCarritoStore from "../../store/useCarritoStore";

export default function PagoExitoso() {
  const clearCarrito = useCarritoStore((state) => state.clearCarrito);
  const navigate = useNavigate();

  useEffect(() => {
    clearCarrito();
    sessionStorage.setItem("pago_exitoso", "true");
  }, [clearCarrito]);

  return (
    <div className="container text-center mt-5">
      <h2>Pago realizado con éxito</h2>
      <p>Tu reserva fue registrada y será confirmada por un administrador.</p>

      <button
        className="btn btn-success mt-3"
        onClick={() => navigate("/perfil-turista")}
      >
        Ir a mi perfil
      </button>
    </div>
  );
}
