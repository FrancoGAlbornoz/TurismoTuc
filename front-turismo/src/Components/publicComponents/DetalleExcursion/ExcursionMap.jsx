import "../../../styles/publicComponents/detalleex.css"
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function ExcursionMap({ excursion }) {
  const { t } = useTranslation();

  return (
    <section className="excursion-map my-5">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-bold text-teal mb-3">{t("mapa.titulo")}</h5>

          {excursion.ubicacion ? (
            <div className="map-placeholder rounded">
              <iframe
                title={t("mapa.titulo")}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  excursion.ubicacion
                )}&output=embed`}
                width="100%"
                height="350"
                style={{
                  border: 0,
                  borderRadius: "8px",
                }}
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="map-placeholder bg-light rounded d-flex align-items-center justify-content-center">
              <p className="text-muted mb-0">{t("mapa.sin_mapa")}</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </section>
  );
}
