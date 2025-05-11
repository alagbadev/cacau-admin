// cacau-admin/server/routes/produtos.js
import express from 'express';
import { db } from '../db.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateJWT);

// Listagem paginada de TODOS os produtos
router.get('/', async (req, res) => {
  const page    = parseInt(req.query._page, 10)    || 1;
  const perPage = parseInt(req.query._perPage, 10) || 1000;
  const offset  = (page - 1) * perPage;

  try {
    // Conta total de produtos
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM produtos'
    );

    // Busca produtos paginados
    const [rows] = await db.query(
      `SELECT * 
         FROM produtos 
         LIMIT ? OFFSET ?`,
      [perPage, offset]
    );

    // Cabeçalhos para React-Admin
    res.setHeader(
      'Content-Range',
      `produtos ${offset}-${offset + rows.length - 1}/${total}`
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Buscar um único produto por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM produtos WHERE id = ?',
      [req.params.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar produto por ID:', err);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Criar produto
router.post('/', async (req, res) => {
  const { nome, preco, imagem, descricao, adicionais, combina_com, categoria } = req.body;
  try {
    const [result] = await db.execute(
      `INSERT INTO produtos
        (nome, preco, imagem, descricao, adicionais, combina_com, categoria)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, preco, imagem, descricao, adicionais, combina_com, categoria]
    );
    const [[newProd]] = await db.query('SELECT * FROM produtos WHERE id = ?', [result.insertId]);
    res.status(201).json(newProd);
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  const { nome, preco, imagem, descricao, adicionais, combina_com, categoria } = req.body;
  try {
    await db.execute(
      `UPDATE produtos 
         SET nome=?, preco=?, imagem=?, descricao=?, adicionais=?, combina_com=?, categoria=?
       WHERE id=?`,
      [nome, preco, imagem, descricao, adicionais, combina_com, categoria, req.params.id]
    );
    const [[updated]] = await db.query('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Deletar produto
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar produto:', err);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

export default router;
