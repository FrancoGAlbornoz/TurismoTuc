import { useTranslation } from "react-i18next";

export default function SearchResults({ resultados, busquedaRealizada }) {
  const { t } = useTranslation();

  // Si no se buscó nada aún → no mostrar nada
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
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{exc.titulo}</h5>
                  <p className="card-text">
                    {exc.descripcion?.slice(0, 100)}...
                  </p>
                  <p className="text-success fw-bold">${exc.precio_base}</p>
                  <button className="btn btn-outline-success btn-sm">
                    {t("search.boton")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
