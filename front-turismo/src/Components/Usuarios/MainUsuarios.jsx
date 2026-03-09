import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Table, Badge, Form } from "react-bootstrap";
import Swal from "sweetalert2";

const API = "http://localhost:8000/api";

export default function MainUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [status, setStatus] = useState("active"); // active | deleted | all
  const navigate = useNavigate();

  const fetchUsuarios = async (statusParam = status) => {
    try {
      const res = await axios.get(`${API}/usuarios`, {
        params: { status: statusParam },
      });
      setUsuarios(res.data || []);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios.",
      });
    }
  };

  useEffect(() => {
    fetchUsuarios(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleBaja = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Dar de baja usuario?",
      text: "El usuario quedará dado de baja.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.delete(`${API}/usuarios/${id}`);
      await fetchUsuarios(status);

      Swal.fire({
        icon: "success",
        title: "Usuario dado de baja",
        text: "El usuario fue dado de baja correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al dar de baja usuario:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo dar de baja el usuario.",
      });
    }
  };

  const handleRestore = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Restaurar usuario?",
      text: "El usuario volverá a estar activo.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.patch(`${API}/usuarios/${id}/restore`);
      await fetchUsuarios(status);

      Swal.fire({
        icon: "success",
        title: "Usuario restaurado",
        text: "El usuario fue restaurado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al restaurar usuario:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo restaurar el usuario.",
      });
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="fw-bold text-success mb-0">Gestión de Usuarios</h5>

            <div className="d-flex gap-2 align-items-center flex-wrap">
              <Form.Select
                size="sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: 200 }}
              >
                <option value="active">Activos</option>
                <option value="deleted">Dados de baja</option>
                <option value="all">Todos</option>
              </Form.Select>

              <Button
                variant="success"
                size="sm"
                onClick={() => navigate("create")}
              >
                <i className="bi bi-plus-circle me-1"></i> Agregar Usuario
              </Button>
            </div>
          </div>

          <Table hover responsive className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Eliminado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((u) => {
                  const eliminado = Number(u.eliminado) === 1;

                  return (
                    <tr key={u.id_usuario}>
                      <td>{u.id_usuario}</td>
                      <td>
                        {u.nombre} {u.apellido}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.telefono || "—"}</td>
                      <td className="text-uppercase">{u.nombre_rol}</td>

                      <td>
                        <Badge
                          className="text-uppercase"
                          bg={u.estado === "activo" ? "success" : "secondary"}
                        >
                          {u.estado || "pendiente"}
                        </Badge>
                      </td>

                      <td>
                        <Badge bg={eliminado ? "danger" : "success"}>
                          {eliminado ? "BAJA" : "OK"}
                        </Badge>
                      </td>

                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigate(`view/${u.id_usuario}`)}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>

                          {!eliminado && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`edit/${u.id_usuario}`)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          )}

                          {!eliminado ? (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleBaja(u.id_usuario)}
                              title="Dar de baja"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleRestore(u.id_usuario)}
                              title="Restaurar"
                            >
                              <i className="bi bi-arrow-counterclockwise"></i>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}