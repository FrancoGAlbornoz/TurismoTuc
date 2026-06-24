import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Button, Spinner, Badge, Tabs, Tab, Form } from "react-bootstrap";
import { FaCheck, FaTimes, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import PaginationComponent from "../Filtros/Paginacion";

const API = "http://localhost:8000";

const isPdf = (url = "") => url.toLowerCase().endsWith(".pdf");

const MainMultimedia = () => {
  const [activeTab, setActiveTab] = useState("resenas");
  const [accionLoadingId, setAccionLoadingId] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("pendiente"); // 👈 NUEVO ESTADO PARA EL FILTRO

  const [dataResenas, setDataResenas] = useState({ items: [], totalPages: 1, currentPage: 1 });
  const [dataComprobantes, setDataComprobantes] = useState({ items: [], totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(false);

  const fetchData = async (tab, page = 1) => {
    setLoading(true);
    const endpoint = tab === "resenas" ? "/api/multimedia/pendientes" : "/api/comprobantes/pendientes";
    try {
      // Pasamos el estado al backend
      const res = await axios.get(`${API}${endpoint}`, { params: { page, limit: 10, estado: estadoFiltro } });
      
      const arrayDatos = Array.isArray(res.data) ? res.data : (res.data.data || []);
      const newState = {
        items: arrayDatos,
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

  // Recarga los datos cuando cambiás de pestaña o cambiás el filtro
  useEffect(() => {
    fetchData(activeTab, 1);
  }, [activeTab, estadoFiltro]);

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
      // Recargamos en la misma página que estábamos
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
        <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0 text-success fw-bold">Gestión de Multimedia</h5>
          
          {/* 👈 NUEVO: SELECTOR DE ESTADO */}
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small fw-semibold">Mostrar:</span>
            <Form.Select 
              size="sm" 
              value={estadoFiltro} 
              onChange={(e) => setEstadoFiltro(e.target.value)} 
              style={{ width: '150px' }}
            >
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
              <option value="todas">Todas</option>
            </Form.Select>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <Tabs activeKey={activeTab} onSelect={setActiveTab} className="px-3 mb-3">
            <Tab eventKey="resenas" title="Reseñas (Fotos)" />
            <Tab eventKey="comprobantes" title="Comprobantes (Transferencias)" />
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
                    <th style={{ width: "200px" }} className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === "resenas" ? dataResenas.items : dataComprobantes.items).map((item) => {
                    const isPendiente = item.estado_moderacion === "pendiente";
                    
                    return (
                      <tr key={item.id_multimedia}>
                        <td>{item.id_multimedia}</td>
                        <td>{item.excursion_titulo || item.id_reserva || "-"}</td>
                        <td>{item.turista_nombre} {item.turista_apellido}</td>
                        <td>
                          {item.url && (
                            <a href={item.url.startsWith("http") ? item.url : `${API}${item.url}`} target="_blank" rel="noreferrer">
                              {isPdf(item.url) ? <Badge bg="secondary"><FaExternalLinkAlt /> Ver PDF</Badge> : 
                                <img src={item.url.startsWith("http") ? item.url : `${API}${item.url}`} style={{width: 50, height: 50, objectFit: 'cover', borderRadius: 4}} alt="prev" />}
                            </a>
                          )}
                        </td>
                        <td>
                          <Badge bg={item.estado_moderacion === 'aprobada' ? 'success' : item.estado_moderacion === 'rechazada' ? 'danger' : 'warning'} text={item.estado_moderacion === 'pendiente' ? 'dark' : 'light'} className="text-uppercase">
                            {item.estado_moderacion}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            {/* Si ya está aprobada/rechazada, ocultamos estos botones */}
                            {isPendiente && (
                              <>
                                <Button size="sm" variant="outline-success" title="Aprobar" onClick={() => ejecutarAccion(item.id_multimedia, "aprobar", activeTab)} disabled={accionLoadingId === item.id_multimedia}><FaCheck /></Button>
                                <Button size="sm" variant="outline-secondary" title="Rechazar" onClick={() => ejecutarAccion(item.id_multimedia, "rechazar", activeTab)} disabled={accionLoadingId === item.id_multimedia}><FaTimes /></Button>
                              </>
                            )}
                            <Button size="sm" variant="outline-danger" title="Eliminar (Baja lógica)" onClick={() => ejecutarAccion(item.id_multimedia, "eliminar", activeTab)} disabled={accionLoadingId === item.id_multimedia}><FaTrash /></Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {(activeTab === "resenas" ? dataResenas.items : dataComprobantes.items).length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No se encontraron archivos multimedia para este estado.
                      </td>
                    </tr>
                  )}
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