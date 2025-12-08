// src/Components/Multimedia/MainMultimedia.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Button, Spinner, Badge } from "react-bootstrap";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const MainMultimedia = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accionLoadingId, setAccionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const fetchPendientes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        "http://localhost:8000/api/multimedia/pendientes"
      );
      setItems(res.data || []);
    } catch (err) {
      console.error("Error al cargar multimedia pendiente:", err);
      setError("No se pudo cargar la lista de multimedia pendiente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  const ejecutarAccion = async (id, tipo) => {
    setError("");

    // ⚠️ Confirmaciones
    if (tipo === "aprobar") {
      const { isConfirmed } = await Swal.fire({
        title: "¿Aprobar foto?",
        text: "La foto será visible en la galería de la excursión.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, aprobar",
        cancelButtonText: "Cancelar",
      });
      if (!isConfirmed) return;
    }

    if (tipo === "eliminar") {
      const { isConfirmed } = await Swal.fire({
        title: "¿Eliminar foto?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });
      if (!isConfirmed) return;
    }

    setAccionLoadingId(id);

    try {
      let url = "";
      let successMsg = "";

      if (tipo === "aprobar") {
        url = `http://localhost:8000/api/multimedia/${id}/aprobar`;
        successMsg = "La foto fue aprobada correctamente.";
      }
      if (tipo === "rechazar") {
        url = `http://localhost:8000/api/multimedia/${id}/rechazar`;
        successMsg = "La foto fue rechazada.";
      }
      if (tipo === "eliminar") {
        url = `http://localhost:8000/api/multimedia/${id}/eliminar`;
        successMsg = "La foto fue eliminada.";
      }

      await axios.put(url);
      await fetchPendientes();

      if (successMsg) {
        Swal.fire({
          icon: "success",
          title: "Operación exitosa",
          text: successMsg,
          showConfirmButton: false,
          timer: 1800,
        });
      }
    } catch (err) {
      console.error(`Error al ${tipo} multimedia:`, err);
      const msg =
        err?.response?.data?.message ||
        `No se pudo ${tipo} la multimedia.`;
      setError(msg);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setAccionLoadingId(null);
    }
  };

  return (
    <div className="container-fluid mt-3">
      <Card className="shadow-sm">
        {/* Header igual estilo que otros CRUDs */}
        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-success fw-bold">Gestión de Multimedia</h5>
          <span className="text-muted small">
            Fotos de reseñas pendientes de moderación
          </span>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" />
              <p className="text-muted mt-2">Cargando multimedia...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3">{error}</div>
          ) : items.length === 0 ? (
            <p className="text-muted text-center m-3">
              No hay fotos pendientes de moderación.
            </p>
          ) : (
            // Tabla responsive como el resto de tus CRUDs
            <Table
              responsive
              hover
              className="mb-0 align-middle"
            >
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Excursión</th>
                  <th>Turista</th>
                  <th>Vista previa</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th style={{ width: "240px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id_multimedia}>
                    <td>{item.id_multimedia}</td>
                    <td>{item.excursion_titulo || "-"}</td>
                    <td>
                      {item.turista_nombre
                        ? `${item.turista_nombre} ${
                            item.turista_apellido || ""
                          }`
                        : "-"}
                    </td>
                    <td>
                      {item.url && (
                        <img
                          src={item.url}
                          alt="Foto reseña"
                          style={{
                            width: "90px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      )}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 220 }}>
                      {item.descripcion || "—"}
                    </td>
                    <td>
                      <Badge bg="warning" text="dark">
                        {item.estado_moderacion}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          disabled={accionLoadingId === item.id_multimedia}
                          onClick={() =>
                            ejecutarAccion(item.id_multimedia, "aprobar")
                          }
                        >
                          <FaCheck className="me-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          disabled={accionLoadingId === item.id_multimedia}
                          onClick={() =>
                            ejecutarAccion(item.id_multimedia, "rechazar")
                          }
                        >
                          <FaTimes className="me-1" />
                          Rechazar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={accionLoadingId === item.id_multimedia}
                          onClick={() =>
                            ejecutarAccion(item.id_multimedia, "eliminar")
                          }
                        >
                          <FaTrash className="me-1" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MainMultimedia;
