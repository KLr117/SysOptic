import nodemailer from "nodemailer";

const MAIL_ENABLED = process.env.MAIL_ENABLED === "true";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT || 465),
  secure: process.env.MAIL_SECURE !== "false", // true para 465
  auth: {
    user: process.env.MAIL_USER, // ej: tu correo personal o del negocio
    pass: process.env.MAIL_PASS, // App Password (solo si es Gmail)
  },
});

/**
 * Envía un correo con configuración SMTP
 * @param {Object} options
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Cuerpo en HTML
 * @param {string} [options.replyTo] - Dirección alternativa para responder
 * @param {string} [options.fromName] - Nombre del remitente (opcional)
 */
export const sendEmail = async ({ to, subject, html, replyTo, fromName }) => {
  if (!MAIL_ENABLED) {
    console.log("✉️ [SIMULADO] →", { to, subject });
    return { simulated: true };
  }

  const fromAddress = process.env.MAIL_USER;
  const from = `${fromName || "Fundación Visual Óptica"} <${fromAddress}>`;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    replyTo: replyTo || undefined,
  });

  console.log(`📨 Correo enviado a ${to} | Asunto: ${subject}`);
  return { sent: true };
};
