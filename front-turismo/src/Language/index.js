// src/i18n/i18n.js
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import es from "./es.json";
import en from "./en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: "es",
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    },
  });

// Si querés usar una tasa fija:
const USD_RATE = 1500;
// Formatea según el idioma actual
export const formatCurrency = (amount, currency = "ARS", locale = "es-AR") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};
// Convierte ARS → USD automáticamente si el idioma es inglés
export const getLocalizedPrice = (amountARS, t) => {
  const isEnglish = i18n.language === "en";
  const converted = isEnglish ? amountARS / USD_RATE : amountARS;
  const locale = isEnglish ? "en-US" : "es-AR";
  const currencyKey = isEnglish ? "currency.usd" : "currency.ars";
  const symbol = t(currencyKey);

  return `${formatCurrency(converted, isEnglish ? "USD" : "ARS", locale)} ${symbol}`;
};

export { i18n };
export default i18n;
