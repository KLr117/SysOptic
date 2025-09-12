import { findUserByUsername } from "../models/UserModel.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await findUserByUsername(username);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // ⚠️ De momento comparar password en plano, más adelante usamos bcrypt
    if (user.password !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({ message: "Login exitoso", user });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};
