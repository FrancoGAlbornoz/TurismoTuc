import { Routes, Route } from "react-router-dom";
import MainPagos from "../../../Components/Pagos/MainPagos";
import ViewPago from "../../../Components/Pagos/ViewPagos";
import EditPagos from "../../../Components/Pagos/EditPagos";

export default function PagosCRUD() {
  return (
    <main>
      <br />
      <Routes>
        <Route path="/" element={<MainPagos />} /> {/* Tabla principal */}
        <Route path="view/:id" element={<ViewPago />} /> {/* Detalle pago */}
        <Route path="edit/:id" element={<EditPagos />} /> {/* ✅ Nueva ruta */}
      </Routes>
    </main>
  );
}
