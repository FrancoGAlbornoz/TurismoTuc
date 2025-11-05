import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./Components/common/Header";
import Footer from "./Components/common/Footer";
import Home from "./pages/publicPages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/adminPages/Dashboard";
import DashboardGuia from "./pages/adminPages/GuiaPanel/DashboardGuia";
import Catalogo from "./pages/publicPages/Catalogo";
import DetalleExcursion from "./pages/publicPages/DetalleExcursion";
import Error from "./pages/Error";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="/catalogo"
          element={
            <>
              <Header />
              <Catalogo />
              <Footer />
            </>
          }
        />
        <Route
          path="/excursion/:id"
          element={
            <>
              <Header />
              <DetalleExcursion />
              <Footer />
            </>
          }
        />
        <Route
          path="/admin"
          element={
            <>
              <Header />
              <Login />
              <Footer />
            </>
          }
        />

        {/* Panel administrador */}
        <Route
          path="/dashboard-admin/*"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Panel guía turístico */}
        <Route
          path="/dashboard-guia/*"
          element={
            <ProtectedRoute allowedRoles={["Guía turístico"]}>
              <DashboardGuia />
            </ProtectedRoute>
          }
        />

        {/* Página de error */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <Error />
              <Footer />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;