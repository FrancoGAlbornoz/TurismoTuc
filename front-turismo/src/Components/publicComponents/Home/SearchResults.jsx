import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SearchResults({ resultados, busquedaRealizada }) {
  const { t } = useTranslation();

  if (!busquedaRealizada) return null;

  return (
    <section className="container py-5">
      <h4 className="fw-bold mb-4">{t("search.titulo")}</h4>

      {resultados.length === 0 ? (
        <div className="text-center py-5">
          <span className="text-muted fs-5">
            No se encontraron excursiones relacionadas con tu búsqueda.
          </span>
        </div>
      ) : (
        <div className="row">
          {resultados.map((exc) => (
            <div key={exc.id_excursion} className="col-md-4 mb-4">
              <Link
                to={`/excursion/${exc.id_excursion}`}
                className="text-decoration-none"
              >
                <div className="card h-100 shadow-sm">
                  
                  {/* Imagen */}
                  <div style={{ height: "180px", overflow: "hidden" }}>
                    <img
                      src={exc.imagen_url || "/img/no-image.jpg"}
                      alt={exc.titulo}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  {/* Cuerpo */}
                  <div className="card-body">
                    <h5 className="card-title text-dark">{exc.titulo}</h5>
                    <p className="card-text text-muted">
                      {exc.descripcion?.slice(0, 100)}...
                    </p>

                    <p className="text-success fw-bold">
                      ${Number(exc.precio_base).toLocaleString("es-AR")}
                    </p>

                    <button className="btn btn-outline-success btn-sm">
                      Ver más
                    </button>
                  </div>

                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
