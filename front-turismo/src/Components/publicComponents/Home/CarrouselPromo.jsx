import { useTranslation } from "react-i18next";

export default function PromoSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-light py-5">
      <div className="container text-center">
        <div
          id="promoCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="4000"
        >
          <div className="carousel-inner">
            {/* Imagen 1 */}
            <div className="carousel-item active">
              <img
                src="https://www.tucumanturismo.gob.ar/images/banner-video.webp"
                className="d-block w-100 rounded shadow-sm"
                alt={t("promo.card1.alt")}
              />
            </div>

            {/* Imagen 2 */}
            <div className="carousel-item">
              <img
                src="https://dzt7ishbk7o3v.cloudfront.net/posts/pictures/227/content_Banner_Sitio.png"
                className="d-block w-100 rounded shadow-sm"
                alt={t("promo.card2.alt")}
              />
            </div>

            {/* Imagen 3 */}
            <div className="carousel-item">
              <img
                src="https://template.canva.com/EAGHLWRVtxU/2/0/1600w-M-9JhSgttXk.jpg"
                className="d-block w-100 rounded shadow-sm"
                alt={t("promo.card3.alt")}
              />

            </div>

            {/* Imagen 4 */}
            <div className="carousel-item">
              <img
                src="https://www.tucumanturismo.gob.ar/images/banners/artesano.jpg"
                className="d-block w-100 rounded shadow-sm"
                alt={t("promo.card4.alt")}
              />
            </div>
          </div>

          {/* Indicadores */}
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#promoCarousel" data-bs-slide-to="0" className="active" aria-label="1"></button>
            <button type="button" data-bs-target="#promoCarousel" data-bs-slide-to="1" aria-label="2"></button>
            <button type="button" data-bs-target="#promoCarousel" data-bs-slide-to="2" aria-label="3"></button>
            <button type="button" data-bs-target="#promoCarousel" data-bs-slide-to="3" aria-label="4"></button>
          </div>
        </div>
      </div>
    </section>
  );
}