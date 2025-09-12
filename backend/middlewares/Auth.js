export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  
  if (!token) return res.status(401).json({ ok: false, message: "No autorizado" });

  try {
    // Aquí podrías validar un JWT u otro sistema de sesión
    // Por ahora solo ejemplo dummy:
    req.user = { id: 1, role: 1 }; // simula que el usuario está logueado
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: "Token inválido" });
  }
};
