import { useEffect, useState } from "react";
import { Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import useCarritoStore from "../../../store/useCarritoStore";

export default function CheckoutPago({ turista }) {
  const [idCarrito, setIdCarrito] = useState(null);
  const [referencia, setReferencia] = useState("");
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [msgError, setMsgError] = useState("");
  const [msgInfo, setMsgInfo] = useState("");
  const navigate = useNavigate();

  // CAMBIO 1: Manejamos 'items' (plural, array) en lugar de 'item'
  const [items, setItems] = useState([]);

  useEffect(() => {
    const cargarCarrito = async () => {
      try {
        setMsgError("");
        const id_turista = turista.id_turista || turista.id;

        const carRes = await axios.get(
          `http://localhost:8000/api/carrito/${id_turista}`,
        );

        if (!carRes.data) {
          setMsgInfo("Tu carrito está vacío.");
          useCarritoStore.getState().clearCarrito();
          return;
        }

        const itemsRes = await axios.get(
          `http://localhost:8000/api/carrito/${carRes.data.id_carrito}/items`,
        );

        if (!itemsRes.data || itemsRes.data.length === 0) {
          setMsgInfo("Tu carrito está vacío. Volvé al catálogo.");
          return;
        }

        // CAMBIO 2: Guardamos TODO el array de excursiones
        setItems(itemsRes.data);

        setIdCarrito(carRes.data.id_carrito);
      } catch (e) {
        console.error(e);
        setMsgError("No se pudo obtener el carrito.");
      }
    };

    cargarCarrito();
  }, [turista]);

  const handleConfirmar = async () => {
    // Validación: referencia obligatoria
    if (!referencia.trim()) {
      setMsgError("Por favor, ingresá el número de comprobante.");
      return;
    }

    setProcesandoPago(true);
    setMsgError("");
    setMsgInfo("Procesando tus reservas...");

    const id_turista = turista.id_turista || turista.id;
    const reservasConfirmadas = []; // Aquí acumularemos los IDs generados

    try {
      // CAMBIO 3: Bucle para procesar CADA ítem del carrito
      for (const item of items) {
        // A. Crear Reserva individual
        const payloadReserva = {
          id_turista,
          id_fecha: item.id_fecha,
          cantidad_personas: item.cantidad_personas,
        };
        const resReserva = await axios.post(
          "http://localhost:8000/api/reservas",
          payloadReserva,
        );
        const nuevoIdReserva = resReserva.data.id_reserva;

        // B. Registrar Pago para esa reserva
        await axios.post("http://localhost:8000/api/pagos/transferencia", {
          id_reserva: nuevoIdReserva,
          referencia: referencia,
        });

        // C. Guardar datos para la siguiente pantalla
        reservasConfirmadas.push({
          id_reserva: nuevoIdReserva,
          id_excursion: item.id_excursion,
          nombre_excursion: item.excursion,
        });
      }

      // Limpieza del carrito al finalizar todo el bucle
      try {
        await axios.delete(
          `http://localhost:8000/api/carrito/vaciar/${id_turista}`,
        );
      } catch (error) {
        console.warn("No se pudo limpiar carrito en backend", error);
      }
      useCarritoStore.getState().clearCarrito();

      // Mensaje de éxito
      await Swal.fire({
        title: "¡Pago exitoso!",
        text: "Tus reservas fueron confirmadas. Ahora personalicemos tu experiencia.",
        icon: "success",
        confirmButtonColor: "#0e7667",
      });

      // CAMBIO 4: Navegación pasando el ARRAY de reservas (no por URL, sino por state)
      navigate("/preguntas-personalizadas", {
        state: { reservasRealizadas: reservasConfirmadas },
      });
    } catch (err) {
      console.error("Error en pago:", err);
      setMsgError(
        "Hubo un error al procesar las reservas. Verificá tu conexión.",
      );
    } finally {
      setProcesandoPago(false);
      setMsgInfo("");
    }
  };

  const crearReservasPendientes = async () => {
    const id_turista = turista.id_turista || turista.id;
    const ids = [];

    for (const item of items) {
      const res = await axios.post("http://localhost:8000/api/reservas", {
        id_turista,
        id_fecha: item.id_fecha,
        cantidad_personas: item.cantidad_personas,
        monto_total: item.subtotal,
      });

      ids.push(res.data.id_reserva);
    }

    setReservasPendientes(ids);
    return ids;
  };

  const handlePagarMercadoPago = async () => {
    try {
      setProcesandoPago(true);
      setMsgError("");
      setMsgInfo("Preparando reservas...");

      // 1️⃣ Crear reservas
      const reservasIds = await crearReservasPendientes();

      setMsgInfo("Redirigiendo a Mercado Pago...");

      const mpItems = items.map((it) => {
        const cantidad = Number(it.cantidad_personas);
        const subtotal = Number(it.subtotal);

        return {
          nombre: it.excursion,
          cantidad: cantidad,
          precio: Number((subtotal / cantidad).toFixed(2)),
        };
      });

      const response = await axios.post(
        "http://localhost:8000/api/pagos/crear-pago",
        {
          items: mpItems,
          id_turista: turista.id_turista || turista.id,
          reservas: reservasIds,
        },
      );

      window.location.href = response.data.init_point;
    } catch (error) {
      console.error("Error Mercado Pago:", error);
      setMsgError("No se pudo iniciar el pago con Mercado Pago.");
    } finally {
      setProcesandoPago(false);
      setMsgInfo("");
    }
  };

  const totalGeneral = items.reduce(
    (acc, it) => acc + Number(it.subtotal || 0),
    0,
  );

  return (
    <Card className="p-4 shadow-sm">
      <h4 className="mb-3 text-success">Pago por Transferencia</h4>

      {msgError && <Alert variant="danger">{msgError}</Alert>}
      {msgInfo && <Alert variant="info">{msgInfo}</Alert>}

      {/* CAMBIO 5: Renderizar lista completa de ítems */}
      {items.length > 0 ? (
        items.map((it, idx) => (
          <Alert key={idx} variant="light" className="mb-2 border p-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong className="text-success">{it.excursion}</strong>
                <div className="small text-muted">
                  {it.fecha
                    ? new Date(it.fecha).toLocaleDateString("es-AR")
                    : ""}{" "}
                  - {it.cantidad_personas} pers.
                </div>
              </div>
              <span className="fw-bold">
                ${it.subtotal?.toLocaleString("es-AR")}
              </span>
            </div>
          </Alert>
        ))
      ) : (
        <p>Cargando detalles...</p>
      )}

      <div className="text-end mb-3">
        <h5>
          Total a transferir:{" "}
          <span className="text-success">
            ${totalGeneral.toLocaleString("es-AR")}
          </span>
        </h5>
      </div>

      {/* === TRANSFERENCIA === */}
      <div className="border rounded p-3 mb-3 bg-light">
        <p className="mb-2">
          Transferí al Alias: <strong>AGENCIATUCUMAN.mp</strong>
        </p>
        <Form.Group>
          <Form.Label className="fw-bold small">
            Nro. de comprobante *
          </Form.Label>
          <Form.Control
            required
            placeholder="Ingresá el comprobante aquí"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            disabled={procesandoPago}
          />
        </Form.Group>
      </div>

      <Button
        variant="success"
        className="w-100 mb-2"
        onClick={handleConfirmar}
        disabled={procesandoPago || items.length === 0 || !referencia.trim()}
      >
        {procesandoPago ? (
          <Spinner as="span" animation="border" size="sm" />
        ) : (
          "Confirmar por transferencia"
        )}
      </Button>

      <hr />

      {/* === MERCADO PAGO === */}
      <Button
        variant="primary"
        className="w-100"
        onClick={handlePagarMercadoPago}
        disabled={procesandoPago || items.length === 0}
      >
        {procesandoPago ? (
          <Spinner as="span" animation="border" size="sm" />
        ) : (
          "Pagar con Mercado Pago"
        )}
      </Button>
    </Card>
  );
}
