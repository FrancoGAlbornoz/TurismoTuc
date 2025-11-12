import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Table, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function ViewUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [excursionesConFechas, setExcursionesConFechas] = useState([]);
  const [notificando, setNotificando] = useState(null);

  console.log(setError);
  console.log(setUsuario);
  console.log(setLoading);
  useEffect(() => {
    if (usuario?.nombre_rol?.toLowerCase().includes("guía")) {
      const fetchExcursionesYFechas = async () => {
        try {
          const resExc = await axios.get(`http://localhost:8000/api/excursiones/guia/${id}`);
          const excursiones = resExc.data;

          const detalles = await Promise.all(
            excursiones.map(async (exc) => {
              const resFechas = await axios.get(`http://localhost:8000/api/excursiones/${exc.id_excursion}/fechas`);
              return resFechas.data.map((fecha) => ({
                id_excursion: exc.id_excursion,
                titulo: exc.titulo,
                ubicacion: exc.ubicacion,
                estado: exc.estado,
                notificado: exc.notificado,
                id_fecha: fecha.id_fecha,
                fecha: fecha.fecha,
              }));
            })
          );

          setExcursionesConFechas(detalles.flat());
        } catch (err) {
          console.error("Error al obtener excursiones y fechas:", err);
        }
      };

      fetchExcursionesYFechas();
    }
  }, [usuario]);

  const handleNotificar = async (item) => {
    setNotificando(item.id_fecha);
    try {
      await axios.post(`http://localhost:8000/api/excursiones/notificar/${item.id_excursion}`, {
        fecha: item.fecha,
      });

      Swal.fire("Correo enviado", "El guía fue notificado correctamente.", "success");

      const resExc = await axios.get(`http://localhost:8000/api/excursiones/guia/${id}`);
      const excursiones = resExc.data;

      const detalles = await Promise.all(
        excursiones.map(async (exc) => {
          const resFechas = await axios.get(`http://localhost:8000/api/excursiones/${exc.id_excursion}/fechas`);
          return resFechas.data.map((fecha) => ({
            id_excursion: exc.id_excursion,
            titulo: exc.titulo,
            ubicacion: exc.ubicacion,
            estado: exc.estado,
            id_fecha: fecha.id_fecha,
            fecha: fecha.fecha,
          }));
        })
      );

      setExcursionesConFechas(detalles.flat());
    } catch (err) {
      Swal.fire("Error", "No se pudo enviar el correo.", err);
    } finally {
      setNotificando(null);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando datos del usuario...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center mt-4">{error}</div>;
  }

  if (!usuario) {
    return (
      <div className="alert alert-warning text-center mt-4">
        Usuario no encontrado.
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h5 className="fw-bold text-success mb-3">Información del Usuario</h5>

        <div className="row mb-2">
          <div className="col-md-6">
            <strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}
          </div>
          <div className="col-md-6">
            <strong>Email:</strong> {usuario.email}
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-6">
            <strong>Teléfono:</strong> {usuario.telefono || "—"}
          </div>
          <div className="col-md-6">
            <strong>Rol:</strong> {usuario.nombre_rol}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <strong>Estado:</strong>{" "}
            <span
              className={`badge ${
                usuario.estado === "activo" ? "bg-success" : "bg-secondary"
              }`}
            >
              {usuario.estado}
            </span>
          </div>
        </div>

        <hr />
        
        {usuario.nombre_rol?.toLowerCase().includes("guía") && (
          <div className="mt-4">
            <h5 className="fw-bold text-primary mb-3">Excursiones asignadas</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {excursionesConFechas.map((item) => (
                  <tr key={item.id_fecha}>
                    <td>{item.titulo}</td>
                    <td>{item.ubicacion}</td>
                    <td>{item.estado}</td>
                    <td>{new Date(item.fecha).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={item.notificado || notificando === item.id_fecha}
                        onClick={() => handleNotificar(item)}
                      >
                        {notificando === item.id_fecha ? (
                          <Spinner size="sm" />
                        ) : (
                          "Enviar correo"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <div className="mt-3">
          <button
            className="btn btn-outline-success"
            onClick={() => navigate("/dashboard-admin/usuarios")}
          >
            ← Volver al listado
          </button>
        </div>
      </div>
    </div>
  );
}