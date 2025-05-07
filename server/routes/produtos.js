// server/routes/produtos.js
import express from 'express';
import { db } from '../db.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
const router = express.Router();

router.use(authenticateJWT);

// Listagem paginada
router.get('/', async (req, res) => {
  const restaurantId = req.user.sub;
  const page    = parseInt(req.query._page)    || 1;
  const perPage = parseInt(req.query._perPage) || 1000;
  const offset  = (page - 1) * perPage;

  try {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM produtos WHERE restaurant_id = ?', 
      [restaurantId]
    );
    const [rows] = await db.query(
      `SELECT * 
       FROM produtos 
       WHERE restaurant_id = ? 
       LIMIT ? OFFSET ?`,
      [restaurantId, perPage, offset]
    );
    res.setHeader('Content-Range', `produtos ${offset}-${offset+rows.length-1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Buscar um único
router.get('/:id', async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM produtos WHERE id=? AND restaurant_id=?',
    [req.params.id, req.user.sub]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(rows[0]);
});

// Criar produto
router.post('/', async (req, res) => {
  const { nome, preco, imagem, descricao, adicionais, combina_com, categoria } = req.body;
  // imagem deve vir como string (url ou filename), não objeto
  const [result] = await db.execute(
    `INSERT INTO produtos
      (nome, preco, imagem, descricao, adicionais, combina_com, categoria, restaurant_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, preco, imagem, descricao, adicionais, combina_com, categoria, req.user.sub]
  );
  // buscar e retornar registro completo
  const [[newProd]] = await db.query('SELECT * FROM produtos WHERE id=?', [result.insertId]);
  res.status(201).json(newProd);
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  const { nome, preco, imagem, descricao, adicionais, combina_com, categoria } = req.body;
  await db.execute(
    `UPDATE produtos 
      SET nome=?, preco=?, imagem=?, descricao=?, adicionais=?, combina_com=?, categoria=?
     WHERE id=? AND restaurant_id=?`,
    [nome, preco, imagem, descricao, adicionais, combina_com, categoria, req.params.id, req.user.sub]
  );
  const [[updated]] = await db.query('SELECT * FROM produtos WHERE id=?', [req.params.id]);
  res.json(updated);
});

// Deletar produto
router.delete('/:id', async (req, res) => {
  await db.execute(
    'DELETE FROM produtos WHERE id=? AND restaurant_id=?',
    [req.params.id, req.user.sub]
  );
  res.status(204).send();
});

export default router;
