import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Error = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.badge}>404</div>

        <h1 style={styles.title}>Página no encontrada</h1>
        <p style={styles.subtitle}>
          La ruta que intentaste abrir no existe o fue movida. Probá volver al inicio o
          explorar el catálogo.
        </p>

        <div style={styles.actions}>
          <button style={styles.primaryBtn} onClick={() => navigate("/")}>
            Volver al inicio
          </button>

          <Link to="/catalogo" style={styles.secondaryBtn}>
            Ir al catálogo
          </Link>
        </div>

        <div style={styles.hint}>
          <span style={styles.hintDot}>•</span>
          Si llegaste acá desde un link, avisame y lo corregimos.
        </div>
      </div>
    </div>
  );
};


const styles = {
  wrapper: {
    minHeight: "calc(100vh - 160px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    background:
      "linear-gradient(135deg, rgba(16, 126, 108, 0.10), rgba(0,0,0,0.02))",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    background: "#fff",
    borderRadius: 16,
    padding: "28px 24px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    padding: "0 14px",
    borderRadius: 999,
    background: "rgba(16, 126, 108, 0.12)",
    color: "#0f7e6c",
    fontWeight: 800,
    letterSpacing: 1,
    marginBottom: 12,
  },
  title: {
    margin: "0 0 8px",
    fontSize: 34,
    lineHeight: 1.15,
    color: "#111827",
  },
  subtitle: {
    margin: "0 0 18px",
    fontSize: 16,
    lineHeight: 1.55,
    color: "#4b5563",
    maxWidth: 560,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 6,
  },
  primaryBtn: {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    background: "#0f7e6c",
    color: "#fff",
    fontWeight: 700,
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: "10px 14px",
    textDecoration: "none",
    border: "1px solid rgba(15, 126, 108, 0.35)",
    color: "#0f7e6c",
    fontWeight: 700,
  },
  hint: {
    marginTop: 18,
    fontSize: 13,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  hintDot: { color: "#0f7e6c" },
};

export default Error;