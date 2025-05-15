// cacau-admin/server/routes/categorias.js

import express from 'express';
import { db } from '../db.js';       // pool compartilhado
// NÃO usamos autenticação para LISTAR
const router = express.Router();

// GET /categorias?_page=1&_perPage=5
router.get('/', async (req, res) => {
  const page    = parseInt(req.query._page, 10)    || 1;
  const perPage = parseInt(req.query._perPage, 10) || 5;
  const offset  = (page - 1) * perPage;

  try {
    // Puxa as categorias existentes em produtos
    const [rows] = await db.query(
      'SELECT DISTINCT categoria AS nome FROM produtos'
    );
    // Mapea para objetos com id e nome
    const data = rows.map((r, i) => ({ id: i + 1, nome: r.nome }));

    // Aplica paginação
    const slice = data.slice(offset, offset + perPage);
    const total = data.length;

    // Cabeçalhos para React‑Admin
    res.setHeader('Content-Range', `categorias ${offset}-${offset + slice.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json(slice);
  } catch (err) {
    console.error('❌ categorias error:', err);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

export default router;
