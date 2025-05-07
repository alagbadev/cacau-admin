// cacau-admin/server/routes/whatsappOrders.js
import express from 'express';
import { db } from '../db.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateJWT);

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

export default router;
