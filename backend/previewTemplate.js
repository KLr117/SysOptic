import { buildEmailTemplate } from "./utils/templates/emailTemplate.js";
import fs from "fs";

const html = buildEmailTemplate({
  titulo: "Prueba de plantilla SysOptic",
  cuerpo: "Este es un mensaje de prueba para visualizar el formato de correo con el color vino tinto y diseño responsive.",
});

fs.writeFileSync("preview.html", html);
console.log("✅ Archivo preview.html generado. Ábrelo en tu navegador.");
