import * as notificacionesModel from "../models/notificacionesModel.js";
import { updateEstadoNotificacion } from "../models/notificacionesModel.js";
import * as notificacionesEnviadasModel from "../models/NotificacionesEnviosModel.js";
import { sendEmail } from "../utils/mailer.js";
import { buildEmailTemplate } from "../utils/templates/emailTemplate.js";


// 🔍 Validación con soporte a Promoción
const validarTipoIntervaloPorModulo = (moduloId, tipoIntervalo, categoriaId) => {
  // Si es categoría Promoción → no requiere tipo_intervalo
  if (categoriaId === 2) {
    return true;
  }

  // Si no es promoción → validar como antes
  if (moduloId === 1) {
    return tipoIntervalo === "despues_registro";
  }
  if (moduloId === 2) {
    return tipoIntervalo === "antes_entrega" || tipoIntervalo === "despues_recepcion";
  }
  return false;
};

// Crear
export const createNotificacion = async (req, res) => {
  try {
    const {
      fk_id_modulo_notificacion,
      tipo_intervalo
    } = req.body;

    if (!validarTipoIntervaloPorModulo(fk_id_modulo_notificacion, tipo_intervalo,  req.body.fk_id_categoria_notificacion)) {
      return res.status(400).json({
        error: "tipo_intervalo inválido para el módulo seleccionado"
      });
    }

    const id = await notificacionesModel.createNotificacion(req.body);
    res.status(201).json({ message: "Notificación creada", id });
  } catch (error) {
    console.error("Error al crear notificación:", error);
    res.status(500).json({ error: "Error al crear notificación" });
  }
};

// Listar todas
export const getNotificaciones = async (req, res) => {
  try {
    const rows = await notificacionesModel.getNotificaciones();
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

// Obtener por ID
export const getNotificacionById = async (req, res) => {
  try {
    const row = await notificacionesModel.getNotificacionById(Number(req.params.id));
    if (!row) return res.status(404).json({ error: "Notificación no encontrada" });
    res.json(row);
  } catch (error) {
    console.error("Error al obtener notificación:", error);
    res.status(500).json({ error: "Error al obtener notificación" });
  }
};

// Actualizar
export const updateNotificacion = async (req, res) => {
  try {
    const {
      fk_id_modulo_notificacion,
      tipo_intervalo
    } = req.body;

    if (!validarTipoIntervaloPorModulo(fk_id_modulo_notificacion, tipo_intervalo,  req.body.fk_id_categoria_notificacion)) {
      return res.status(400).json({
        error: "tipo_intervalo inválido para el módulo seleccionado"
      });
    }

    const affected = await notificacionesModel.updateNotificacion(Number(req.params.id), req.body);
    if (affected === 0) return res.status(404).json({ error: "Notificación no encontrada" });
    res.json({ message: "Notificación actualizada" });
  } catch (error) {
    console.error("Error al actualizar notificación:", error);
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
};

// Eliminar
export const deleteNotificacion = async (req, res) => {
  try {
    const affected = await notificacionesModel.deleteNotificacion(Number(req.params.id));
    if (affected === 0) return res.status(404).json({ error: "Notificación no encontrada" });
    res.json({ message: "Notificación eliminada" });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ error: "Error al eliminar notificación" });
  }
};

// 🟢 Controlador para actualizar el estado
export const cambiarEstadoNotificacion = async (req, res) => {
  const { id } = req.params;
  const { nuevoEstadoId } = req.body;

  try {
    if (!id || !nuevoEstadoId) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros: id o nuevoEstadoId."
      });
    }

    const result = await updateEstadoNotificacion(id, nuevoEstadoId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el estado de la notificación.",
      error: error.message
    });
  }
};

// =============================
// PROCESAR PROMOCIONES ACTIVAS
// =============================

export const procesarPromocionesActivas = async (req, res) => {
  try {
    const hoyISO = new Date().toISOString().slice(0, 10);

    const promos = await notificacionesModel.getPromosActivasHoy(hoyISO);

    let totalInsertados = 0;
    const detalle = [];

    for (const p of promos) {
      const pendientes = await notificacionesModel.getPendingEmailsForPromo(
        p.pk_id_notificacion,
        p.fk_id_modulo_notificacion
      );

      if (pendientes.length === 0) {
        detalle.push({
          id_notificacion: p.pk_id_notificacion,
          modulo: p.fk_id_modulo_notificacion,
          pendientes: 0,
          insertados: 0,
        });
        continue;
      }

      // (En el futuro aquí irá el envío real de emails)
      const insertados = await notificacionesEnviadasModel.insertEnviosBatch(
        p.pk_id_notificacion,
        pendientes
      );
      
      // ✅ Enviar correos reales si está activo enviar_email
      if (p.enviar_email) {
        for (const cliente of pendientes) {
          if (!cliente.correo) continue;

          const html = buildEmailTemplate({
            titulo: p.titulo,
            cuerpo: p.cuerpo_email || "Te compartimos nuestra promoción vigente.",
          });

          try {
            await sendEmail({
              to: cliente.correo,
              subject: p.asunto_email || p.titulo || "Promoción - Fundación Visual Óptica",
              html,
              fromName: "Fundación Visual Óptica",
            });
          } catch (err) {
            console.error("⚠️ Error al enviar correo promo:", cliente.correo, err.message);
          }
        }
      }

      totalInsertados += insertados;
      detalle.push({
        id_notificacion: p.pk_id_notificacion,
        modulo: p.fk_id_modulo_notificacion,
        pendientes: pendientes.length,
        insertados,
      });
    }

    return res.json({
      success: true,
      message: "Promociones procesadas correctamente.",
      total_enviadas_registradas: totalInsertados,
      promociones: detalle,
    });
  } catch (err) {
    console.error("Error al procesar promociones:", err);
    return res.status(500).json({
      success: false,
      message: "Ocurrió un error al procesar promociones.",
      error: err?.message || String(err),
    });
  }
};

// 🧠 Procesar recordatorios automáticos (Expedientes y Órdenes)
export const procesarRecordatoriosActivos = async (req, res) => {
  try {
    const notificaciones = await notificacionesModel.getRecordatoriosActivos();
    const expedientes = await notificacionesModel.getExpedientes();
    const ordenes = await notificacionesModel.getOrdenes();

    const hoy = new Date();
    let totalInsertados = 0;
    const resumen = [];

    for (const noti of notificaciones) {
      let candidatos = [];

      // 🩺 Si el módulo es EXPEDIENTES
      if (noti.fk_id_modulo_notificacion === 1) {
        candidatos = expedientes.filter((exp) => {
          const fechaBase = new Date(exp.fecha_registro);
          const fechaEnvio = new Date(
            fechaBase.getTime() + noti.intervalo_dias * 24 * 60 * 60 * 1000
          );

          const fechaCreacionNoti = new Date(noti.fecha_creacion);

          // 💡 Prospectivo inteligente:
          // Si el expediente es anterior a la notificación,
          // solo se omite si su fecha objetivo ya pasó.
          if (fechaBase < fechaCreacionNoti && fechaEnvio < hoy) {
            return false; // ya vencido → no aplica
          }

          // ✅ Coincide la fecha de envío con hoy
          return (
            fechaEnvio.toISOString().slice(0, 10) === hoy.toISOString().slice(0, 10)
          );
        });
      }


      // 📦 Si el módulo es ÓRDENES
      if (noti.fk_id_modulo_notificacion === 2) {
        candidatos = ordenes.filter((ord) => {
          const { fecha_recepcion, fecha_entrega } = ord;
          if (!fecha_recepcion && !fecha_entrega) return false;

          let fechaEnvio = null;
          let fechaBase = null;

          if (noti.tipo_intervalo === "despues_recepcion" && fecha_recepcion) {
            fechaBase = new Date(fecha_recepcion);
            fechaEnvio = new Date(
              fechaBase.getTime() + noti.intervalo_dias * 24 * 60 * 60 * 1000
            );
          } else if (noti.tipo_intervalo === "antes_entrega" && fecha_entrega) {
            fechaBase = new Date(fecha_entrega);
            fechaEnvio = new Date(
              fechaBase.getTime() - noti.intervalo_dias * 24 * 60 * 60 * 1000
            );
          }

          const fechaCreacionNoti = new Date(noti.fecha_creacion);
          // 💡 Prospectivo inteligente
          if (fechaBase < fechaCreacionNoti && fechaEnvio < hoy) return false;

          return (
            fechaEnvio &&
            fechaEnvio.toISOString().slice(0, 10) === hoy.toISOString().slice(0, 10)
          );
        });
      }

      // 📤 Registrar los correos pendientes sin duplicar
      for (const c of candidatos) {
        await notificacionesModel.registrarEnvio(noti.pk_id_notificacion, c.correo);
        totalInsertados++;

        // ✅ Envío real del correo si está habilitado
        if (noti.enviar_email && c.correo) {
          const html = buildEmailTemplate({
            titulo: noti.titulo,
            cuerpo: noti.cuerpo_email,
          });

          try {
            await sendEmail({
              to: c.correo,
              subject: noti.asunto_email || noti.titulo || "Recordatorio - Fundación Visual Óptica",
              html,
              fromName: "Fundación Visual Óptica",
            });
          } catch (err) {
            console.error("⚠️ Error al enviar correo recordatorio:", c.correo, err.message);
          }
        }
      }

      resumen.push({
        id_notificacion: noti.pk_id_notificacion,
        modulo: noti.fk_id_modulo_notificacion,
        pendientes: candidatos.length,
        insertados: totalInsertados,
      });
    }

    const resultado = {
      success: true,
      message: "Recordatorios procesados correctamente.",
      total_insertados: totalInsertados,
      notificaciones: resumen,
    };

    // Si viene de cron → no se necesita respuesta HTTP
    if (!req) return resultado;

    res.json(resultado);
  } catch (error) {
    console.error("Error al procesar recordatorios:", error);
    if (res)
      res.status(500).json({ success: false, message: "Error en recordatorios", error: error.message });
  }
};

// Controlador de Notificaciones