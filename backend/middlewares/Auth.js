import { verifyTokenSync } from "../utils/token.js";

// 🔒 Verificar token JWT
export const authMiddleware = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({ ok: false, message: "Token no proporcionado" });
  }

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ ok: false, message: "Formato de token inválido" });
  }

  try {
    const decoded = verifyTokenSync(token);
    req.user = decoded; // { id, username, roleId, roleName }
    next();
  } catch (error) {
    const msg = error.name === "TokenExpiredError" ? "Token expirado" : "Token inválido";
    return res.status(401).json({ ok: false, message: msg });
  }
};

// 🧩 Autorización por rol
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ ok: false, message: "No autenticado" });
  const roleName = req.user.roleName;
  if (!allowedRoles.includes(roleName)) {
    return res.status(403).json({ ok: false, message: "No autorizado" });
  }
  next();
};
