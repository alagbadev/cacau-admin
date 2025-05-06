import express from 'express';
import { db } from '../db.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
const router = express.Router();

// Aplica JWT em todas as rotas abaixo
router.use(authenticateJWT);

// Listar todos produtos com paginação (usado pelo React-Admin)
router.get('/', async (req, res) => {
  const restaurantId = req.user.sub;

  // Padrões para paginação
  const page = parseInt(req.query._page) || 1;
  const perPage = parseInt(req.query._perPage) || 1000; // valor alto para compatibilidade retroativa
  const offset = (page - 1) * perPage;

  try {
    // Total de produtos para o restaurante
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM produtos WHERE restaurant_id = ?',
      [restaurantId]
    );

    // Produtos paginados
    const [rows] = await db.query(
      'SELECT * FROM produtos WHERE restaurant_id = ? LIMIT ? OFFSET ?',
      [restaurantId, perPage, offset]
    );

    // Cabeçalhos exigidos pelo React-Admin
    res.setHeader('Content-Range', `produtos ${offset}-${offset + rows.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Buscar por ID
router.get('/:id', async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM produtos WHERE id = ? AND restaurant_id = ?',
    [req.params.id, req.user.sub]
  );
  res.json(rows[0]);
});

// Criar um produto
router.post('/', async (req, res) => {
  const { nome, descricao, preco, imagem, categoria } = req.body;
  const [result] = await db.execute(
    'INSERT INTO produtos (nome, descricao, preco, imagem, categoria, restaurant_id) VALUES (?,?,?,?,?,?)',
    [nome, descricao, preco, imagem, categoria, req.user.sub]
  );
  res.status(201).json({ id: result.insertId });
});

// Atualizar
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  await db.execute(
    'UPDATE produtos SET nome=?, descricao=?, preco=?, imagem=?, categoria=? WHERE id=? AND restaurant_id=?',
    [req.body.nome, req.body.descricao, req.body.preco, req.body.imagem, req.body.categoria, id, req.user.sub]
  );
  res.json({ message: 'Atualizado' });
});

// Deletar
router.delete('/:id', async (req, res) => {
  await db.execute(
    'DELETE FROM produtos WHERE id=? AND restaurant_id=?',
    [req.params.id, req.user.sub]
  );
  res.json({ message: 'Removido' });
});

export default router;
