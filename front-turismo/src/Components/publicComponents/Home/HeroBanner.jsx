import { useState } from "react";
import axios from "axios";
import "../../../styles/publicComponents/home.css";
import { useTranslation } from "react-i18next";


export default function HeroBanner({ setResultados }) {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");

  const handleBuscar = async () => {
    if (!query.trim()) return;
    try {
      const res = await axios.get(`http://localhost:8000/api/excursiones?q=${query}`);
      setResultados(res.data);
    } catch (err) {
      console.error("Error al buscar excursiones:", err);
    }
  };

   return (
    <section className="hero-section position-relative">
      {/* 🎥 Video de fondo */}
      <video className="hero-video" autoPlay muted loop playsInline>
        <source src="src/public/banner.mp4" type="video/mp4" />
        {t("hero.no_support")}
      </video>

      {/* 🧾 Contenido encima del video */}
      <div className="hero-overlay text-white text-center d-flex flex-column justify-content-center align-items-center px-3">
        <h1 className="display-5 fw-bold">{t("hero.title")}</h1>
        <p className="lead">{t("hero.subtitle")}</p>

        <div className="input-group mt-4" style={{ maxWidth: "500px" }}>
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
    </section>
  );
}