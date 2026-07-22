import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { Card, Table, Spinner, Button, Form } from "react-bootstrap";
import * as XLSX from "xlsx-js-style";

export default function DashboardHome() {
  const [metricas, setMetricas] = useState(null);
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [reservasFuturas, setReservasFuturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricasRes, hoyRes, futurasRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/metricas`),
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/reservas/pendientes`),
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/reservas/proximas`),
        ]);

        setMetricas(metricasRes.data);
        setReservasPendientes(hoyRes.data);
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

  const descargarExcelMes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dashboard/reservas/mes/${anioSeleccionado}/${mesSeleccionado}`
      );
      const reservas = response.data;

      if (!reservas || reservas.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin reservas",
          text: "No hay reservas registradas para el mes seleccionado.",
          confirmButtonColor: "#198754",
        });
        return;
      }

      const dataToExport = reservas.map((r) => ({
        ID: r.id_reserva,
        Turista: r.turista,
        Excursión: r.excursion,
        "Fecha Excursión": new Date(r.fecha_excursion).toLocaleDateString(),
        "Hora Salida": r.hora_salida,
        Personas: r.cantidad_personas,
        Estado: r.estado_reserva?.toUpperCase(),
        "Fecha Reserva": new Date(r.fecha_reserva).toLocaleDateString(),
      }));

      // 1. Crear hoja vacía
      const ws = XLSX.utils.json_to_sheet([]);
      
      // 2. Agregar Título Principal en A1
      const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const nombreMes = meses[mesSeleccionado - 1];
      const tituloStr = `Reporte de Reservas - Turismo Tucumán (${nombreMes} ${anioSeleccionado})`;
      XLSX.utils.sheet_add_aoa(ws, [[tituloStr]], { origin: "A1" });

      // 3. Agregar los datos reales a partir de la fila 3 (A3)
      XLSX.utils.sheet_add_json(ws, dataToExport, { origin: "A3" });

      // 4. Fusionar (Merge) celdas para el título (Fila 1, de A hasta H)
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }
      ];

      // 5. Autofilter para las columnas de datos
      const range = XLSX.utils.decode_range(ws['!ref']);
      ws['!autofilter'] = { ref: `A3:H${range.e.r + 1}` };

      // Estilos Base
      const titleStyle = {
        font: { bold: true, sz: 16, color: { rgb: "198754" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      const headerStyle = {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "D1E7DD" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          top: { style: "thin", color: { rgb: "A3CFBB" } }, 
          bottom: { style: "thin", color: { rgb: "A3CFBB" } },
          left: { style: "thin", color: { rgb: "A3CFBB" } },
          right: { style: "thin", color: { rgb: "A3CFBB" } }
        }
      };

      const cellStyle = {
        alignment: { horizontal: "left", vertical: "center" },
        border: { bottom: { style: "thin", color: { rgb: "E9ECEF" } } }
      };

      // 6. Aplicar Estilos Celda por Celda
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
          if (!ws[cellRef]) continue;

          if (R === 0) {
            // Título Principal
            ws[cellRef].s = titleStyle;
          } else if (R === 2) {
            // Encabezados (Fila 3)
            ws[cellRef].s = headerStyle;
          } else if (R > 2) {
            // Datos Normales
            let currentStyle = { ...cellStyle };

            // Colores Dinámicos para el 'Estado' (Columna G, índice 6)
            if (C === 6) {
              const valorEstado = ws[cellRef].v;
              currentStyle.font = { bold: true };
              if (valorEstado === "CONFIRMADA") {
                currentStyle.font.color = { rgb: "198754" }; // Verde
                currentStyle.fill = { fgColor: { rgb: "D1E7DD" } };
              } else if (valorEstado === "PENDIENTE") {
                currentStyle.font.color = { rgb: "FD7E14" }; // Naranja
                currentStyle.fill = { fgColor: { rgb: "FFE6CD" } };
              } else if (valorEstado === "CANCELADA" || valorEstado === "RECHAZADA") {
                currentStyle.font.color = { rgb: "DC3545" }; // Rojo
                currentStyle.fill = { fgColor: { rgb: "F8D7DA" } };
              }
              currentStyle.alignment = { horizontal: "center", vertical: "center" };
            }

            ws[cellRef].s = currentStyle;
          }
        }
      }

      // 7. Ajustar Ancho de Columnas
      ws['!cols'] = [
        { wch: 8 },  // ID
        { wch: 25 }, // Turista
        { wch: 30 }, // Excursión
        { wch: 18 }, // Fecha Excursión
        { wch: 12 }, // Hora
        { wch: 10 }, // Personas
        { wch: 15 }, // Estado
        { wch: 18 }, // Fecha Reserva
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reservas");
      XLSX.writeFile(wb, `Reservas_${anioSeleccionado}_${mesSeleccionado}.xlsx`);
    } catch (err) {
      console.error("Error al descargar excel:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al descargar el reporte.",
      });
    }
  };

  const imprimirReservasPendientes = () => {
    if (!reservasPendientes || reservasPendientes.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin reservas",
        text: "No hay reservas pendientes.",
        confirmButtonColor: "#198754",
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
    doc.text("Listado de Reservas Pendientes", 14, 22);
    doc.text(`Fecha: ${fechaLabel}   Hora: ${horaLabel}`, 14, 28);

    const totalReservas = reservasPendientes.length;
    const totalPersonas = reservasPendientes.reduce(
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
      head: [["ID", "Turista", "Excursión", "Reservada el", "Viaja el", "Personas"]],
      body: reservasPendientes.map((r) => [
        String(r.id_reserva ?? "-"),
        String(r.turista ?? "-"),
        String(r.excursion ?? "-"),
        new Date(r.fecha_reserva).toLocaleDateString(),
        new Date(r.fecha_excursion).toLocaleDateString(),
        String(r.cantidad_personas ?? "-"),
      ]),
      styles: { fontSize: 9 },
    });

    doc.save(`reservas_pendientes_${now.toISOString().slice(0, 10)}.pdf`);
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
        <div className="col-md-2 col-sm-6">
          <Card className="shadow border-0 h-100">
            <Card.Body className="text-center d-flex flex-column justify-content-between">
              <div>
                <h6 className="fw-bold text-secondary">Reservas Hoy</h6>
                <h2 className="fw-bold text-success">
                  {metricas?.reservas_hoy || 0}
                </h2>
              </div>
              <div className="d-grid mt-2">
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={imprimirReservasPendientes}
                >
                  🖨️ Imprimir Pendientes
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-2 col-sm-6">
          <Card className="shadow border-0 h-100">
            <Card.Body className="text-center d-flex flex-column justify-content-center">
              <h6 className="fw-bold text-secondary">Próximas Reservas</h6>
              <h2 className="fw-bold text-primary mb-0">
                {metricas?.reservas_proximas || 0}
              </h2>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-2 col-sm-6">
          <Card className="shadow border-0 h-100">
            <Card.Body className="text-center d-flex flex-column justify-content-center">
              <h6 className="fw-bold text-secondary">Ocupación Total</h6>
              <h2 className="fw-bold text-warning mb-0">
                {metricas?.ocupacion || 0}%
              </h2>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-2 col-sm-6">
          <Card className="shadow border-0 h-100">
            <Card.Body className="text-center d-flex flex-column justify-content-center">
              <h6 className="fw-bold text-secondary">Rating Promedio</h6>
              <h2 className="fw-bold text-info mb-0">
                {metricas?.rating_promedio || 0}
              </h2>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-2 col-sm-6">
          <Card className="shadow border-0 h-100">
            <Card.Body className="text-center d-flex flex-column justify-content-center">
              <h6 className="fw-bold text-secondary">Turistas Totales</h6>
              <h2 className="fw-bold text-dark mb-0">
                {metricas?.turistas_totales || 0}
              </h2>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-2 col-sm-6">
          <Card className="shadow border-0 h-100">
            <Card.Body className="text-center d-flex flex-column justify-content-between">
              <div>
                <h6 className="fw-bold text-secondary mb-2">Reporte Mensual</h6>
                <div className="d-flex gap-1 mb-2">
                  <Form.Select 
                    size="sm" 
                    value={mesSeleccionado} 
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                  >
                    {[...Array(12).keys()].map(i => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </Form.Select>
                  <Form.Select 
                    size="sm" 
                    value={anioSeleccionado} 
                    onChange={(e) => setAnioSeleccionado(e.target.value)}
                  >
                    {[2024, 2025, 2026, 2027].map(anio => (
                      <option key={anio} value={anio}>{anio}</option>
                    ))}
                  </Form.Select>
                </div>
              </div>
              <div className="d-grid">
                <Button
                  variant="success"
                  size="sm"
                  onClick={descargarExcelMes}
                >
                  <i className="bi bi-file-earmark-excel"></i> Descargar Excel
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* --- RESERVAS PENDIENTES --- */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-warning text-dark fw-bold">
          Reservas Pendientes de Acción
        </Card.Header>
        <Card.Body className="p-0">
          {reservasPendientes.length > 0 ? (
            <Table hover responsive className="m-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Turista / Contacto</th>
                  <th>Excursión</th>
                  <th>Reservada el</th>
                  <th>Viaja el</th>
                  <th>Personas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {reservasPendientes.map((r, i) => (
                  <tr key={i}>
                    <td>{r.id_reserva}</td>
                    <td>
                      <div className="fw-bold">{r.turista}</div>
                      <div className="small mt-1 d-flex flex-column gap-1">
                        {r.telefono && (
                          <a
                            href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-success text-decoration-none fw-bold"
                          >
                            <i className="bi bi-whatsapp"></i> {r.telefono}
                          </a>
                        )}
                        {r.email && (
                          <a
                            href={`mailto:${r.email}`}
                            className="text-muted text-decoration-none"
                          >
                            <i className="bi bi-envelope"></i> {r.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td>{r.excursion}</td>
                    <td>
                      <small className="text-muted">
                        {new Date(r.fecha_reserva).toLocaleDateString()}
                      </small>
                    </td>
                    <td>{new Date(r.fecha_excursion).toLocaleDateString()}</td>
                    <td>{r.cantidad_personas}</td>
                    <td>
                      <span className="badge bg-warning text-dark border text-uppercase px-3 py-2">
                        {r.estado_reserva}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center m-3">
              No hay reservas pendientes de acción.
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
                    <span
                      className={`badge border text-uppercase ${
                        r.estado_reserva === "confirmada"
                          ? "bg-success text-white"
                          : r.estado_reserva === "pendiente"
                            ? "bg-warning text-dark"
                            : "bg-danger text-white"
                      }`}
                    >
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
