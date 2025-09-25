import { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder 
} from "../models/OrdenTrabajoModel.js";

export const listOrders = async (req, res) => {
  try {
    console.log("🔍 Intentando obtener órdenes...");
    const orders = await getAllOrders();
    console.log("✅ Órdenes obtenidas:", orders.length);
    res.json({ ok: true, orders });
  } catch (error) {
    console.error("❌ Error detallado al obtener órdenes:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error code:", error.code);
    console.error("Error errno:", error.errno);
    console.error("Error sqlState:", error.sqlState);
    console.error("Error sqlMessage:", error.sqlMessage);
    
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      details: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      }
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ ok: false, message: "Orden no encontrada" });
    }
    
    res.json({ ok: true, order });
  } catch (error) {
    console.error("Error al obtener orden:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const createOrderController = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validaciones básicas
    if (!orderData.paciente || !orderData.telefono) {
      return res.status(400).json({ 
        ok: false, 
        message: "Paciente y teléfono son requeridos" 
      });
    }

    // Calcular saldo si no se proporciona
    if (orderData.total && orderData.adelanto && !orderData.saldo) {
      orderData.saldo = orderData.total - orderData.adelanto;
    }

    const newOrderId = await createOrder(orderData);
    
    res.status(201).json({ 
      ok: true, 
      message: "Orden creada correctamente", 
      id: newOrderId 
    });
  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const updateOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const orderData = req.body;

    // Verificar que la orden existe
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({ ok: false, message: "Orden no encontrada" });
    }

    // Calcular saldo si se actualiza total o adelanto
    if (orderData.total && orderData.adelanto) {
      orderData.saldo = orderData.total - orderData.adelanto;
    }

    const success = await updateOrder(id, orderData);
    
    if (success) {
      res.json({ ok: true, message: "Orden actualizada correctamente" });
    } else {
      res.status(500).json({ ok: false, message: "Error al actualizar la orden" });
    }
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const deleteOrderController = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la orden existe
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({ ok: false, message: "Orden no encontrada" });
    }

    const success = await deleteOrder(id);
    
    if (success) {
      res.json({ ok: true, message: "Orden eliminada correctamente" });
    } else {
      res.status(500).json({ ok: false, message: "Error al eliminar la orden" });
    }
  } catch (error) {
    console.error("Error al eliminar orden:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};
