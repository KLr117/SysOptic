// controllers/mailTestController.js
import { sendEmail } from "../utils/mailer.js";
import { buildEmailTemplate } from "../utils/templates/emailTemplate.js";

export const testMail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to) {
      return res
        .status(400)
        .json({ success: false, message: "El campo 'to' es obligatorio." });
    }

    // 🧱 Construir cuerpo HTML con el template corporativo
    const html = buildEmailTemplate({
      titulo: subject || "Prueba de Notificación",
      cuerpo: body || "Este es un correo de prueba desde el sistema SysOptic.",
    });

    // 📤 Enviar correo
    await sendEmail({
      to,
      subject: subject || "Correo de prueba - Fundación Visual Óptica",
      html,
      fromName: "Fundación Visual Óptica",
    });

    res.json({
      success: true,
      message: `Correo enviado correctamente a ${to}.`,
    });
  } catch (error) {
    console.error("❌ Error al enviar correo de prueba:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar el correo de prueba.",
      error: error.message,
    });
  }
};
