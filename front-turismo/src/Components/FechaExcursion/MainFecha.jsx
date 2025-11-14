import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function MainFechasExcursion() {
  const [excursiones, setExcursiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFechas = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/excursiones/con-fechas");
      setExcursiones(res.data);
    } catch (err) {
      console.error("Error al obtener excursiones con fechas:", err);
      Swal.fire("Error", "No se pudieron cargar las fechas.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFechas();
  }, []);

  const handleCerrar = async (id_fecha) => {
  const confirmar = await Swal.fire({
    title: "¿Cerrar fecha?",
    text: "No se eliminará, pero ya no podrá reservarse.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Cerrar fecha",
    cancelButtonText: "Cancelar",
  });

  if (!confirmar.isConfirmed) return;

  try {
    const res = await axios.delete(`http://localhost:8000/api/excursiones/fechas/${id_fecha}`);
    console.log(res);
    Swal.fire({
      icon: "success",
      title: "Fecha cerrada",
      text: "La fecha ya no estará disponible para reservas.",
      timer: 2000,
      showConfirmButton: false,
    });

    fetchFechas();
  } catch (err) {
    Swal.fire("Error", "No se pudo cerrar la fecha.", err);
  }
};


  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h5 className="fw-bold text-primary mb-2 mb-md-0">
              Fechas de Excursiones
            </h5>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/dashboard-admin/fechas/create")}
            >
              <i className="bi bi-calendar-plus me-1"></i> Nueva Fecha
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando fechas...</p>
            </div>
          ) : excursiones.length > 0 ? (
            excursiones.map((e) => (
              <div key={e.id_excursion} className="mb-4">
                <h6 className="fw-bold text-success">{e.titulo}</h6>
                <Table
                  bordered
                  responsive
                  hover
                  size="sm"
                  className="align-middle"
                >
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Cupo</th>
                      <th>Disponible</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {e.fechas.length > 0 ? (
                      e.fechas.map((f) => (
                        <tr key={f.id_fecha}>
                          <td>{new Date(f.fecha).toLocaleDateString()}</td>
                          <td>{f.hora_salida || "—"}</td>
                          <td>{f.cupo_maximo}</td>
                          <td>{f.cupo_disponible}</td>
                          <td>
                            <span
                              className={`badge ${
                                f.estado === "abierta"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {f.estado}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/dashboard-admin/fechas/edit/${f.id_fecha}`
                                  )
                                }
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleCerrar(f.id_fecha)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-muted text-center">
                          Sin fechas registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            ))
          ) : (
            <p className="text-muted">No hay excursiones registradas</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}