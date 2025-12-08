import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Table, Badge } from "react-bootstrap";
import Swal from "sweetalert2";

export default function MainUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/usuarios");
        setUsuarios(res.data);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los usuarios.",
        });
      }
    };
    fetchUsuarios();
  }, []);

  const handleDelete = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/api/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== id));
      Swal.fire({
        icon: "success",
        title: "Usuario eliminado",
        text: "El usuario fue eliminado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el usuario.",
      });
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h5 className="fw-bold text-success mb-2 mb-md-0">
              Gestión de Usuarios
            </h5>
            <Button
              variant="success"
              size="sm"
              onClick={() => navigate("create")}
            >
              <i className="bi bi-plus-circle me-1"></i> Agregar Usuario
            </Button>
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td>{u.id_usuario}</td>
                    <td>
                      {u.nombre} {u.apellido}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.telefono || "—"}</td>
                    <td>{u.nombre_rol}</td>
                    <td>
                      <Badge
                        bg={u.estado === "activo" ? "success" : "secondary"}
                      >
                        {u.estado || "pendiente"}
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

                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`edit/${u.id_usuario}`)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(u.id_usuario)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">
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
