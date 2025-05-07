// cacau-admin/server/routes/siteVisits.js
import express from 'express';
import { db } from '../db.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateJWT);

router.get('/', async (req, res) => {
  const restaurantId = req.user.sub;
  try {
    const [[row]] = await db.query(
      'SELECT site_visits FROM restaurants WHERE id = ?',
      [restaurantId]
    );
    const count = row?.site_visits || 0;
    const data = [{ id: restaurantId, count }];
    // cabeçalhos para paginação do React-Admin
    res.setHeader('Content-Range', `siteVisits 0-0/1`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json(data);
  } catch (err) {
    console.error('❌ siteVisits error:', err);
    res.status(500).json({ error: 'Erro ao buscar visitas' });
  }
});

export default router;
