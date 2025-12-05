import { useState } from "react";
import HeroBanner from "../../Components/publicComponents/Home/HeroBanner";
import CategoryGrid from "../../Components/publicComponents/Home/CategoryGrid";
import SearchResults from "../../Components/publicComponents/Home/SearchResults";
import PromoSection from "../../Components/publicComponents/Home/PromoSection";
import CarrouselPromo from "../../Components/publicComponents/Home/CarrouselPromo"; 

export default function Home() {
  const [resultados, setResultados] = useState([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  return (
    <>
      <HeroBanner
        setResultados={setResultados}
        setBusquedaRealizada={setBusquedaRealizada}
      />
      <SearchResults
        resultados={resultados}
        busquedaRealizada={busquedaRealizada}
      />
      <CategoryGrid />
      <PromoSection />
      <CarrouselPromo />
    </>
  );
}
