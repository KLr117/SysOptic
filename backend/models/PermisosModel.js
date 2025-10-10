import pool from "../database/db.js";

export const getPermisosPorUsuario = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT DISTINCT p.nombre_permiso
    FROM tbl_permisos p
    JOIN tbl_roles_permisos rp ON rp.fk_id_permiso = p.pk_id_permiso
    JOIN tbl_users u ON u.fk_id_role = rp.fk_id_role
    WHERE u.pk_id_user = ?

    UNION

    SELECT p.nombre_permiso
    FROM tbl_permisos p
    JOIN tbl_users_permisos up ON up.fk_id_permiso = p.pk_id_permiso
    WHERE up.fk_id_user = ? AND up.estado_permiso = 'otorgado'

    EXCEPT

    SELECT p.nombre_permiso
    FROM tbl_permisos p
    JOIN tbl_users_permisos up ON up.fk_id_permiso = p.pk_id_permiso
    WHERE up.fk_id_user = ? AND up.estado_permiso = 'revocado';
  `,
    [userId, userId, userId]
  );

  return rows.map((r) => r.nombre_permiso);
};
