import { useState } from "react";
import axios from "axios";
import "../../../styles/publicComponents/home.css";
import { useTranslation } from "react-i18next";

export default function HeroBanner({ setResultados, setBusquedaRealizada }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const handleBuscar = async () => {
    if (!query.trim()) {
      setResultados([]);
      setBusquedaRealizada(false);
      return;
    }

    try {
      setBusquedaRealizada(true);
      const res = await axios.get(`http://localhost:8000/api/excursiones?q=${query}`);
      setResultados(res.data);
    } catch (err) {
      console.error("Error al buscar excursiones:", err);
      setResultados([]);
      setBusquedaRealizada(true);
    }
  };

  return (
    <section className="hero-section position-relative">
      {/* 🎥 Video de fondo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="hero-video"
      >
        <source src="https://www.tucumanturismo.gob.ar/video/Tucuman_Tiene_Todo.mp4" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>

      {/* 🧾 Contenido encima del video */}
      <div className="hero-overlay d-flex justify-content-center align-items-center text-white text-center px-3">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <h1 className="fw-bold display-5 mb-3">{t("hero.title")}</h1>
              <p className="lead mb-4">{t("hero.subtitle")}</p>

              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("hero.placeholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                />
                <button className="btn btn-warning" onClick={handleBuscar}>
                  {t("hero.button")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}