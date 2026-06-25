import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Button, Badge, Spinner, Dropdown, Form, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import BuscadorGeneral from "../Filtros/BuscadorGeneral"; 
import PaginationComponent from "../Filtros/Paginacion"; 
import * as XLSX from "xlsx";

export default function MainPagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtros
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const params = {
        page: paginaActual,
        limit: 10,
        estado: filtroEstado !== "todos" ? filtroEstado : null,
        q: busqueda,
        fechaDesde,
        fechaHasta,
      };

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/pagos`, {
        params,
      });
      setPagos(res.data.data || []);
      setTotalPaginas(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error al obtener pagos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Resetear a pág 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, busqueda, fechaDesde, fechaHasta]);

  useEffect(() => {
    fetchPagos();
  }, [paginaActual, filtroEstado, busqueda, fechaDesde, fechaHasta]);

  const exportToExcel = () => {
    if (pagos.length === 0) {
      return Swal.fire("Sin datos", "No hay datos para exportar", "info");
    }
    const ws = XLSX.utils.json_to_sheet(pagos.map(p => ({
      ID: p.id_pago,
      Turista: `${p.turista_nombre} ${p.turista_apellido}`,
      Metodo: p.metodo,
      Monto: p.monto,
      Estado: p.estado_pago,
      Reserva: p.id_reserva,
      Fecha: p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString() : "-"
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagos");
    XLSX.writeFile(wb, "Pagos_Export.xlsx");
  };

  const actualizarEstado = async (id_pago, nuevo_estado) => {
    const confirm = await Swal.fire({
      title: `¿Confirmar ${nuevo_estado}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/pagos/${id_pago}`, {
        nuevo_estado,
      });
      fetchPagos();
      Swal.fire("Éxito", "Estado actualizado", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-3">
          {/* Cabecera con Filtros y Buscador */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h5 className="fw-bold text-success mb-2">Gestión de Pagos</h5>
              {/* Usamos tu componente estandarizado */}
              <div style={{ maxWidth: "250px" }}>
                <BuscadorGeneral
                  placeholder="Turista o método..."
                  onBuscar={(val) => setBusqueda(val)}
                />
              </div>
            </div>

            {/* Estilo idéntico a Excursiones/Turistas */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <InputGroup size="sm" style={{ width: "auto" }}>
                <InputGroup.Text><i className="bi bi-calendar-event me-1"></i> Desde</InputGroup.Text>
                <Form.Control type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
              </InputGroup>
              
              <InputGroup size="sm" style={{ width: "auto" }}>
                <InputGroup.Text><i className="bi bi-calendar-event-fill me-1"></i> Hasta</InputGroup.Text>
                <Form.Control type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
              </InputGroup>
              
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-primary" size="sm">
                  <i className="bi bi-funnel"></i> Filtrar estado:{" "}
                  {filtroEstado.toUpperCase()}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {["pendiente", "aprobado", "rechazado"].map(
                    (est) => (
                      <Dropdown.Item
                        key={est}
                        onClick={() => setFiltroEstado(est)}
                      >
                        {est.charAt(0).toUpperCase() + est.slice(1)}
                      </Dropdown.Item>
                    ),
                  )}
                </Dropdown.Menu>
              </Dropdown>
              
              <Button variant="outline-success" size="sm" onClick={exportToExcel} title="Exportar a Excel">
                <i className="bi bi-file-earmark-excel"></i> Excel
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Turista</th>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Reserva</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id_pago}>
                    <td>{p.id_pago}</td>
                    <td>
                      {p.turista_nombre} {p.turista_apellido}
                    </td>
                    <td>{p.metodo}</td>
                    <td>${Number(p.monto).toLocaleString("es-AR")}</td>
                    <td>
                      <Badge
                        bg={
                          p.estado_pago === "aprobado"
                            ? "success"
                            : p.estado_pago === "pendiente"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {p.estado_pago.toUpperCase()}
                      </Badge>
                    </td>
                    <td>{p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString() : "-"}</td>
                    <td>{p.id_reserva}</td>
                    <td>
                      {p.estado_pago === "pendiente" && (
                        <div className="btn-group">
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() =>
                              actualizarEstado(p.id_pago, "aprobado")
                            }
                          >
                            <i className="bi bi-check2"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() =>
                              actualizarEstado(p.id_pago, "rechazado")
                            }
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <PaginationComponent
            currentPage={paginaActual}
            totalPages={totalPaginas}
            onPageChange={setPaginaActual}
          />
        </Card.Body>
      </Card>
    </div>
  );
}
