import { useTranslation } from "react-i18next";

export default function PromoSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-light py-5">
      <div className="container text-center">
        <h4 className="fw-bold mb-3">{t("promo.titulo")}</h4>
        <p className="lead mb-4">{t("promo.descripcion")}</p>
        <div className="row justify-content-center">
          <div className="col-md-4 mb-3">
            <div className="p-3 border rounded shadow-sm">
              <i className="bi bi-person-check fs-2 text-success mb-2"></i>
              <h6 className="fw-bold">{t("promo.card1.titulo")}</h6>
              <p className="text-muted">{t("promo.card1.texto")}</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="p-3 border rounded shadow-sm">
              <i className="bi bi-compass fs-2 text-success mb-2"></i>
              <h6 className="fw-bold">{t("promo.card2.titulo")}</h6>
              <p className="text-muted">{t("promo.card2.texto")}</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="p-3 border rounded shadow-sm">
              <i className="bi bi-whatsapp fs-2 text-success mb-2"></i>
              <h6 className="fw-bold">{t("promo.card3.titulo")}</h6>
              <p className="text-muted">{t("promo.card3.texto")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
