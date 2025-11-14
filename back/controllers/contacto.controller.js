import nodemailer from "nodemailer";

export const enviarContacto = async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  if (!nombre || !email || !asunto || !mensaje) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios." });
  }

  try {
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // tls: {
      //   rejectUnauthorized: false,
      // },
    });

    await transporter.sendMail({
      from: `"${nombre}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: asunto,
      text: `
📨 Nuevo mensaje de contacto

🧑 Nombre: ${nombre}
📧 Email: ${email}
📝 Asunto: ${asunto}

💬 Mensaje:
${mensaje}
      `,
      replyTo: email,
    });

    res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar contacto:", error.message, error.stack);
    res.status(500).json({ message: "Error al enviar el mensaje" });
  }
};
