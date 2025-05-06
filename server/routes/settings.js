import express from 'express';
import { db } from '../db.js';
const router = express.Router();

// Ler todas as configs
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT chave, valor FROM settings');
  const result = Object.fromEntries(rows.map(r => [r.chave, JSON.parse(r.valor)]));
  res.json(result);
});

// Atualizar uma config
router.put('/:chave', async (req, res) => {
  const { chave } = req.params;
  const valor = JSON.stringify(req.body);
  await db.execute('UPDATE settings SET valor=? WHERE chave=?', [valor, chave]);
  res.json({ message: 'Atualizado' });
});

export default router;