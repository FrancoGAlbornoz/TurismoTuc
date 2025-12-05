import { Carousel, Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../../../styles/publicComponents/detalleex.css";

export default function ReseñasCarousel({ id_excursion }) {
  const { t } = useTranslation()
  const [reseñas, setReseñas] = useState([]);

  useEffect(() => {
    const fetchReseñas = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/resenias/excursion/${id_excursion}`);
        setReseñas(res.data);
      } catch (error) {
        console.error("Error al cargar reseñas:", error);
      }
    };
    fetchReseñas();
  }, [id_excursion]);

  if (reseñas.length === 0)
    return (
      <Container className="reseñas-carousel">
        <h4 className="mb-3 text-teal">{t("reseñaCarrusel.title")}</h4>
        <p className="text-muted">{t("reseñaCarrusel.noReviews")}</p>
      </Container>
    );

  return (
    <Container className="reseñas-carousel">
      <h4 className="mb-4 text-teal">{t("reviews.title")}</h4>
      <Carousel
        variant="dark"
        interval={6000}
        pause="hover"
        indicators={reseñas.length > 1}
        controls={reseñas.length > 1}
      >
        {reseñas.map((r, index) => (
          <Carousel.Item key={index}>
            <div className="reseña-card">
              <p className="reseña-text">“{r.comentario}”</p>
              <p className="reseña-author">
                ⭐ {r.puntuacion}/5 — {r.nombre_turista}
              </p>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
}
