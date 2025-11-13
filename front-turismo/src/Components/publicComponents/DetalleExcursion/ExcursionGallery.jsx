import { Carousel, Row, Col, Card } from "react-bootstrap";
import "../../../styles/publicComponents/detalleex.css";
import i18n from "../../../Language/index";
import { useTranslation } from "react-i18next";


export default function ExcursionGallery({ excursion }) {
  const imagenes = excursion?.imagenes || [];
  const {t} = useTranslation(); 

  return (
    <section className="excursion-gallery mt-5 mb-4">
      <h5 className="fw-bold text-teal mb-3">{t("excursionGallery.galleryTitle")}</h5>

      {imagenes.length > 0 ? (
        <Carousel
          variant="dark"
          interval={4000}
          indicators={imagenes.length > 1}
          controls={imagenes.length > 1}
          className="shadow-sm rounded overflow-hidden"
        >
          {imagenes.map((img, index) => (
            <Carousel.Item key={img.id_multimedia || index} interval={6000} pause="hover" indicators={img.length > 1} controls={img.length > 1}>
              <img
                src={img.url}
                alt={img.descripcion || `Imagen ${index + 1}`}
                className="d-block w-100 gallery-image"
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <p className="text-muted">
          {t("excursionGallery.galleryEmpty")}
        </p>
      )}
    </section>
  );
}
