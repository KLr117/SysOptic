import bcrypt from "bcrypt";
import { findUserByUsername, addBitacoraEntry, createUser } from "../models/UserModel.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Usuario y contraseña requeridos" });
  }

  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ ok: false, message: "Usuario no encontrado" });
    }

    // 🔒 Validar contraseña con bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ ok: false, message: "Contraseña incorrecta" });
    }

    // ✅ Registrar inicio de sesión en bitácora
    await addBitacoraEntry(user.pk_id_user, "Inicio de sesión");

    // Login correcto
    return res.json({
      ok: true,
      message: "Login exitoso",
      user: {
        id: user.pk_id_user,
        username: user.username,
        role: user.fk_id_role
      }
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const createUserController = async (req, res) => {
  const { firstName, lastName, username, password, role, fk_id_user } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuarioId = await createUser(firstName, lastName, username, hashedPassword, role);

    // Registrar acción en bitácora
    await addBitacoraEntry(fk_id_user, `Creó usuario ${username}`, nuevoUsuarioId);

    res.json({ ok: true, message: "Usuario creado correctamente", id: nuevoUsuarioId });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};
