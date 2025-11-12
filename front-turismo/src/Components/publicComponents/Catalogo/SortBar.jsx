// Components/publicComponents/Catalogo/SortBar.jsx
import { useTranslation } from "react-i18next";

export default function SortBar({ onSortChange }) {
  const { t } = useTranslation();

  return (
    <div className="sort-bar">
      <select
        className="form-select"
        onChange={(e) => onSortChange(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          {t("sortBar.sortBy")}
        </option>
        <option value="precio_asc">{t("sortBar.priceLowHigh")}</option>
        <option value="precio_desc">{t("sortBar.priceHighLow")}</option>
        <option value="fecha_nueva">{t("sortBar.newest")}</option>
        <option value="fecha_vieja">{t("sortBar.oldest")}</option>
      </select>
    </div>
  );
}

