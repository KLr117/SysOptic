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

    // 📤 Capturamos el resultado real retornado por sendEmail
    const result = await sendEmail({
      to,
      subject: subject || "Correo de prueba - Fundación Visual Óptica",
      html,
      fromName: "Fundación Visual Óptica",
    });

    // 🔍 Si sendEmail retornó simulación o fallo, lo exponemos directamente
    if (result.simulated) {
      return res.status(200).json({
        success: false,
        reason: "MAIL_ENABLED_FALSE",
        message: "El backend tiene MAIL_ENABLED apagado o en false en Railway.",
        result,
      });
    }

    if (!result.success) {
      return res.status(502).json({
        success: false,
        reason: "GMAIL_API_ERROR",
        message: "Fallo directo de la API de Gmail.",
        error: result.error,
        result,
      });
    }

    return res.json({
      success: true,
      message: `Correo enviado y confirmado por Gmail a ${to}.`,
      result,
    });
  } catch (error) {
    console.error("❌ Error no controlado:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al procesar la solicitud.",
      error: error.message,
    });
  }
};
