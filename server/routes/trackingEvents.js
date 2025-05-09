// cacau-admin/server/routes/trackingEvents.js
import express from 'express';
import { db } from '../db.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();
// Aplica autenticação JWT em todas as rotas deste router
router.use(authenticateJWT);

// GET /trackingEvents
// Lista eventos de tracking (visitas e cliques WhatsApp) para o restaurante autenticado
router.get('/', async (req, res) => {
  const restaurantId = req.user.sub;
  // Paginação padrão: página 1 e 5 itens por página
  const page    = parseInt(req.query._page, 10)    || 1;
  const perPage = parseInt(req.query._perPage, 10) || 5;
  const offset  = (page - 1) * perPage;

  try {
    // Conta total de eventos para paginação
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM tracking_events WHERE restaurant_id = ?',
      [restaurantId]
    );

    // Busca eventos paginados, ordenados pelo mais recente
    const [rows] = await db.query(
      `SELECT 
         id,
         event_type AS type,
         created_at AS timestamp
       FROM tracking_events
       WHERE restaurant_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [restaurantId, perPage, offset]
    );

    // Define headers para React-Admin
    res.setHeader('Content-Range', `trackingEvents ${offset}-${offset + rows.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    // Retorna array de objetos: [{ id, type, timestamp }, ...]
    res.json(rows);
  } catch (err) {
    console.error('❌ trackingEvents error:', err);
    res.status(500).json({ error: 'Erro ao buscar eventos de tracking' });
  }
});

export default router;
