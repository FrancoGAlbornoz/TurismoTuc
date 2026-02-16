import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCarritoStore from "../../store/useCarritoStore";

export default function PagoExitoso() {
  const clearCarrito = useCarritoStore((state) => state.clearCarrito);
  const fetchCarrito = useCarritoStore((state) => state.fetchCarrito);
  const setCarrito = useCarritoStore((state) => state.setCarrito);
  const navigate = useNavigate();

  //const id_turista = sessionStorage.getItem("id_turista");

  // useEffect(() => {
  //   const validarCarrito = async () => {
  //     try {
  //       const res = await axios.get(
  //         `${import.meta.env.VITE_API_URL}/carrito/${id_turista}`
  //       );

  //       // 👉 Backend devuelve null si NO hay carrito abierto
  //       if (!res.data) {
  //         clearCarrito();
  //       } else {
  //         setCarrito(res.data); // por si webhook todavía no cerró
  //       }
  //     } catch (error) {
  //       console.error("Error validando carrito post-pago", error);
  //     }
  //   };

  //   validarCarrito();
  //   sessionStorage.setItem("pago_exitoso", "true");
  // }, [clearCarrito, setCarrito, id_turista]);
  useEffect(() => {
    const syncCarrito = async () => {
      clearCarrito(); // Limpiar estado local primero
      try {
        await fetchCarrito(); // Traer estado real desde backend
      } catch (err) {
        console.error("Error sincronizando carrito post-pago", err);
      }
      sessionStorage.setItem("pago_exitoso", "true");
    };

    syncCarrito();
  }, [clearCarrito, fetchCarrito]);

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
