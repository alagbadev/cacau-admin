import express from 'express';
import { db } from '../server.js';
const router = express.Router();

// Listar todos
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM produtos');
  res.json(rows);
});

// Criar
router.post('/', async (req, res) => {
  const { nome, descricao, preco, imagem, categoria } = req.body;
  const result = await db.execute(
    'INSERT INTO produtos (nome, descricao, preco, imagem, categoria) VALUES (?,?,?,?,?)',
    [nome, descricao, preco, imagem, categoria]
  );
  res.status(201).json({ id: result[0].insertId });
});

// Atualizar
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  await db.execute(
    'UPDATE produtos SET nome=?, descricao=?, preco=?, imagem=?, categoria=? WHERE id=?',
    [req.body.nome, req.body.descricao, req.body.preco, req.body.imagem, req.body.categoria, id]
  );
  res.json({ message: 'Atualizado' });
});

// Deletar
router.delete('/:id', async (req, res) => {
  await db.execute('DELETE FROM produtos WHERE id=?', [req.params.id]);
  res.json({ message: 'Removido' });
});

export default router;