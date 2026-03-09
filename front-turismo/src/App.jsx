import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import useTuristaStore from "./store/useTuristaStore";

// 🧩 Componentes comunes
import Header from "./Components/common/Header";
import Footer from "./Components/common/Footer";

// 🌍 Páginas públicas
import Home from "./pages/publicPages/Home";
import Catalogo from "./pages/publicPages/Catalogo";
import DetalleExcursion from "./pages/publicPages/DetalleExcursion";
import Login from "./pages/publicPages/Login";
import RegisterTurista from "./pages/publicPages/RegisterTurista";
import PerfilTurista from "./pages/publicPages/PerfilTurista";
import Carrito from "./pages/publicPages/Carrito";
import Checkout from "./pages/publicPages/Checkout";
import Contacto from "./pages/publicPages/Contacto";
import ForgotPassword from "./pages/publicPages/ForgotPassword";
import ResetPassword from "./pages/publicPages/ResetPassword";
import Error from "./pages/Error";
import CalificarExcursion from "./pages/publicPages/CalificarExcursion";
import PreguntasPersonalizadas from "./pages/publicPages/PregPerzonalizadas";

// 🔒 Autenticación y paneles internos

import ProtectedRoute from "./Components/ProtectedRoute";
import Dashboard from "./pages/adminPages/Dashboard";
import DashboardGuia from "./pages/adminPages/GuiaPanel/DashboardGuia";

function App() {
  const { initSession, hydrated } = useTuristaStore();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const iniciar = async () => {
      await initSession();
      setSessionReady(true);
    };
    iniciar();
  }, [initSession]);

  if (!hydrated || !sessionReady) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-3">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
             RUTAS PÚBLICAS
        ========================== */}
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
          path="/calificar/:id_reserva"
          element={
            <>
              <Header />
              <CalificarExcursion />
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
          path="/perfil-turista"
          element={
            <>
              <Header />
              <PerfilTurista />
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
          path="/carrito"
          element={
            <>
              <Header />
              <Carrito />
              <Footer />
            </>
          }
        />
        <Route
          path="/checkout"
          element={
            <>
              <Header />
              <Checkout />
              <Footer />
            </>
          }
        />

        <Route
          path="/preguntas-personalizadas" element={
            <>
              <Header />
              <PreguntasPersonalizadas />
              <Footer />
            </>
          }
        />

        <Route
          path="/contacto"
          element={
            <>
              <Header />
              <Contacto />
              <Footer />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Header />
              <Login />
              <Footer />
            </>
          }
        />
        <Route
          path="/register-turista"
          element={
            <>
              <Header />
              <RegisterTurista />
              <Footer />
            </>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <>
              <Header />
              <ForgotPassword />
              <Footer />
            </>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <>
              <Header />
              <ResetPassword />
              <Footer />
            </>
          }
        />

        {/* =========================
             RUTAS ADMINISTRATIVAS
        ========================== */}
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
        <Route
          path="/dashboard-admin/*"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-guia/*"
          element={
            <ProtectedRoute allowedRoles={["Guía turístico"]}>
              <DashboardGuia />
            </ProtectedRoute>
          }
        />

        {/* =========================
             PÁGINA DE ERROR
        ========================== */}
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
