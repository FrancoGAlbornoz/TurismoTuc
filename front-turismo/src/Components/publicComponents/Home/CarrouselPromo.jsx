import { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

export default function CarrouselExcursiones() {
  const [excursiones, setExcursiones] = useState([]);

  useEffect(() => {
    const fetchExcursiones = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/excursiones`);
        setExcursiones(res.data.data || []);
        console.log("Datos que llegan al carrusel:", res.data.data);
      } catch (err) {
        console.error("Error cargando carrusel:", err);
      }
    };

    fetchExcursiones();
  }, []);

  if (excursiones.length === 0) return null;

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <Carousel interval={3500} fade controls indicators>

        {excursiones.map((exc) => (
          <Carousel.Item key={exc.id_excursion}>
            <Link
              to={`/excursion/${exc.id_excursion}`}
              className="text-decoration-none"
            >
              <div
                style={{
                  width: "100%",
                  height: "420px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Imagen full width */}
                <img
                  src={exc.imagen_url || "/img/no-image.jpg"}
                  alt={exc.titulo}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.7)",
                  }}
                />

                {/* Texto arriba */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "40px",
                    left: "50px",
                    color: "white",
                    textShadow: "0px 0px 12px rgba(0,0,0,0.9)",
                  }}
                >
                  <h2 className="fw-bold">{exc.titulo}</h2>
                </div>
              </div>
            </Link>
          </Carousel.Item>
        ))}

      </Carousel>
    </div>
  );
}
