import { useEffect, useState } from "react";
import { Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import useCarritoStore from "../../../store/useCarritoStore";

export default function CheckoutPago({ turista, onNext }) {
  const [metodo, setMetodo] = useState("");
  const [referencia, setReferencia] = useState("");
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgInfo, setMsgInfo] = useState("");
  const navigate = useNavigate();

  const [idCarrito, setIdCarrito] = useState(null);
  const [item, setItem] = useState(null);

  // 🔹 Traer carrito abierto del turista y sus ítems
  useEffect(() => {
    const cargarCarrito = async () => {
      try {
        setMsgError("");
        const id_turista = turista.id_turista || turista.id;

        const carRes = await axios.get(
          `http://localhost:8000/api/carrito/${id_turista}`
        );

        if (!carRes.data) {
          setMsgInfo("Tu carrito está vacío.");
          useCarritoStore.getState().clearCarrito();
          return;
        }

        const id_carrito = carRes.data.id_carrito;
        setIdCarrito(id_carrito);

        const itemsRes = await axios.get(
          `http://localhost:8000/api/carrito/${id_carrito}/items`
        );

        if (!itemsRes.data || itemsRes.data.length === 0) {
          setMsgInfo(
            "Tu carrito está vacío. Volvé al catálogo y agregá una excursión."
          );
          return;
        }

        setItem(itemsRes.data[0]);
      } catch (e) {
        console.error(e);
        setMsgError("No se pudo obtener el carrito. Probá recargar la página.");
      }
    };

    cargarCarrito();
  }, [turista]);

  // 🧩 Crear reserva
  const crearReserva = async () => {
    if (!item) {
      setMsgError("No hay ítems en el carrito.");
      return null;
    }

    const payload = {
      id_turista: turista.id_turista || turista.id,
      id_fecha: item.id_fecha,
      cantidad_personas: item.cantidad_personas,
    };

    const res = await axios.post("http://localhost:8000/api/reservas", payload);
    return res.data;
  };

  // 💳 Pago Payway
  const pagarPayway = async (id_reserva) => {
    const res = await axios.post(
      "http://localhost:8000/api/pagos/payway/iniciar",
      { id_reserva }
    );
    return res.data;
  };

  // 💸 Pago transferencia
  const pagarTransferencia = async (id_reserva) => {
    const res = await axios.post(
      "http://localhost:8000/api/pagos/transferencia",
      {
        id_reserva,
        referencia: referencia || null,
      }
    );
    return res.data;
  };

  // ===========================
  // 🟢 Confirmar y procesar pago
  // ===========================
  const handleConfirmar = async () => {
    try {
      if (!metodo) {
        setMsgError("Seleccioná un método de pago.");
        return;
      }
      if (!item) {
        setMsgError("No hay ítems en el carrito.");
        return;
      }

      setProcesandoPago(true);
      setMsgError("");
      setMsgInfo("Procesando tu pago...");

      await new Promise((r) => setTimeout(r, 2000));

      // 1️⃣ Crear reserva
      const reserva = await crearReserva();
      const id_reserva = reserva.id_reserva;
      const id_excursion = item.id_excursion;
      const id_turista = turista.id_turista || turista.id;

      // 2️⃣ Procesar pago
      if (metodo === "Payway") {
        await pagarPayway(id_reserva);
      } else {
        await pagarTransferencia(id_reserva);
      }

      // 3️⃣ Vaciar carrito en backend y frontend
      try {
        await axios.delete(
          `http://localhost:8000/api/carrito/vaciar/${id_turista}`
        );
      } catch (error) {
        console.warn("⚠️ No se pudo limpiar el carrito en el backend:", error);
      }

      const carritoStore = useCarritoStore.getState();
      carritoStore.clearCarrito(); // 🔹 limpia Zustand + localStorage

      // 4️⃣ SweetAlert + refuerzo limpieza antes de navegar
      await Swal.fire({
        title: "🌿 ¡Un último paso para que tu excursión sea perfecta!",
        text: "Queremos conocer algunos detalles para adaptar tu experiencia.",
        icon: "success",
        confirmButtonText: "Completar ahora",
        confirmButtonColor: "#0e7667",
        background: "#f9f9f9",
        backdrop: `
          rgba(0,0,0,0.4)
          url("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDFwcTl4MW16ZzFiN2tsc2V4ZjFzNWJpbGlzOGdsb3lpMWVxN2R2YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26xBukhP3V2oe3f3O/giphy.gif")
          center
          no-repeat
        `,
      });

      // 🧹 Refuerzo adicional (por si el usuario navega atrás)
      carritoStore.clearCarrito();

      // 5️⃣ Redirigir al formulario de personalización
      navigate(`/reserva/${id_reserva}/personalizacion/${id_excursion}`);
    } catch (err) {
      console.error("Error en el proceso de pago:", err);
      const apiMsg = err?.response?.data?.message;
      setMsgError(apiMsg || "Error al crear la reserva/pago.");
    } finally {
      setProcesandoPago(false);
      setMsgInfo("");
    }
  };

  // ===========================
  // 🧱 Render
  // ===========================
  return (
    <Card className="p-4 shadow-sm">
      <h4 className="mb-3">Elegí cómo pagar</h4>

      {msgError && <Alert variant="danger">{msgError}</Alert>}
      {msgInfo && procesandoPago && <Alert variant="info">{msgInfo}</Alert>}

      {item && (
        <Alert variant="light" className="mb-3">
          <div>
            <h5 className="mb-1 text-success">
              {item.excursion || "Excursión"}
            </h5>
            <p className="mb-1">
              <strong>Fecha:</strong>{" "}
              {item.fecha
                ? new Date(item.fecha).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "No disponible"}
            </p>
            <p className="mb-1">
              <strong>Personas:</strong> {item.cantidad_personas}
            </p>
            <p className="mb-1">
              <strong>Precio por persona:</strong> $
              {item.precio_unitario?.toLocaleString("es-AR") ?? "—"}
            </p>
            <p className="mb-0">
              <strong>Total:</strong> $
              {item.subtotal?.toLocaleString("es-AR") ?? "—"}
            </p>
          </div>
        </Alert>
      )}

      <div className="d-flex gap-3 mb-4">
        <Button
          variant={metodo === "Payway" ? "success" : "outline-success"}
          className="flex-fill"
          onClick={() => setMetodo("Payway")}
          disabled={procesandoPago}
        >
          Payway (tarjetas)
        </Button>
        <Button
          variant={metodo === "Transferencia" ? "success" : "outline-success"}
          className="flex-fill"
          onClick={() => setMetodo("Transferencia")}
          disabled={procesandoPago}
        >
          Transferencia / Depósito
        </Button>
      </div>

      {metodo === "Transferencia" && (
        <div className="border rounded p-3 mb-3">
          <p className="mb-2">
            Transferí el total al <strong>alias</strong>{" "}
            <code>AGENCIATUCUMAN.mp</code> o al <strong>CBU</strong> 000...000
          </p>
          <Form.Control
            placeholder="Nro. de operación / referencia (opcional)"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            disabled={procesandoPago}
          />
        </div>
      )}

      <Button
        variant="success"
        className="w-100"
        onClick={handleConfirmar}
        disabled={procesandoPago || !item}
      >
        {procesandoPago ? (
          <>
            <Spinner as="span" animation="border" size="sm" /> Procesando pago...
          </>
        ) : (
          "Confirmar y pagar"
        )}
      </Button>
    </Card>
  );
}
