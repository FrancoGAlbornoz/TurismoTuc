import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaWhatsapp, FaShoppingCart, FaUserCog, FaUserCircle } from "react-icons/fa";
import useTuristaStore from "../../store/useTuristaStore";
import "../../styles/components/common/header.css";

export default function Header() {
  const navigate = useNavigate();
  const { turista, clearTurista } = useTuristaStore();

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
      <div className="container-fluid px-4">
        {/* Logo + nombre */}
        <Link
          className="navbar-brand fw-bold text-teal d-flex align-items-center gap-2"
          to="/"
        >
          <div className="logo-circle"></div>
          Turismo Tucumán
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

        {/* Menú central */}
        <div
          className="collapse navbar-collapse justify-content-center"
          id="navbarNav"
        >
          <ul className="navbar-nav gap-3">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                INICIO
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/catalogo">
                CATÁLOGO
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Botones derecha */}
        <div className="d-flex align-items-center gap-2">
          {/* ====== LOGIN / REGISTRO ====== */}
          {!turista ? (
            <>
              <button
                className="btn btn-outline-success btn-sm"
                onClick={() => navigate("/login-turista")}
              >
                Iniciar sesión
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => navigate("/register-turista")}
              >
                Registrate
              </button>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold text-success small">
                ¡Hola, {turista.nombre.split(" ")[0]}!
              </span>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  clearTurista();
                  navigate("/");
                }}
              >
                Cerrar sesión
              </button>
              <FaUserCircle
                size={22}
                className="text-success ms-1"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/perfil-turista")}
                title="Mi perfil"
              />
            </div>
          )}

          {/* WhatsApp */}
          <a
            href="https://wa.me/5493810000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-teal btn-sm d-flex align-items-center gap-1"
          >
            <FaWhatsapp /> WhatsApp
          </a>

          {/* Carrito */}
          <Link
            to="/carrito"
            className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1"
          >
            <FaShoppingCart /> Carrito
          </Link>

          {/* Admin */}
          <NavLink
            className="nav-link ms-2 text-secondary opacity-75 small d-flex align-items-center gap-1"
            to="/admin"
            title="Panel administrativo"
          >
            <FaUserCog size={22} />
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
