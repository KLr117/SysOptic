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

    console.log(`📅 [PROMOS] Procesando promociones activas (${promos.length}) en ${hoyISO}`);

    for (const p of promos) {
      const pendientes = await notificacionesModel.getPendingEmailsForPromo(
        p.pk_id_notificacion,
        p.fk_id_modulo_notificacion,
        console.log(p)
      );

      if (!pendientes || pendientes.length === 0) {
        console.log(`⚪ Sin correos pendientes para promoción: ${p.titulo}`);
        detalle.push({
          id_notificacion: p.pk_id_notificacion,
          modulo: p.fk_id_modulo_notificacion,
          pendientes: 0,
          insertados: 0,
        });
        continue;
      }

      // Registrar envíos nuevos
      const insertados = await notificacionesEnviadasModel.insertEnviosBatch(
        p.pk_id_notificacion,
        pendientes
      );
      totalInsertados += insertados;

      console.log(
        `📩 Promoción "${p.titulo}" — ${insertados}/${pendientes.length} correos registrados`
      );

      // ✅ Enviar correos reales si está activo enviar_email
      if (Number(p.enviar_email) === 1) {
        for (const correo of pendientes) {
          try {
            const html = buildEmailTemplate({
              titulo: p.titulo,
              cuerpo:
                p.cuerpo_email ||
                "Te compartimos nuestras promociones vigentes 🎉",
            });

            await sendEmail({
              to: correo, // 🔹 ahora correo es directamente el string
              subject:
                p.asunto_email ||
                p.titulo ||
                "Promoción - Fundación Visual Óptica",
              html,
              fromName: "Fundación Visual Óptica",
            });

            console.log(`✅ Correo enviado a: ${correo}`);
          } catch (err) {
            console.error(
              `⚠️ Error al enviar correo de promoción a ${correo}:`,
              err.message
            );
          }
        }
      }

      detalle.push({
        id_notificacion: p.pk_id_notificacion,
        modulo: p.fk_id_modulo_notificacion,
        pendientes: pendientes.length,
        insertados,
      });
    }

    const resultado = {
      success: true,
      message: "Promociones procesadas correctamente.",
      total_enviadas_registradas: totalInsertados,
      promociones: detalle,
    };

    if (req) res.json(resultado);
    else return resultado;
  } catch (err) {
    console.error("❌ Error al procesar promociones:", err);
    if (res)
      res.status(500).json({
        success: false,
        message: "Ocurrió un error al procesar promociones.",
        error: err.message,
      });
  }
};



// 🧠 Procesar recordatorios automáticos (Expedientes y Órdenes)
export const procesarRecordatoriosActivos = async (req, res) => {
  try {
 const notificaciones = await notificacionesModel.getRecordatoriosActivos();
    const hoy = new Date().toISOString().slice(0, 10);

    let totalInsertados = 0;
    const resumen = [];

    console.log("📅 [CRON] Procesando recordatorios activos — Fecha:", hoy);
    console.log(`Total recordatorios encontrados: ${notificaciones.length}`);

    for (const noti of notificaciones) {
      console.log('\nProcesando notificación:', {
        id: noti.pk_id_notificacion,
         tipo: 'Recordatorio',
        especifica: {
          expediente: noti.fk_id_expediente,
          orden: noti.fk_id_orden
        },
        intervalo: {
          dias: noti.intervalo_dias,
          tipo: noti.tipo_intervalo
        }
      });

      // 🔹 Correos candidatos
      const candidatos = await notificacionesModel.getCorreosRecordatorioPorNotificacion(noti);

      if (!candidatos || candidatos.length === 0) {
        console.log("⚪ Sin candidatos para:", noti.titulo);
        continue;
      }

       // Log después de obtener candidatos
      console.log(`Candidatos encontrados: ${candidatos.length}`);

      // 🧩 Obtener correos ya enviados
      const enviados = await notificacionesEnviadasModel.getCorreosYaEnviados(noti.pk_id_notificacion);

      // 🔎 Filtrar solo los nuevos
      const nuevos = candidatos.filter(c => !enviados.includes(c.toLowerCase()));

      // Log después de filtrar nuevos
      console.log(`Nuevos correos a procesar: ${nuevos.length}`);
      if (nuevos.length === 0) {
        console.log(`⚪ Todos los correos ya fueron enviados para ${noti.titulo}`);
        continue;
      }

      // 🧾 Registrar solo los nuevos
      const insertados = await notificacionesEnviadasModel.insertEnviosBatch(
        noti.pk_id_notificacion,
        nuevos
      );
      totalInsertados += insertados;

      console.log(`✅ Registrados ${insertados}/${nuevos.length} nuevos correos para ${noti.titulo}`);

      // 📧 Enviar solo a los nuevos
      if (noti.enviar_email) {
        for (const correo of nuevos) {
          try {
            const html = buildEmailTemplate({
              titulo: noti.titulo,
              cuerpo: noti.cuerpo_email || "Te recordamos tu cita o entrega pendiente.",
            });

            await sendEmail({
              to: correo,
              subject: noti.asunto_email || noti.titulo || "Recordatorio - Fundación Visual Óptica",
              html,
              fromName: "Fundación Visual Óptica",
            });

            console.log("📤 Correo enviado a:", correo);
          } catch (err) {
            console.error("⚠️ Error al enviar correo a:", correo, err.message);
          }
        }
      }

      // Resumen por notificación
      resumen.push({
      id_notificacion: noti.pk_id_notificacion,
      modulo: noti.fk_id_modulo_notificacion,
      pendientes: nuevos.length,
      insertados,
    });
    }


    const resultado = {
      success: true,
      message: "Recordatorios procesados correctamente.",
      total_insertados: totalInsertados,
      notificaciones: resumen,
    };

    // Si viene desde el cron no devuelve respuesta HTTP
    if (!req) return resultado;

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al procesar recordatorios:", error);
    if (res) {
      res.status(500).json({
        success: false,
        message: "Error en recordatorios",
        error: error.message,
      });
    }
  }
};


// Controlador de Notificaciones