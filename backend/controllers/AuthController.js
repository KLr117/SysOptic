import bcrypt from "bcrypt";
import { signToken } from "../utils/token.js";
import {
  findUserByUsername,
  addBitacoraEntry,
  createUser,
  usernameExists,
  getUserById
} from "../models/UserModel.js";

// POST /api/login
export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ ok: false, message: "Usuario y contraseña requeridos" });

  try {
    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ ok: false, message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ ok: false, message: "Contraseña incorrecta" });

    // ✅ Generar token JWT
    const token = signToken({
      id: user.pk_id_user,
      username: user.username,
      roleId: user.fk_id_role,
      roleName: user.nombre_role
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
        roleName: user.nombre_role
      }
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// POST /api/users (solo administrador)
export const createUserController = async (req, res) => {
  const { firstName, lastName, username, password, role } = req.body;

  if (!firstName || !username || !password || !role) {
    return res.status(400).json({ ok: false, message: "Faltan campos obligatorios" });
  }

  try {
    if (await usernameExists(username)) {
      return res.status(409).json({ ok: false, message: "El username ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuarioId = await createUser(firstName, lastName ?? null, username, hashedPassword, role);

    const actorId = req.user?.id ?? null;
    await addBitacoraEntry(actorId, `Creó usuario ${username}`, nuevoUsuarioId);

    res.json({ ok: true, message: "Usuario creado correctamente", id: nuevoUsuarioId });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ ok: false, message: "Error al crear usuario" });
  }
};

// GET /api/me — perfil autenticado
export const me = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    return res.json({
      ok: true,
      user: {
        id: user.pk_id_user,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        roleId: user.fk_id_role,
        roleName: user.nombre_role
      }
    });
  } catch (error) {
    console.error("Error en /me:", error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

