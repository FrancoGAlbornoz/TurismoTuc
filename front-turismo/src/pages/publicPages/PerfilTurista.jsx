import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Form,
  Table,
  Badge,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useTuristaStore from "../../store/useTuristaStore";

// --- IMPORT PAGINACIÓN ---
import Paginacion from "../../Components/Filtros/Paginacion";

// --- NUEVOS IMPORTS PARA EL VOUCHER ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PerfilTurista() {
  const { turista, token, setTurista, initSession, hydrated } = useTuristaStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  
  // --- ESTADOS PARA PAGINACIÓN Y DATOS ---
  const [reservas, setReservas] = useState([]);
  const [mostrarFinalizadas, setMostrarFinalizadas] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
    nacionalidad: "",
  });

  const navigate = useNavigate();
  const turistaId = turista?.id_turista || turista?.id;

  // 1. Inicializar sesión desde localStorage
  useEffect(() => {
    initSession();
  }, [initSession]);

  // 2. Si ya terminó de hidratar y no hay turista, redirigir al login
  useEffect(() => {
    if (!hydrated) return;
    if (!turista) {
      navigate("/login", { replace: true });
    }
  }, [hydrated, turista, navigate]);

  // 3. Inicializar datos del formulario
  useEffect(() => {
    if (turista) {
      setFormData({
        nombre: turista.nombre || "",
        apellido: turista.apellido || "",
        dni: turista.dni || "",
        email: turista.email || "",
        telefono: turista.telefono || "",
        direccion: turista.direccion || "",
        nacionalidad: turista.nacionalidad || "",
      });
    }
  }, [turista]);

  // 4. Fetch Reservas conectado a la API con paginación real
  useEffect(() => {
    const fetchReservas = async () => {
      if (!turistaId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/turistas/${turistaId}/reservas?historial=${mostrarFinalizadas}&page=${currentPage}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Leemos la estructura enviada por el nuevo Back-end
        const data = res.data;
        
        setReservas(data.reservas || []);
        setTotalPages(data.totalPages || 1);
        setTotalRegistros(data.totalRegistros || 0);
      } catch (err) {
        console.error("Error al cargar reservas:", err);
        setError("No se pudieron cargar tus reservas.");
      } finally {
        setLoading(false);
      }
    };

    if (hydrated) {
      fetchReservas();
    }
  }, [turistaId, token, hydrated, mostrarFinalizadas, currentPage]);

  // --- HANDLERS ---
  const handleSwitchChange = (e) => {
    setMostrarFinalizadas(e.target.checked);
    setCurrentPage(1); // Reiniciar paginación al cambiar de vista
  };

  const handleCancelarReserva = async (idReserva) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se cancelará tu lugar y se liberará el cupo para otros turistas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cancelar reserva",
      cancelButtonText: "No, volver",
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/reservas/${idReserva}/cancelar`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Actualizamos estado localmente
        setReservas((prev) =>
          prev.map((r) =>
            r.id_reserva === idReserva
              ? { ...r, estado_reserva: "cancelada" }
              : r
          )
        );

        Swal.fire("¡Éxito!", "La reserva ha sido cancelada.", "success");
      } catch (err) {
        console.error("Error al cancelar:", err);
        Swal.fire("Error", "No se pudo cancelar la reserva.", "error");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!turistaId) return;

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/turistas/${turistaId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const turistaActualizado = res.data.turista || res.data;
      setTurista(turistaActualizado);
      setEditMode(false);

      Swal.fire("¡Éxito!", "Tus datos han sido actualizados.", "success");
    } catch (err) {
      console.error("Error al actualizar:", err);
      Swal.fire("Error", "No se pudo actualizar el perfil.", "error");
    }
  };

  const handleDescargarVoucher = (r) => {
    try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(25, 135, 84);
      doc.text("MAAVYT TURISMO", 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        "Rivadavia 1051, San Miguel de Tucumán",
        105,
        27,
        { align: "center" }
      );
      doc.line(20, 33, 190, 33);

      autoTable(doc, {
        startY: 45,
        head: [["Detalles del Pasajero", "Detalles del Viaje"]],
        body: [
          [
            `Nombre: ${turista?.nombre} ${turista?.apellido}`,
            `Excursión: ${r.excursion_nombre}`,
          ],
          [`DNI: ${turista?.dni}`, `Guía: ${r.guia_nombre || "A asignar"}`],
          [
            `Email: ${turista?.email}`,
            `Fecha: ${new Date(r.fecha_salida).toLocaleDateString()}`,
          ],
          [
            `Tel: ${turista?.telefono || "-"}`,
            `Hora: ${r.hora_salida?.slice(0, 5) || "--:--"} hs`,
          ],
        ],
        headStyles: { fillColor: [25, 135, 84] },
        theme: "grid",
      });

      doc.save(`Voucher_Maavyt_${r.id_reserva}.pdf`);
    } catch (err) {
      console.error("Error PDF:", err);
      Swal.fire("Error", "No se pudo generar el archivo.", "error");
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-2 text-success">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2 className="fw-bold text-success display-6 mb-1">
          ¡Hola, {turista?.nombre}! 👋
        </h2>
        <p className="text-muted fs-5">
          Gestioná tu información y revisá tus últimas aventuras.
        </p>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}
      </div>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-success mb-0">
                  <i className="bi bi-person-lines-fill me-2"></i>Mis Datos
                </h5>
                {!editMode && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    <i className="bi bi-pencil-square"></i> Editar
                  </Button>
                )}
              </div>

              {editMode ? (
                <Form onSubmit={handleUpdate}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">Nombre</Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">Apellido</Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData.apellido}
                      onChange={(e) =>
                        setFormData({ ...formData, apellido: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">Teléfono</Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">
                      Domicilio / Dirección
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      value={formData.direccion}
                      onChange={(e) =>
                        setFormData({ ...formData, direccion: e.target.value })
                      }
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button variant="success" size="sm" type="submit">
                      Guardar Cambios
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => setEditMode(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Form>
              ) : (
                <div className="text-dark">
                  <p className="mb-2">
                    <strong>Nombre:</strong> {turista?.nombre}{" "}
                    {turista?.apellido}
                  </p>
                  <p className="mb-2">
                    <strong>Email:</strong> {turista?.email}
                  </p>
                  <p className="mb-2">
                    <strong>Teléfono:</strong> {turista?.telefono || "-"}
                  </p>
                  <p className="mb-0">
                    <strong>Domicilio:</strong>{" "}
                    {turista?.direccion || "No especificado"}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-success">
                <i className="bi bi-journal-check me-2"></i>Mis Reservas
              </h5>

              <div className="d-flex align-items-center gap-3">
                <Form.Check 
                  type="switch"
                  id="historial-switch"
                  label="Ver historial"
                  checked={mostrarFinalizadas}
                  onChange={handleSwitchChange}
                />
                <Badge bg="success" pill>
                  Total: {totalRegistros}
                </Badge>
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              <Alert
                variant="warning"
                className="m-3 border-0 shadow-sm d-flex align-items-center"
              >
                <i className="bi bi-clock-history me-3 fs-4 text-warning"></i>
                <div>
                  <strong>¡Recordatorio importante!</strong> Deberás presentarte
                  en nuestra agencia (Rivadavia 1051), con una identificación,
                  en el horario pactado.
                </div>
              </Alert>

              <Table hover responsive className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3 text-success">Excursión</th>
                    <th className="text-success">Guía</th>
                    <th className="text-success">Fecha / Hora</th>
                    <th className="text-success text-center">Estado</th>
                    <th className="text-success text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {reservas.length > 0 ? (
                    reservas.map((r) => (
                      <tr key={r.id_reserva}>
                        <td className="ps-3 py-3">
                          <div className="fw-bold">{r.excursion_nombre}</div>
                          <small className="text-muted">
                            {r.cantidad_personas} personas
                          </small>
                        </td>

                        <td>
                          <div className="small fw-semibold text-primary">
                            <i className="bi bi-person-badge me-1"></i>
                            {r.guia_nombre || "Por asignar"}
                          </div>
                        </td>

                        <td>
                          <div className="small fw-bold">
                            {new Date(r.fecha_salida).toLocaleDateString("es-AR")}
                          </div>
                          <div className="small text-muted">
                            {r.hora_salida?.slice(0, 5) || "--:--"} hs
                          </div>
                        </td>

                        <td className="text-center">
                          <Badge
                            bg={
                              r.estado_reserva === "confirmada"
                                ? "success"
                                : r.estado_reserva === "pendiente"
                                ? "warning text-dark"
                                : r.estado_reserva === "finalizada"
                                ? "primary"
                                : r.estado_reserva === "cancelada"
                                ? "danger"
                                : "secondary"
                            }
                          >
                            {(r.estado_reserva || "Pendiente").toUpperCase()}
                          </Badge>
                        </td>

                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {r.estado_reserva !== "cancelada" && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-pill"
                                onClick={() => handleDescargarVoucher(r)}
                                title="Descargar Voucher PDF"
                              >
                                <i className="bi bi-file-earmark-pdf"></i>
                              </Button>
                            )}

                            {(r.estado_reserva === "pendiente" ||
                              r.estado_reserva === "confirmada") && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="rounded-pill"
                                onClick={() =>
                                  handleCancelarReserva(r.id_reserva)
                                }
                                title="Cancelar Reserva"
                              >
                                <i className="bi bi-x-circle"></i>
                              </Button>
                            )}

                            {r.estado_reserva === "finalizada" && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="rounded-pill"
                                onClick={() =>
                                  navigate(`/calificar/${r.id_reserva}`)
                                }
                              >
                                <i className="bi bi-star-fill me-1"></i>{" "}
                                Calificar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        Aún no tienes reservas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              <div className="p-3">
                <Paginacion
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  maxVisible={5}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}