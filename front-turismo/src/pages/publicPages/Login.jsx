import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import useTuristaStore from "../../store/useTuristaStore";
import useUserStore from "../../store/useUserStore";
import "../../styles/components/login.css";

export default function LoginTurista() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { turista, setTurista, clearTurista } = useTuristaStore();
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    if (user) {
      const rol = user.rol
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (rol === "administrador") {
        navigate("/dashboard-admin", { replace: true });
      } else if (rol === "guia turistico" || rol === "guía turístico") {
        navigate("/dashboard-guia", { replace: true });
      } else if (rol === "personal de ventas") {
        navigate("/dashboard-empleados", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      return;
    }

    if (turista) {
      navigate("/", { replace: true });
    }
  }, [user, turista, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      if (!res.data.success) {
        setError(res.data.message || "Error al iniciar sesión.");
        return;
      }

      if (res.data.tipo === "turista") {
        const { token, turista } = res.data;

        clearUser();
        setTurista(turista, token);

        await Swal.fire({
          icon: "success",
          title: `¡Bienvenido ${turista.nombre}!`,
          text: "Tu sesión fue iniciada correctamente.",
          confirmButtonColor: "#198754",
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/");
        return;
      }

      if (res.data.tipo === "usuario") {
        const userData = res.data.user;

        clearTurista();
        setUser(userData);

        await Swal.fire({
          icon: "success",
          title: `Bienvenido ${userData.nombre}`,
          text: "Accediendo al panel de administración...",
          confirmButtonColor: "#198754",
          timer: 2000,
          showConfirmButton: false,
        });

        const rol = userData.rol
          ?.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (rol === "administrador") {
          navigate("/dashboard-admin");
        } else if (rol === "guia turistico" || rol === "guía turístico") {
          navigate("/dashboard-guia");
        } else if (rol === "personal de ventas") {
          navigate("/dashboard-empleados");
        } else {
          clearUser();
          setError("No tiene permisos para acceder al panel.");
        }
        return;
      }

      setError("Respuesta inválida del servidor.");
    } catch (err) {
      console.log("Error del backend:", error.response?.data);;
      setError(
        err.response?.data?.message || "Email o contraseña incorrectos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="p-0" style={{ overflow: "hidden" }}>
      <div className="login-page">
        <Row className="justify-content-center w-100">
          <Col xs={12} md={6} lg={4}>
            <Card className="shadow">
              <Card.Body className="p-4">
                <div className="brand mb-3 text-center">
                  <span className="brand-dot"></span>
                  <h1>{t("loginTurista.title")}</h1>
                </div>

                <h4 className="text-center text-success fw-bold mb-4">
                  {t("loginTurista.subtitle")}
                </h4>

                {error && (
                  <Alert variant="danger" className="py-2 text-center">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("loginTurista.email")}</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t("loginTurista.password")}</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="success"
                    className="w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        {t("loginTurista.loading")}
                      </>
                    ) : (
                      t("loginTurista.button")
                    )}
                  </Button>

                  <div className="text-center mt-3">
                    <small>{t("loginTurista.noAccount")}</small>
                    <br />
                    <Button
                      variant="link"
                      className="text-success fw-semibold p-0"
                      onClick={() => navigate("/register-turista")}
                    >
                      {t("loginTurista.createAccount")}
                    </Button>
                  </div>

                  <div className="text-center mt-2">
                    <Button
                      variant="link"
                      className="text-secondary fw-semibold p-0"
                      onClick={() => navigate("/forgot-password")}
                    >
                      {t("loginTurista.forgotPassword")}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
