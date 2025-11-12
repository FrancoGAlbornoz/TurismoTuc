import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Table, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function MainTuristas() {
  const [turistas, setTuristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTuristas = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/turistas");
      setTuristas(res.data);
    } catch (err) {
      console.error("Error al obtener turistas:", err);
      Swal.fire("Error", "No se pudieron cargar los turistas.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTuristas();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "¿Eliminar turista?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/api/turistas/${id}`);
      setTuristas(turistas.filter((t) => t.id_turista !== id));

      await Swal.fire({
        icon: "success",
        title: "Turista eliminado",
        text: "El turista fue eliminado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al eliminar turista:", err);
      Swal.fire("Error", "No se pudo eliminar el turista.", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h5 className="fw-bold text-success mb-2 mb-md-0">Gestión de Turistas</h5>
            <Button
              variant="success"
              size="sm"
              onClick={() => navigate("/dashboard-admin/turistas/create")}
            >
              <i className="bi bi-plus-circle me-1"></i> Agregar Turista
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-3 text-muted">Cargando turistas...</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turistas.length > 0 ? (
                  turistas.map((t) => (
                    <tr key={t.id_turista}>
                      <td>{t.id_turista}</td>
                      <td>{t.nombre} {t.apellido}</td>
                      <td>{t.dni}</td>
                      <td>{t.email}</td>
                      <td>{t.telefono}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigate(`/dashboard-admin/turistas/view/${t.id_turista}`)}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>

                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/dashboard-admin/turistas/edit/${t.id_turista}`)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(t.id_turista)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No hay turistas registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}