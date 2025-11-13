import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDeBounce";

/**
 * BuscadorGeneral
 * ----------------
 * Componente reutilizable de búsqueda con debounce.
 * 
 * Props:
 * - onBuscar: función que recibe el valor buscado (string)
 * - placeholder: texto del input (opcional)
 * - delay: tiempo de espera en ms (opcional, default: 500)
 * - label: texto visible arriba del input (opcional)
 * - style: estilos adicionales (opcional)
 */

export default function BuscadorGeneral({
  label,
  placeholder,
  delay = 500,
  onBuscar,
}) {
  const [valor, setValor] = useState("");
  const debouncedValor = useDebounce(valor, delay);

  useEffect(() => {
    onBuscar(debouncedValor.trim());
  }, [debouncedValor, onBuscar]);

  return (
    <div className="mb-2">
      {label && <label className="form-label">{label}</label>}
      <input
        type="text"
        className="form-control form-control-sm"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
    </div>
  );
}