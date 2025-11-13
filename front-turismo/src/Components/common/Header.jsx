import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaWhatsapp,
  FaShoppingCart,
  FaUserCircle,
  FaSignOutAlt,
  FaGlobe,
} from "react-icons/fa";
import useTuristaStore from "../../store/useTuristaStore";
import useCarritoStore from "../../store/useCarritoStore";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/components/common/header.css";
import { Dropdown, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import logo from "../../public/LOGOTURISMO.png";

export default function Header() {
  const navigate = useNavigate();
  const { turista, clearTurista } = useTuristaStore();
  const { items, fetchCarrito } = useCarritoStore();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (turista) fetchCarrito();
  }, [turista]);

  const cantidadTotal = items.reduce(
    (acc, i) => acc + Number(i.cantidad_personas || 0),
    0
  );

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    const confirmacion = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true, // ✅ Esto invierte el orden de los botones
    });
  
    if (confirmacion.isConfirmed) {
      clearTurista();
      navigate("/");
    }
  };

  return (
    <>
      {/* HEADER */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top py-3">
        <div className="container-fluid px-4">
          {/* Marca */}
          <Link
            className="navbar-brand fw-bold text-teal d-flex align-items-center gap-2"
            to="/"
          >
            <img src={logo} alt="Logo Turismo" className="header-logo" />
            <span className="brand-text ms-2">{t("brand")}</span>
          </Link>

          {/* Botón hamburguesa móvil */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Contenido colapsable */}
          <div
            className="collapse navbar-collapse justify-content-between"
            id="navbarNav"
          >
            {/* 🔹 Izquierda: saludo */}
            {turista && (
              <span className="fw-semibold text-success small me-3">
                👋{" "}
                {t("hello", {
                  name: turista?.nombre?.split(" ")[0] || "Turista",
                })}
              </span>
            )}

            {/* 🔹 Centro: menú de navegación */}
            <ul className="navbar-nav mx-auto gap-3">
              <li className="nav-item">
                <NavLink className="nav-link fw-semibold" to="/">
                  {t("home")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link fw-semibold" to="/catalogo">
                  {t("catalog")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link fw-semibold" to="/contacto">
                  Contacto
                </NavLink>
              </li>
            </ul>

            {/* 🔹 Derecha */}
            <div className="d-flex align-items-center gap-3">
              {turista ? (
                <>
                  {/* 🌐 Botón idioma toggle */}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center gap-2 px-3 py-2"
                    onClick={toggleLanguage}
                    title="Cambiar idioma"
                  >
                    <FaGlobe />
                    {i18n.language === "es" ? "ES" : "EN"}
                  </Button>

                  {/* 🛒 Carrito */}
                  <Link
                    to="/carrito"
                    className="btn btn-outline-dark d-flex align-items-center gap-2 position-relative px-3 py-2"
                    title="Ver carrito"
                  >
                    <FaShoppingCart size={20} />
                    <span className="fw-semibold">{t("cart")}</span>
                    {cantidadTotal > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cantidadTotal}
                      </span>
                    )}
                  </Link>

                  {/* 👤 Dropdown usuario */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="d-flex align-items-center gap-2 px-3 py-2"
                      id="dropdown-user"
                    >
                      <FaUserCircle size={22} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => navigate("/perfil-turista")}
                      >
                        <FaUserCircle className="me-2 text-primary" />
                        {t("profile") || "Mi perfil"}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        onClick={handleLogout}
                        className="text-danger"
                      >
                        <FaSignOutAlt className="me-2" />
                        {t("logout")}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              ) : (
                <>
                  {/* 🌐 Botón idioma toggle */}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center gap-2 px-3 py-2"
                    onClick={toggleLanguage}
                    title="Cambiar idioma"
                  >
                    <FaGlobe />
                    {i18n.language === "es" ? "ES" : "EN"}
                  </Button>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => navigate("/login-turista")}
                  >
                    {t("login")}
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => navigate("/register-turista")}
                  >
                    {t("register")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 🔹 Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/5493810000000"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        title="Contactar por WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>
    </>
  );
}