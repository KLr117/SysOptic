import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const MAIL_ENABLED = process.env.MAIL_ENABLED === "true";
const GMAIL_USER = process.env.GMAIL_USER;
const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// RFC 2047: codifica cabeceras con UTF-8 Base64 si hay caracteres no ASCII
const encodeHeader = (str) =>
  /[^\x00-\x7F]/.test(str)
    ? `=?UTF-8?B?${Buffer.from(str, "utf8").toString("base64")}?=`
    : str;

export const sendEmail = async ({ to, subject, html, replyTo, fromName }) => {
  if (!MAIL_ENABLED) {
    console.log("✉️ [SIMULADO] →", { to, subject });
    return { simulated: true };
  }

  try {
    await oAuth2Client.getAccessToken(); // fuerza validez del token
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // ✅ Codifica Subject y display names
    const encodedSubject = encodeHeader(subject || "");
    const displayName = encodeHeader(fromName || "Fundación Visual Óptica");
    const fromHeader = `${displayName} <${GMAIL_USER}>`;
    const replyToHeader = replyTo ? `${displayName} <${replyTo}>` : null; // agregar opcional Reply-To por: const replyToHeader = `${displayName} <${replyTo || "fundacionvisualoptica@gmail.com"}>`;


    const lines = [
      `From: ${fromHeader}`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      ...(replyToHeader ? [`Reply-To: ${replyToHeader}`] : []),
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      html || "",
    ];

    const raw = Buffer.from(lines.join("\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log(`📨 Correo enviado a ${to} | ID: ${result.data.id}`);
    return { success: true, message: `Correo enviado correctamente a ${to}.` };
  } catch (error) {
    console.error("❌ Error al enviar correo (Gmail API):", error.message);
    return { success: false, message: "Error al enviar el correo.", error: error.message };
  }
};

