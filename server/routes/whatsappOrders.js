// cacau-admin/server/routes/whatsappOrders.js
import express from 'express';
import { db } from '../db.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// Proteção por JWT
router.use(authenticateJWT);

// Rota para consultar o número de pedidos no WhatsApp
router.get('/', async (req, res) => {
  const restaurantId = req.user.sub;
  try {
    const [[row]] = await db.query(
      'SELECT whatsapp_orders FROM restaurants WHERE id = ?',
      [restaurantId]
    );
    const count = row?.whatsapp_orders || 0;
    const data = [{ id: restaurantId, count }];
    res.setHeader('Content-Range', `whatsappOrders 0-0/1`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json(data);
  } catch (err) {
    console.error('❌ whatsappOrders error:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos WhatsApp' });
  }
});

// Rota para incrementar o número de pedidos no WhatsApp
router.post('/increment', async (req, res) => {
  const restaurantId = req.user.sub;
  try {
    // Incrementa o contador de pedidos no WhatsApp
    const [result] = await db.execute(
      'UPDATE restaurants SET whatsapp_orders = whatsapp_orders + 1 WHERE id = ?',
      [restaurantId]
    );

    // Verifica se o update foi bem-sucedido
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    // Retorna o novo valor do contador
    const [[row]] = await db.query(
      'SELECT whatsapp_orders FROM restaurants WHERE id = ?',
      [restaurantId]
    );
    const count = row?.whatsapp_orders || 0;
    res.json({ id: restaurantId, count });
  } catch (err) {
    console.error('❌ Increment error:', err);
    res.status(500).json({ error: 'Erro ao incrementar o contador de pedidos WhatsApp' });
  }
});

export default router;
