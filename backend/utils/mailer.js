import { Resend } from "resend";

const MAIL_ENABLED = process.env.MAIL_ENABLED === "true";
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo usando Resend (compatible con la interfaz anterior)
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

  const fromAddress = "fundacionvisualoptica@resend.dev"; // ⚠️ Cambia esto si tienes dominio verificado
  const from = `${fromName || "Fundación Visual Óptica"} <${fromAddress}>`;

  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
      reply_to: replyTo || "rl62138@gmail.com",
    });

    if (response.error) {
      console.error("❌ Error al enviar correo:", response.error);
      throw new Error(response.error.message || "Error desconocido en Resend");
    }

    console.log(`📨 Correo enviado a ${to} | Asunto: ${subject}`);
    return { sent: true };
  } catch (error) {
    console.error("❌ Error al enviar correo (Resend):", error.message);
    return { sent: false, error: error.message };
  }
};

