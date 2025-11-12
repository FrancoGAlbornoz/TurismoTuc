import { FaWhatsapp, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaUserCog } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../styles/components/common/footer.css";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer mt-auto py-4 bg-teal text-white">
      <div className="container-fluid px-md-5 px-3">
        <div className="row gy-4">
          {/* Columna 1 - Branding */}
          <div className="col-md-4 text-center text-md-start">
            <h5 className="fw-bold mb-2">{t("footer.brand.titulo")}</h5>
            <p className="small mb-0">{t("footer.brand.descripcion")}</p>
          </div>

          {/* Columna 2 - Enlaces útiles */}
          <div className="col-md-4 text-center">
            <h6 className="fw-bold mb-2">{t("footer.enlaces.titulo")}</h6>
            <ul className="list-unstyled small">
              <li><a href="/catalogo">{t("footer.enlaces.catalogo")}</a></li>
              <li><a href="/contacto">{t("footer.enlaces.contacto")}</a></li>
              <li><a href="/politicas">{t("footer.enlaces.politicas")}</a></li>
            </ul>
          </div>

          {/* Columna 3 - Contacto */}
          <div className="col-md-4 text-center text-md-end">
            <h6 className="fw-bold mb-2">{t("footer.contacto.titulo")}</h6>
            <p className="small mb-1">
              <FaMapMarkerAlt className="me-2" />
              {t("footer.contacto.direccion")}
            </p>
            <p className="small mb-1">
              <FaEnvelope className="me-2" />
              {t("footer.contacto.email")}
            </p>
            <p className="small mb-0">
              <FaPhoneAlt className="me-2" />
              {t("footer.contacto.telefono")}
            </p>
          </div>
        </div>

        {/* Separador */}
        <hr className="my-3 border-light opacity-50" />

        {/* Copyright + Admin */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-center text-md-start">
          <p className="mb-2 mb-md-0">{t("footer.copyright")}</p>

          <Link
            to="/admin"
            className="text-white-50 d-inline-flex align-items-center gap-2"
            title={t("footer.admin.titulo")}
          >
            <FaUserCog size={16} />
            {t("footer.admin.link")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
