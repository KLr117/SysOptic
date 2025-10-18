import { fileURLToPath } from "url";
import path from "path";

export const buildEmailTemplate = ({ cuerpo }) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Logo desde URL o local
  const logoUrl =
    process.env.MAIL_LOGO_URL ||
    `file://${path.resolve(__dirname, "./public/images/logo.jpg")}`;

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
  const facebookUrl =
    process.env.MAIL_BRAND_FACEBOOK ||
    "https://www.facebook.com/profile.php?id=100053561527775";

  // 🎨 Colores institucionales
  const colorPrincipal = "#6a1b1a";
  const colorFondo = "#f6f7fb";

  // 🗺️ Enlaces de mapas
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
  const wazeLink = `https://waze.com/ul?q=${encodeURIComponent(address)}`;

  // SVGs (compatibles con correo)
  const whatsappIcon = `<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='${colorPrincipal}'><path d='M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.157 5.3 5.458 0 12.079 0c3.181 0 6.167 1.24 8.413 3.488a11.8 11.8 0 013.492 8.412c-.003 6.63-5.303 11.93-11.926 11.93a11.95 11.95 0 01-5.937-1.594L.057 24zM6.6 20.13c1.768.995 3.812 1.53 5.992 1.532 5.448 0 9.886-4.434 9.889-9.885.002-5.456-4.42-9.888-9.876-9.891-5.452 0-9.885 4.433-9.888 9.887a9.86 9.86 0 001.573 5.324l-.999 3.648 3.309-.615zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.471-.149-.67.15-.198.297-.768.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.372-.025-.521-.074-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.793.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.1 3.2 5.083 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.414z'/></svg>`;

  const facebookIcon = `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='${colorPrincipal}'><path d='M22.675 0h-21.35C.597 0 0 .597 0 1.333v21.334C0 23.403.597 24 1.325 24H12.82v-9.294H9.692V11.07h3.128V8.413c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.098 2.795.142v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.636h-3.12V24h6.116C23.403 24 24 23.403 24 22.667V1.333C24 .597 23.403 0 22.675 0z'/></svg>`;

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
      a { text-decoration: none; }
    </style>
  </head>

  <body style="font-family: Arial, sans-serif; background:${colorFondo}; color:#333; padding:24px;">
    <div style="max-width:650px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,.08)">

      <!-- Encabezado -->
      <div style="background:${colorPrincipal}; color:white; padding:12px 24px;">
        <table class="header-table" style="width:100%; border-collapse:collapse;">
          <tr>
            <td class="header-logo" style="width:25%; text-align:center;">
              <img src="${logoUrl}" alt="${brand}" style="width:40px; border-radius:6px;" />
            </td>
            <td class="header-title" style="width:75%; text-align:center;">
              <h2 style="margin:0; font-weight:500;">${brand}</h2>
            </td>
          </tr>
        </table>
      </div>

      <!-- Cuerpo -->
      <div style="padding:24px; text-align:center; font-size:15px; line-height:1.6;">
        <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; margin: 0;">${cuerpo}</pre>
      </div>

      <!-- Pie -->
      <div style="background:#fafafa; padding:20px 28px; border-top:1px solid #eee;">
        <table class="footer-table" style="width:100%; border-collapse:collapse;">
          <tr>
            <td class="footer-logo" style="width:30%; text-align:center;">
              <img src="${logoUrl}" alt="${brand}" style="width:100px; border-radius:6px;" />
            </td>

            <td class="footer-info" style="width:70%; text-align:center; font-size:12px; color:#555;">
              <strong>${brand}</strong><br>
              🏠 <strong>Dirección:</strong> ${address}<br>
              <a href="${googleMapsLink}" style="color:${colorPrincipal}; font-weight:bold;" target="_blank">📍 Ver en Google Maps</a> |
              <a href="${wazeLink}" style="color:${colorPrincipal}; font-weight:bold;" target="_blank">🚗 Abrir en Waze</a><br>
              ✉️ <strong>E-mail:</strong> ${email}<br>
              ☎️ <strong>Teléfonos:</strong> ${phone1} / ${phone2}<br>

              <!-- WhatsApp con ícono -->
              ${whatsappIcon}
              <a href="https://api.whatsapp.com/send?phone=502${whatsapp.replace(/\D/g, '')}"
                 style="color:${colorPrincipal}; font-weight:bold; margin-left:3px;">${whatsappDisplay}</a><br>

              <!-- Facebook con ícono -->
              ${facebookIcon}
              <a href="${facebookUrl}" target="_blank" style="color:${colorPrincipal}; font-weight:bold; margin-left:3px;">
                Facebook Oficial
              </a><br>

              <p style="margin-top:10px; color:#888;">👓 <strong>Gracias por confiar en nosotros</strong> 👓</p>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
  </html>
  `;
};
