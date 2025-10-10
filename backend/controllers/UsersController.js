import bcrypt from "bcrypt";
import {
  listUsers,
  getUserById,
  getUserByIdWithPassword,
  createUser as createUserModel,
  updateUser as updateUserModel,
  updateUserPassword,
  deleteUser as deleteUserModel,
  usernameExists,
  usernameExistsOther,
  addBitacoraEntry,
} from "../models/UserModel.js";

// ✅ Listar usuarios (con paginación y búsqueda)
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, q = "" } = req.query;
    const result = await listUsers({ page, limit, q });
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// ✅ Obtener usuario por ID
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }
    res.json({ ok: true, data: user });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// ✅ Crear usuario nuevo
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, username, password, roleId } = req.body;
    const actorId = req.user?.id ?? null;

    if (!firstName || !username || !password || !roleId) {
      return res
        .status(400)
        .json({ ok: false, message: "Faltan campos obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    if (await usernameExists(username)) {
      return res
        .status(409)
        .json({ ok: false, message: "El nombre de usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUserModel(
      firstName,
      lastName,
      username,
      hashedPassword,
      roleId
    );

    await addBitacoraEntry(actorId, `Creó usuario ${username}`, userId);
    res.json({
      ok: true,
      message: "Usuario creado correctamente",
      data: { id: userId },
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// ✅ Actualizar datos básicos de usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, username, roleId } = req.body;
    const actorId = req.user?.id ?? null;

    const user = await getUserById(id);
    if (!user) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    if (username && (await usernameExistsOther(id, username))) {
      return res
        .status(409)
        .json({ ok: false, message: "El nombre de usuario ya está en uso" });
    }

    const affected = await updateUserModel(id, {
      firstName,
      lastName,
      username,
      roleId,
    });
    if (!affected) {
      return res
        .status(400)
        .json({ ok: false, message: "No se aplicaron cambios" });
    }

    await addBitacoraEntry(
      actorId,
      `Actualizó usuario ${username ?? user.username}`,
      id
    );
    res.json({ ok: true, message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// ✅ Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const actorId = req.user?.id ?? null;

    if (!newPassword) {
      return res
        .status(400)
        .json({ ok: false, message: "Debe proporcionar una nueva contraseña" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const affected = await updateUserPassword(id, hashed);
    if (!affected) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    await addBitacoraEntry(
      actorId,
      `Cambió la contraseña del usuario ID ${id}`,
      id
    );
    res.json({ ok: true, message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

// ✅ Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = req.user?.id ?? null;

    const user = await getUserById(id);
    if (!user) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    const affected = await deleteUserModel(id);
    if (!affected) {
      return res
        .status(400)
        .json({ ok: false, message: "No se pudo eliminar el usuario" });
    }

    await addBitacoraEntry(actorId, `Eliminó usuario ${user.username}`);
    res.json({ ok: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};
