import { getBitacora } from "../models/bitacora.js";

export const listarBitacora = async (req, res) => {
  try {
    const bitacora = await getBitacora();
    res.json(bitacora);
  } catch (error) {
    console.error("Error al obtener bitácora:", error);
    res.status(500).json({ message: "Error al obtener la bitácora" });
  }
};