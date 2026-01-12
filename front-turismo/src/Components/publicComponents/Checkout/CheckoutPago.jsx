import { useEffect, useState } from "react";
import { Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import useCarritoStore from "../../../store/useCarritoStore";

export default function CheckoutPago({ turista, onNext }) {
  // Ahora el método por defecto es Transferencia y la referencia es obligatoria
  const [referencia, setReferencia] = useState("");
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgInfo, setMsgInfo] = useState("");
  const navigate = useNavigate();

  const [idCarrito, setIdCarrito] = useState(null);
  const [item, setItem] = useState(null);

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

  const pagarTransferencia = async (id_reserva) => {
    // Se envía la referencia obligatoria al backend
    const res = await axios.post(
      "http://localhost:8000/api/pagos/transferencia",
      {
        id_reserva,
        referencia: referencia, 
      }
    );
    return res.data;
  };

  const handleConfirmar = async () => {
    try {
      // Validación extra de seguridad para la referencia
      if (!referencia.trim()) {
        setMsgError("Por favor, ingresá el número de comprobante o referencia.");
        return;
      }

      setProcesandoPago(true);
      setMsgError("");
      setMsgInfo("Procesando tu pago...");

      await new Promise((r) => setTimeout(r, 2000));

      const reserva = await crearReserva();
      const id_reserva = reserva.id_reserva;
      const id_excursion = item.id_excursion;
      const id_turista = turista.id_turista || turista.id;

      // Se procesa únicamente mediante transferencia
      await pagarTransferencia(id_reserva);

      try {
        await axios.delete(
          `http://localhost:8000/api/carrito/vaciar/${id_turista}`
        );
      } catch (error) {
        console.warn("⚠️ No se pudo limpiar el carrito en el backend:", error);
      }

      const carritoStore = useCarritoStore.getState();
      carritoStore.clearCarrito();

      await Swal.fire({
        title: "🌿 ¡Un último paso para que tu excursión sea perfecta!",
        text: "Queremos conocer algunos detalles para adaptar tu experiencia.",
        icon: "success",
        confirmButtonText: "Completar ahora",
        confirmButtonColor: "#0e7667",
        background: "#f9f9f9",
      });

      carritoStore.clearCarrito();
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

  return (
    <Card className="p-4 shadow-sm">
      <h4 className="mb-3 text-success">Pago por Transferencia</h4>

      {msgError && <Alert variant="danger">{msgError}</Alert>}
      {msgInfo && procesandoPago && <Alert variant="info">{msgInfo}</Alert>}

      {item && (
        <Alert variant="light" className="mb-3 border">
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
            <p className="mb-0">
              <strong>Total a transferir:</strong> $
              {item.subtotal?.toLocaleString("es-AR") ?? "—"}
            </p>
          </div>
        </Alert>
      )}

      <div className="border rounded p-3 mb-3 bg-light">
        <p className="mb-2">
          Transferí el total al <strong>alias</strong>{" "}
          <code>AGENCIATUCUMAN.mp</code> o al <strong>CBU</strong> 000...000
        </p>
        <Form.Group>
          <Form.Label className="fw-bold">Nro. de operación / referencia *</Form.Label>
          <Form.Control 
            required
            placeholder="Ingresá el comprobante aquí"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            disabled={procesandoPago}
            isInvalid={!referencia && msgError.includes("comprobante")}
          />
          <Form.Control.Feedback type="invalid">
            Este campo es obligatorio para confirmar tu reserva.
          </Form.Control.Feedback>
        </Form.Group>
      </div>

      <Button
        variant="success"
        className="w-100"
        onClick={handleConfirmar}
        // El botón se deshabilita si no hay referencia escrita
        disabled={procesandoPago || !item || !referencia.trim()}
      >
        {procesandoPago ? (
          <>
            <Spinner as="span" animation="border" size="sm" /> Procesando pago...
          </>
        ) : (
          "Confirmar y enviar comprobante"
        )}
      </Button>
    </Card>
  );
}