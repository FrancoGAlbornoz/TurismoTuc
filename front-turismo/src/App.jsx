import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import useTuristaStore from "./store/useTuristaStore";
// 🧩 Componentes comunes
import Header from "./Components/common/Header";
import Footer from "./Components/common/Footer";

// 🌍 Páginas públicas
import Home from "./pages/publicPages/Home";
import Catalogo from "./pages/publicPages/Catalogo";
import DetalleExcursion from "./pages/publicPages/DetalleExcursion";
import LoginTurista from "./pages/publicPages/LoginTurista";
import RegisterTurista from "./pages/publicPages/RegisterTurista";
import PerfilTurista from "./pages/publicPages/PerfilTurista";
import Carrito from "./pages/publicPages/Carrito";
import Error from "./pages/Error";

// 🔒 Autenticación y paneles internos
import Login from "./pages/Login";
import ProtectedRoute from "./Components/ProtectedRoute";
import Dashboard from "./pages/adminPages/Dashboard";
import DashboardGuia from "./pages/adminPages/GuiaPanel/DashboardGuia";

function App() {

  /* Inicializar sesión guardada en localStorage */
  const { initSession } = useTuristaStore();

   useEffect(() => {
    initSession();
  }, []);
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

        {/* Login y registro para turistas */}
        <Route
          path="/login-turista"
          element={
            <>
              <Header />
              <LoginTurista />
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
