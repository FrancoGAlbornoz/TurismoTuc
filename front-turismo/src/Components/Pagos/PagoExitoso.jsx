import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCarritoStore from "../../store/useCarritoStore";
import axios from "axios";

export default function PagoExitoso() {
  const clearCarrito = useCarritoStore((state) => state.clearCarrito);
  const setCarrito = useCarritoStore((state) => state.setCarrito);
  const navigate = useNavigate();

  const id_turista = sessionStorage.getItem("id_turista"); // o auth

  useEffect(() => {
    const validarCarrito = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/carrito/${id_turista}`
        );

        // 👉 Backend devuelve null si NO hay carrito abierto
        if (!res.data) {
          clearCarrito();
        } else {
          setCarrito(res.data); // por si webhook todavía no cerró
        }
      } catch (error) {
        console.error("Error validando carrito post-pago", error);
      }
    };

    validarCarrito();
    sessionStorage.setItem("pago_exitoso", "true");
  }, [clearCarrito, setCarrito, id_turista]);

  return (
    <div className="container text-center mt-5">
      <h2>Pago realizado con éxito</h2>
      <p>Tu reserva fue registrada correctamente.</p>

      <button
        className="btn btn-success mt-3"
        onClick={() => navigate("/perfil-turista")}
      >
        Ir a mi perfil
      </button>
    </div>
  );
}
