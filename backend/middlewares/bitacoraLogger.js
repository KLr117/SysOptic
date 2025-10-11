import pool from "../database/db.js";

// Middleware para registrar automáticamente acciones en bitácora
export const logBitacoraMiddleware = (req, res, next) => {
  const metodo = req.method;

  // Solo registrar acciones de modificación
  if (!["POST", "PUT", "DELETE"].includes(metodo)) {
    return next();
  }

  // Guardar el send original
  const originalSend = res.send;

  res.send = function (data) {
    // Ejecutar el send original
    originalSend.call(this, data);

    // Intentar registrar en bitácora de forma asíncrona (no bloquear)
    setImmediate(async () => {
      try {
        // Solo registrar si la respuesta fue exitosa (2xx)
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return;
        }

        const user = req.user || {};
        const userId = user.id || null;

        // Detectar módulo desde la URL
        const baseUrl = req.baseUrl || req.path || "";
        let modulo = "Sistema";

        if (baseUrl.includes("/expedientes")) modulo = "Expedientes";
        else if (baseUrl.includes("/ordenes")) modulo = "Ordenes";
        else if (baseUrl.includes("/notificaciones")) modulo = "Notificaciones";
        else if (baseUrl.includes("/users")) modulo = "Usuarios";
        else if (baseUrl.includes("/imagenes")) modulo = "Imágenes";

        // Determinar acción base
        let accionBase = "";
        if (metodo === "POST") accionBase = "Creó registro en";
        else if (metodo === "PUT") accionBase = "Actualizó registro en";
        else if (metodo === "DELETE") accionBase = "Eliminó registro en";

        // Intentar extraer ID del registro afectado
        let recordId = null;
        if (req.params.id) recordId = req.params.id;
        else if (req.params.pk_id_expediente)
          recordId = req.params.pk_id_expediente;
        else if (req.body?.pk_id_expediente)
          recordId = req.body.pk_id_expediente;
        else if (req.body?.pk_id_orden) recordId = req.body.pk_id_orden;

        // Construir descripción de la acción
        let accion = `${accionBase} ${modulo}`;
        if (recordId) {
          accion += ` (ID: ${recordId})`;
        }

        // Insertar en bitácora
        await pool.query(
          `INSERT INTO tbl_bitacora (fk_id_user, accion) VALUES (?, ?)`,
          [userId, accion]
        );
      } catch (error) {
        // Solo loguear el error, no detener la ejecución
        console.error(
          "Error registrando en bitácora automática:",
          error.message
        );
      }
    });
  };

  next();
};
