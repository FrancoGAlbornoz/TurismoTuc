import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { Card, Table, Spinner, Button } from "react-bootstrap";

export default function DashboardHome() {
  const [metricas, setMetricas] = useState(null);
  const [reservasHoy, setReservasHoy] = useState([]);
  const [reservasFuturas, setReservasFuturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricasRes, hoyRes, futurasRes] = await Promise.all([
          axios.get("http://localhost:8000/api/dashboard/metricas"),
          axios.get("http://localhost:8000/api/dashboard/reservas/hoy"),
          axios.get("http://localhost:8000/api/dashboard/reservas/proximas"),
        ]);

        setMetricas(metricasRes.data);
        setReservasHoy(hoyRes.data);
        setReservasFuturas(futurasRes.data);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        setError("No se pudieron cargar los datos del panel.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const imprimirReservasHoy = () => {
    if (!reservasHoy || reservasHoy.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin reservas",
        text: "No hay reservas registradas para hoy.",
        confirmButtonColor: "#198754", // verde bootstrap
      });
      return;
    }

    const now = new Date();
    const fechaLabel = now.toLocaleDateString();
    const horaLabel = now.toLocaleTimeString();

    const doc = new jsPDF({ orientation: "portrait" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Turismo Tucumán - Reporte", 14, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Listado de reservas de hoy", 14, 22);
    doc.text(`Fecha: ${fechaLabel}   Hora: ${horaLabel}`, 14, 28);

    const totalReservas = reservasHoy.length;
    const totalPersonas = reservasHoy.reduce(
      (acc, r) => acc + (Number(r.cantidad_personas) || 0),
      0,
    );

    doc.setFont("helvetica", "bold");
    doc.text("Resumen:", 14, 36);

    doc.setFont("helvetica", "normal");
    doc.text(`• Reservas: ${totalReservas}`, 14, 42);
    doc.text(`• Personas: ${totalPersonas}`, 14, 48);

    autoTable(doc, {
      startY: 56,
      head: [["ID", "Turista", "Excursión", "Personas", "Estado"]],
      body: reservasHoy.map((r) => [
        String(r.id_reserva ?? "-"),
        String(r.turista ?? "-"),
        String(r.excursion ?? "-"),
        String(r.cantidad_personas ?? "-"),
        String(r.estado_reserva ?? "-").toUpperCase(),
      ]),
      styles: { fontSize: 9 },
    });

    doc.save(`reservas_hoy_${now.toISOString().slice(0, 10)}.pdf`);
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="success" />
        <p className="text-muted mt-2">Cargando panel...</p>
      </div>
    );

  if (error)
    return <div className="alert alert-danger text-center mt-4">{error}</div>;

  return (
    <div className="dashboard-content container-fluid mt-4">
      <div className="text-center mb-4">
        <h3 className="fw-bold text-success mb-3">
          👋 Bienvenido al Panel de Administración
        </h3>
        <p className="text-muted mb-0">
          Aquí podés ver un resumen general de la actividad del sistema.
        </p>
      </div>

      {/* --- MÉTRICAS --- */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <Card className="shadow border-0">
            <Card.Body className="text-center">
              <h6 className="fw-bold text-secondary">Reservas Hoy</h6>
              <h2 className="fw-bold text-success">
                {metricas?.reservas_hoy || 0}
              </h2>
              <div className="d-grid mt-2">
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={imprimirReservasHoy}
                >
                  🖨️ Imprimir listado de hoy
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-3 col-sm-6">
          <Card className="shadow border-0">
            <Card.Body className="text-center">
              <h6 className="fw-bold text-secondary">Próximas Reservas</h6>
              <h2 className="fw-bold text-primary">
                {metricas?.reservas_proximas || 0}
              </h2>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-3 col-sm-6">
          <Card className="shadow border-0">
            <Card.Body className="text-center">
              <h6 className="fw-bold text-secondary">Ocupación Total</h6>
              <h2 className="fw-bold text-warning">
                {metricas?.ocupacion || 0}%
              </h2>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-3 col-sm-6">
          <Card className="shadow border-0">
            <Card.Body className="text-center">
              <h6 className="fw-bold text-secondary">Rating Promedio</h6>
              <h2 className="fw-bold text-info">
                {metricas?.rating_promedio || 0}
              </h2>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* --- RESERVAS DE HOY --- */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-success text-white fw-bold">
          Reservas de Hoy
        </Card.Header>
        <Card.Body className="p-0">
          {reservasHoy.length > 0 ? (
            <Table hover responsive className="m-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Turista</th>
                  <th>Excursión</th>
                  <th>Personas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {reservasHoy.map((r, i) => (
                  <tr key={i}>
                    <td>{r.id_reserva}</td>
                    <td>{r.turista}</td>
                    <td>{r.excursion}</td>
                    <td>{r.cantidad_personas}</td>
                    <td>
                      <span
                        className={`badge text-uppercase px-3 py-2 ${
                          r.estado_reserva === "confirmada"
                            ? "bg-success"
                            : r.estado_reserva === "pendiente"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                        }`}
                      >
                        {r.estado_reserva}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center m-3">
              No hay reservas para hoy.
            </p>
          )}
        </Card.Body>
      </Card>

      {/* --- PRÓXIMAS RESERVAS --- */}
      <Card className="shadow-sm mb-5">
        <Card.Header className="bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
          <span>Próximas Reservas (Logística de Contacto)</span>
          <small>Top 10 cronológico</small>
        </Card.Header>
        <Card.Body>
          {reservasFuturas.length > 0 ? (
            <div className="list-group list-group-flush">
              {reservasFuturas.map((r, i) => (
                <div
                  key={i}
                  className="list-group-item d-flex justify-content-between align-items-center py-3"
                >
                  <div className="d-flex flex-column">
                    <span className="fw-bold text-primary">
                      {new Date(r.fecha).toLocaleDateString()} — {r.excursion}
                    </span>
                    <span className="mb-1">👤 {r.turista}</span>
                    <div className="d-flex gap-3 mt-1">
                      {/* Email link */}
                      <small className="text-muted">
                        <i className="bi bi-envelope"></i> {r.email}
                      </small>
                      {/* WhatsApp Link Directo */}
                      <a
                        href={`https://wa.me/${r.telefono?.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-success text-decoration-none small fw-bold"
                      >
                        <i className="bi bi-whatsapp"></i> {r.telefono}
                      </a>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-success d-block mb-1">
                      🚌 {r.cantidad_personas} personas
                    </span>
                    <span className="badge bg-light text-dark border">
                      {r.estado_reserva}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center m-0">
              No hay reservas próximas registradas.
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
