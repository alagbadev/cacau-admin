// cacau-admin/server/routes/latestOrders.js
import express from 'express';
import { db } from '../db.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateJWT);

router.get('/', async (req, res) => {
  const restaurantId = req.user.sub;
  const page    = parseInt(req.query._page)    || 1;
  const perPage = parseInt(req.query._perPage) || 5;
  const offset  = (page - 1) * perPage;

  try {
    // total de pedidos para paginação
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM orders WHERE restaurant_id = ?',
      [restaurantId]
    );

    // últimos pedidos com join em customers para pegar nome e foto
    const [rows] = await db.query(
      `SELECT o.id,
              c.name  AS userName,
              c.photo_url AS userPhoto,
              o.timestamp
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.restaurant_id = ?
       ORDER BY o.timestamp DESC
       LIMIT ? OFFSET ?`,
      [restaurantId, perPage, offset]
    );

    res.setHeader('Content-Range', `latestOrders ${offset}-${offset + rows.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json(rows);
  } catch (err) {
    console.error('❌ latestOrders error:', err);
    res.status(500).json({ error: 'Erro ao buscar últimos pedidos' });
  }
});

export default router;
