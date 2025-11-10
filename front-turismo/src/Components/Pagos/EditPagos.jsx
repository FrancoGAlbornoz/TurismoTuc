import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Card, Alert } from "react-bootstrap";

export default function EditPagos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pago, setPago] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [referencia, setReferencia] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPago = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/pagos");
        const encontrado = res.data.find((p) => p.id_pago === Number(id));
        if (encontrado) {
          setPago(encontrado);
          setNuevoEstado(encontrado.estado_pago);
          setReferencia(encontrado.referencia || "");
        }
      } catch (err) {
        console.error("Error al obtener pago:", err);
        setError("No se pudo cargar la información del pago.");
      }
    };
    fetchPago();
  }, [id]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/pagos/${id}`, {
        nuevo_estado: nuevoEstado,
        referencia,
      });
      setMensaje("Pago actualizado correctamente.");
      setTimeout(() => navigate("/dashboard-admin/pagos"), 1500);
    } catch (err) {
      console.error("Error al actualizar pago:", err);
      setError("No se pudo guardar el cambio.");
    }
  };

  if (error) return <Alert variant="danger" className="mt-4">{error}</Alert>;
  if (!pago) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <Card className="shadow-sm p-4 mt-4">
      <h4 className="fw-bold text-success mb-3">Editar Pago</h4>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      <Form onSubmit={handleGuardar}>
        <Form.Group className="mb-3">
          <Form.Label>Estado del pago</Form.Label>
          <Form.Select
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Referencia / Comprobante</Form.Label>
          <Form.Control
            type="text"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Ej: 1234-ABC o #transferencia"
          />
        </Form.Group>

        <Button variant="success" type="submit" className="me-2">
          Guardar cambios
        </Button>
        <Link to="/dashboard-admin/pagos" className="btn btn-outline-secondary">
          Cancelar
        </Link>
      </Form>
    </Card>
  );
}
