import { Tab, Nav } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../../../styles/publicComponents/detalleex.css"

export default function ExcursionTabs({ excursion }) {
  const { t } = useTranslation()

  return (
    <section className="excursion-tabs mb-4">
      <Tab.Container defaultActiveKey="itinerario">
        <Nav variant="tabs" className="mb-3 justify-content-start flex-wrap">
          <Nav.Item>
            <Nav.Link eventKey="itinerario" className="fw-semibold">
              {t("tabs.itinerario")}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="incluye" className="fw-semibold">
              {t("tabs.incluye")}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="itinerario">
            <p className="text-secondary small mb-1">
              📍 <strong>{t("tabs.punto_partida")}:</strong> {excursion.ubicacion}
            </p>
            <p>{excursion.itinerario || excursion.descripcion}</p>
          </Tab.Pane>

          <Tab.Pane eventKey="incluye">
            {excursion.incluye ? (
              <ul className="list-unstyled">
                {excursion.incluye.split(",").map((item, i) => (
                  <li key={i} className="mb-1">
                    ✅ {item.trim()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">{t("tabs.no_disponible")}</p>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </section>
  );
}
