import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Table, Badge, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

const API = "http://localhost:8000/api";

export default function MainUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsuarios = async (statusParam = status) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/usuarios`, {
        params: { status: statusParam },
      });
      setUsuarios(res.data || []);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios(status);
  }, [status]);

  const handleBaja = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Dar de baja usuario?",
      text: "El usuario ya no podrá acceder al sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.delete(`${API}/usuarios/${id}`);
      await fetchUsuarios(status);
      Swal.fire("Usuario dado de baja", "", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo dar de baja.", "error");
    }
  };

  const handleRestore = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Restaurar usuario?",
      text: "El usuario recuperará su acceso.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, restaurar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.patch(`${API}/usuarios/${id}/restore`);
      await fetchUsuarios(status);
      Swal.fire("Usuario restaurado", "", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo restaurar.", "error");
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="fw-bold text-success mb-0">Gestión de Usuarios</h5>
            <div className="d-flex gap-2 align-items-center">
              <Form.Select size="sm" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 160 }}>
                <option value="active">Activos</option>
                <option value="deleted">Dados de baja</option>
                <option value="all">Todos</option>
              </Form.Select>
              <Button variant="success" size="sm" onClick={() => navigate("create")}>
                <i className="bi bi-plus-circle me-1"></i> Agregar
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" variant="success" /></div>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((u) => {
                    const eliminado = Number(u.eliminado) === 1;
                    return (
                      <tr key={u.id_usuario}>
                        <td>{u.id_usuario}</td>
                        <td>{u.nombre} {u.apellido}</td>
                        <td>{u.email}</td>
                        <td>{u.telefono || "—"}</td>
                        <td className="text-uppercase">{u.nombre_rol}</td>
                        <td>
                          <Badge bg={eliminado ? "danger" : "success"}>
                            {eliminado ? "BAJA" : "ACTIVO"}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <Button variant="outline-secondary" size="sm" onClick={() => navigate(`view/${u.id_usuario}`)}>
                              <i className="bi bi-eye"></i>
                            </Button>
                            {!eliminado ? (
                              <>
                                <Button variant="outline-primary" size="sm" onClick={() => navigate(`edit/${u.id_usuario}`)}>
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleBaja(u.id_usuario)}>
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </>
                            ) : (
                              <Button variant="outline-success" size="sm" onClick={() => handleRestore(u.id_usuario)}>
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
                    <td colSpan="7" className="text-center py-3 text-muted">No hay usuarios registrados</td>
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