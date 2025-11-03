import "../../../styles/publicComponents/home.css";

export default function CategoryGrid() {
  const categorias = [
    { nombre: "Aire libre", icono: "bi-tree" },
    { nombre: "Histórico", icono: "bi-bank" },
    { nombre: "Astronómico", icono: "bi-stars" },
    { nombre: "Gastronómico", icono: "bi-cup-straw" },
    { nombre: "Cultura", icono: "bi-book" },
  ];

  return (
    <section className="container py-5">
      <h4 className="text-center fw-bold mb-4">Explorá por categoría</h4>
      <div className="row justify-content-center">
        {categorias.map((cat, i) => (
          <div key={i} className="col-6 col-md-2 mb-3 text-center">
            <button className="btn btn-outline-success w-100 py-3">
              <i className={`bi ${cat.icono} fs-4 d-block mb-2`}></i>
              {cat.nombre}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}