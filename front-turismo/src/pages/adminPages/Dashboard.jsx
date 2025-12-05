import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import TuristasCRUD from "./CRUDS/TuristasCRUD";
import ExcursionesCRUD from "./CRUDS/ExcursionesCRUD";
import ReservasCRUD from "./CRUDS/ReservasCRUD";
import UsuariosCRUD from "./CRUDS/UsuariosCRUD";
import ReseñasCRUD from "./CRUDS/ReseniasCRUD";
import FechasCRUD from "./CRUDS/FechasCRUD";
import PagosCRUD from "./CRUDS/PagosCRUD";
import PreguntasCRUD from "./CRUDS/PreguntasCRUD";
import DashboardHome from "./DashboardHome";


const Dashboard = () => {
  return (
    <div className="container-fluid px-0">
      <div className="row g-0">
        {/* Sidebar: ocupa 100% en móviles, y 250px en pantallas md+ */}
        <div className="col-12 col-md-3 col-lg-2 bg-light border-end min-vh-100">
          <Sidebar />
        </div>

        {/* Main content: ocupa el resto del ancho */}
        <div className="col-12 col-md-9 col-lg-10">
          <main className="p-3">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="excursiones/*" element={<ExcursionesCRUD />} />
              <Route path="fechas/*" element={<FechasCRUD />} />
              <Route path="turistas/*" element={<TuristasCRUD />} />
              <Route path="reservas/*" element={<ReservasCRUD />} />
              <Route path="reseñas/*" element={<ReseñasCRUD />} />
              <Route path="usuarios/*" element={<UsuariosCRUD />} />
              <Route path="pagos/*" element={<PagosCRUD />} />
              <Route path="preguntas/*" element={<PreguntasCRUD />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;