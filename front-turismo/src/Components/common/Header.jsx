import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaWhatsapp,
  FaShoppingCart,
  FaUserCircle,
  FaSignOutAlt,
  FaGlobe,
  FaTools,
} from "react-icons/fa";
import useTuristaStore from "../../store/useTuristaStore";
import useUserStore from "../../store/useUserStore";
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
  const { user, clearUser } = useUserStore();
  const { items, fetchCarrito, clearCarrito } = useCarritoStore();

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (turista) fetchCarrito();
  }, [turista, fetchCarrito]);

  const cantidadTotal = items.reduce(
    (acc, i) => acc + Number(i.cantidad_personas || 0),
    0
  );

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  const getDashboardRoute = () => {
    const rol = user?.rol
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (rol === "administrador") return "/dashboard-admin";
    if (rol === "guia turistico" || rol === "guía turístico") return "/dashboard-guia";
    if (rol === "personal de ventas") return "/dashboard-empleados";

    return "/";
  };

  const handleLogoutTurista = async () => {
    const confirmacion = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (confirmacion.isConfirmed) {
      clearTurista();
      clearCarrito();
      navigate("/");
    }
  };

  const handleLogoutUser = async () => {
    const confirmacion = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas cerrar sesión del panel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (confirmacion.isConfirmed) {
      clearUser();
      navigate("/");
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top py-3">
        <div className="container-fluid px-4">
          <Link
            className="navbar-brand fw-bold text-teal d-flex align-items-center gap-2"
            to="/"
          >
            <img src={logo} alt="Logo Turismo" className="header-logo" />
            <span className="brand-text ms-2">{t("brand")}</span>
          </Link>

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

          <div
            className="collapse navbar-collapse justify-content-between"
            id="navbarNav"
          >
            {/* Izquierda: saludo */}
            <div className="d-flex align-items-center">
              {turista && (
                <span className="fw-semibold text-success small me-3">
                  👋{" "}
                  {t("hello", {
                    name: turista?.nombre?.split(" ")[0] || "Turista",
                  })}
                </span>
              )}

              {user && (
                <span className="fw-semibold text-success small me-3">
                  👋 {user?.nombre || "Usuario"}
                </span>
              )}
            </div>

            {/* Centro: navegación */}
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
                  {t("contact")}
                </NavLink>
              </li>
            </ul>

            {/* Derecha */}
            <div className="d-flex align-items-center gap-3">
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

              {turista ? (
                <>
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

                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="d-flex align-items-center gap-2 px-3 py-2"
                      id="dropdown-user"
                    >
                      <FaUserCircle size={22} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => navigate("/perfil-turista")}>
                        <FaUserCircle className="me-2 text-primary" />
                        {t("myprofile") || "Mi perfil"}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        onClick={handleLogoutTurista}
                        className="text-danger"
                      >
                        <FaSignOutAlt className="me-2" />
                        {t("logout")}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              ) : user ? (
                <>
                  <button
                    className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
                    onClick={() => navigate(getDashboardRoute())}
                  >
                    <FaTools />
                    ADMINISTRAR
                  </button>

                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="d-flex align-items-center gap-2 px-3 py-2"
                      id="dropdown-admin"
                    >
                      <FaUserCircle size={22} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => navigate(getDashboardRoute())}>
                        <FaTools className="me-2 text-success" />
                        Panel
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        onClick={handleLogoutUser}
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
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => navigate("/login")}
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