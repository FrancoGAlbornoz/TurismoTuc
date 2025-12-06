import React from "react";
import { Routes, Route } from "react-router-dom";
import MainMultimedia from "../../../Components/Multimedia/MainMultimedia.jsx"

const MultimediaCRUD = () => {
  return (
    <main>
      <br />
      <Routes>
        {/* Por ahora sólo la vista principal con la lista de fotos pendientes */}
        <Route path="/" element={<MainMultimedia />} />
        {/* Si algún día querés un view/edit, acá agregás más rutas */}
      </Routes>
    </main>
  );
};

export default MultimediaCRUD;
