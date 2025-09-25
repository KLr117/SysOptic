import { getBitacora } from "../models/bitacora.js";

export const listarBitacora = async (req, res) => {
  try {
    const bitacora = await getBitacora();
    res.json({ ok: true, bitacora });
  } catch (error) {
    console.error("Error al obtener bitácora:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};