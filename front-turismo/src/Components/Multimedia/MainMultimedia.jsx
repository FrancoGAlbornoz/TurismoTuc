import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Button, Spinner, Badge, Tabs, Tab } from "react-bootstrap";
import { FaCheck, FaTimes, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import PaginationComponent from "../Filtros/Paginacion"; // Asegúrate de tener este componente

const API = "http://localhost:8000";

const isPdf = (url = "") => url.toLowerCase().endsWith(".pdf");

const MainMultimedia = () => {
  const [activeTab, setActiveTab] = useState("resenas");
  const [accionLoadingId, setAccionLoadingId] = useState(null);

  // Estados estructurados para paginación
  const [dataResenas, setDataResenas] = useState({ items: [], totalPages: 1, currentPage: 1 });
  const [dataComprobantes, setDataComprobantes] = useState({ items: [], totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(false);

  const fetchData = async (tab, page = 1) => {
    setLoading(true);
    const endpoint = tab === "resenas" ? "/api/multimedia/pendientes" : "/api/comprobantes/pendientes";
    try {
      const res = await axios.get(`${API}${endpoint}`, { params: { page, limit: 10 } });
      const newState = {
        items: res.data.data || [],
        totalPages: res.data.totalPages || 1,
        currentPage: res.data.currentPage || 1
      };
      
      tab === "resenas" ? setDataResenas(newState) : setDataComprobantes(newState);
    } catch (err) {
      console.error("Error cargando datos:", err);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const ejecutarAccion = async (id, tipo, contexto) => {
    const esComprobante = contexto === "comprobantes";
    const tituloBase = esComprobante ? "comprobante" : "foto";

    const { isConfirmed } = await Swal.fire({
      title: `¿${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${tituloBase}?`,
      icon: tipo === "eliminar" ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed) return;

    setAccionLoadingId(id);
    try {
      const url = esComprobante 
        ? `${API}/api/comprobantes/${id}/${tipo}` 
        : `${API}/api/multimedia/${id}/${tipo}`;
        
      await axios.put(url);
      Swal.fire("Éxito", "Operación realizada correctamente", "success");
      fetchData(activeTab, activeTab === "resenas" ? dataResenas.currentPage : dataComprobantes.currentPage);
    } catch (err) {
      Swal.fire("Error", "No se pudo completar la acción", "error");
    } finally {
      setAccionLoadingId(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <h5 className="mb-0 text-success fw-bold">Gestión de Multimedia</h5>
        </Card.Header>

        <Card.Body className="p-0">
          <Tabs activeKey={activeTab} onSelect={setActiveTab} className="px-3 mb-3">
            <Tab eventKey="resenas" title="Reseñas Pendientes" />
            <Tab eventKey="comprobantes" title="Comprobantes Pendientes" />
          </Tabs>

          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
          ) : (
            <div className="px-3">
              <Table responsive hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>{activeTab === "resenas" ? "Excursión" : "Reserva"}</th>
                    <th>Turista</th>
                    <th>Archivo</th>
                    <th>Estado</th>
                    <th style={{ width: "250px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === "resenas" ? dataResenas.items : dataComprobantes.items).map((item) => (
                    <tr key={item.id_multimedia}>
                      <td>{item.id_multimedia}</td>
                      <td>{item.excursion_titulo || item.id_reserva || "-"}</td>
                      <td>{item.turista_nombre} {item.turista_apellido}</td>
                      <td>
                        {item.url && (
                          <a href={item.url.startsWith("http") ? item.url : `${API}${item.url}`} target="_blank" rel="noreferrer">
                            {isPdf(item.url) ? <Badge bg="secondary"><FaExternalLinkAlt /> Ver PDF</Badge> : 
                              <img src={item.url} style={{width: 50, height: 50, objectFit: 'cover', borderRadius: 4}} alt="prev" />}
                          </a>
                        )}
                      </td>
                      <td><Badge bg="warning" text="dark">{item.estado_moderacion}</Badge></td>
                      <td>
                        <div className="btn-group">
                          <Button size="sm" variant="outline-success" onClick={() => ejecutarAccion(item.id_multimedia, "aprobar", activeTab)} disabled={accionLoadingId === item.id_multimedia}><FaCheck /></Button>
                          <Button size="sm" variant="outline-secondary" onClick={() => ejecutarAccion(item.id_multimedia, "rechazar", activeTab)} disabled={accionLoadingId === item.id_multimedia}><FaTimes /></Button>
                          <Button size="sm" variant="outline-danger" onClick={() => ejecutarAccion(item.id_multimedia, "eliminar", activeTab)} disabled={accionLoadingId === item.id_multimedia}><FaTrash /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <div className="d-flex justify-content-center mt-3">
                <PaginationComponent 
                  currentPage={activeTab === "resenas" ? dataResenas.currentPage : dataComprobantes.currentPage}
                  totalPages={activeTab === "resenas" ? dataResenas.totalPages : dataComprobantes.totalPages}
                  onPageChange={(p) => fetchData(activeTab, p)}
                />
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MainMultimedia;