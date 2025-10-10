import bcrypt from "bcrypt";
import { signToken } from "../utils/token.js";
import {
  findUserByUsername,
  addBitacoraEntry,
  getUserById,
} from "../models/UserModel.js";

// POST /api/login
export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ ok: false, message: "Usuario y contraseña requeridos" });

  try {
    const user = await findUserByUsername(username);
    if (!user)
      return res
        .status(401)
        .json({ ok: false, message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ ok: false, message: "Contraseña incorrecta" });

    // ✅ Generar token JWT
    const token = signToken({
      id: user.pk_id_user,
      username: user.username,
      roleId: user.fk_id_role,
      roleName: user.nombre_role,
    });

    await addBitacoraEntry(user.pk_id_user, "Inicio de sesión");

    return res.json({
      ok: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.pk_id_user,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        roleId: user.fk_id_role,
        roleName: user.nombre_role,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// GET /api/me — perfil autenticado
export const me = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    return res.json({
      ok: true,
      user: {
        id: user.pk_id_user,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        roleId: user.fk_id_role,
        roleName: user.nombre_role,
      },
    });
  } catch (error) {
    console.error("Error en /me:", error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};
