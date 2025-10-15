import { fileURLToPath } from "url";
import path from "path";

export const buildEmailTemplate = ({ cuerpo }) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Logo desde URL
// const logoUrl = `file://${path.resolve("./public/images/logo.jpg")}`;
const logoUrl = process.env.MAIL_LOGO_URL || `file://${path.resolve(__dirname, "./public/images/logo.jpg")}`;
 // logo accesible localmente - Desplegado cambiar a ruta pública

  // 📋 Datos de contacto
  const brand = process.env.MAIL_BRAND_NAME || "Fundación Visual Óptica";
  const address =
    process.env.MAIL_BRAND_ADDRESS ||
    "4ta. Avenida 10-23 zona 1, Guatemala, Guatemala";
  const email = process.env.MAIL_BRAND_EMAIL || "fundacionvisual@gmail.com";
  const phone1 = process.env.MAIL_BRAND_PHONE1 || "2220-7521";
  const phone2 = process.env.MAIL_BRAND_PHONE2 || "2250-0748";
  const whatsapp = process.env.MAIL_BRAND_WHATSAPP || "58770030";
  const whatsappDisplay = whatsapp.replace(/(\d{4})(\d{4})/, "$1-$2");

  // 🎨 Colores institucionales
  const colorPrincipal = "#6a1b1a"; // vino tinto
  const colorFondo = "#f6f7fb";

  return `
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      @media only screen and (max-width: 600px) {
        .header-table, .footer-table { width: 100% !important; display: block !important; text-align: center !important; }
        .header-logo, .header-title, .footer-logo, .footer-info { display: block !important; width: 100% !important; text-align: center !important; }
        .header-logo img, .footer-logo img { margin: 0 auto 10px auto !important; }
      }
    </style>
  </head>

  <body style="font-family: Arial, sans-serif; background:${colorFondo}; color:#333; padding:24px;">
    <div style="max-width:650px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,.08)">

      <!-- Encabezado vino tinto -->
      <div style="background:${colorPrincipal}; color:white; padding:12px 24px;">
        <table class="header-table" style="width:100%; border-collapse:collapse;">
          <tr>
            <td class="header-logo" style="width:25%; text-align:center; vertical-align:middle;">
              <img src="${logoUrl}" alt="${brand}" style="width:40px; border-radius:6px;" />
            </td>
            <td class="header-title" style="width:75%; text-align:center; vertical-align:middle;">
              <h2 style="margin:0; font-weight:500;">Fundación Visual Óptica</h2>
            </td>
          </tr>
        </table>
      </div>

      <!-- Cuerpo -->
      <div style="padding:24px; text-align:center; font-size:15px; line-height:1.6;">
        ${cuerpo}
      </div>

      <!-- Pie de página -->
      <div style="background:#fafafa; padding:20px 28px; border-top:1px solid #eee;">
        <table class="footer-table" style="width:100%; border-collapse:collapse;">
          <tr>
            <td class="footer-logo" style="width:30%; text-align:center; vertical-align:middle;">
              <img src="${logoUrl}" alt="${brand}" style="width:100px; border-radius:6px;" />
            </td>

            <td class="footer-info" style="width:70%; text-align:center; vertical-align:middle; font-size:12px; color:#555;">
              <strong>${brand}</strong><br>
              🏠 <strong>Dirección:</strong> ${address}<br>
              ✉️ <strong>E-mail:</strong> ${email}<br>
              ☎️ <strong>Teléfonos:</strong> ${phone1} / ${phone2}<br>
              📱 <strong>WhatsApp:</strong> <a href="https://api.whatsapp.com/send?phone=502${whatsapp.replace(/\D/g, '')}" style="color:${colorPrincipal}; text-decoration:none; font-weight:bold;">${whatsappDisplay}</a><br>
              <p style="margin-top:8px; color:#888;">👓 <strong>Gracias por confiar en nosotros</strong> 👓</p>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
  </html>
  `;
};
