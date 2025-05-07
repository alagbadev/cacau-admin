import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import { db } from './db.js'; // ✅ agora vem do arquivo db.js
import siteVisitsRoutes from './routes/siteVisits.js';
import whatsappOrdersRoutes from './routes/whatsappOrders.js';
import latestOrdersRoutes from './routes/latestOrders.js';
import authRoutes from './routes/auth.js';
import produtosRoutes from './routes/produtos.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Teste de conexão
(async () => {
  try {
    await db.execute('SELECT 1');
    console.log('Conectado ao banco de dados via pool!');
  } catch (err) {
    console.error('Erro ao obter conexão do pool:', err);
    process.exit(1);
  }
})();

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://restaurante-delivery-chinesa.cacaucria.com.br',
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Rotas públicas
app.use('/siteVisits', siteVisitsRoutes);
app.use('/whatsappOrders', whatsappOrdersRoutes);
app.use('/latestOrders', latestOrdersRoutes);
app.use('/auth', authRoutes);

// Middleware JWT
function authenticateJWT(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  const token = header.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });
    req.user = payload;
    next();
  });
}

// Rotas de produtos (públicas)
app.get('/produtos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produtos');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro interno ao buscar produtos' });
  }
});

app.get('/produtos/:categoria', async (req, res) => {
  const { categoria } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM produtos WHERE categoria = ?',
      [categoria]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos por categoria:', err);
    res.status(500).json({ error: 'Erro interno ao buscar produtos por categoria' });
  }
});

// Rotas protegidas
app.post('/produtos', authenticateJWT, async (req, res) => {
  const { nome, preco, imagem, descricao, categoria } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO produtos (nome, preco, imagem, descricao, categoria) VALUES (?, ?, ?, ?, ?)',
      [nome, preco, imagem, descricao, categoria]
    );
    res.status(201).json({ id: result.insertId, nome, preco, imagem, descricao, categoria });
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ error: 'Erro interno ao criar produto' });
  }
});

app.put('/produtos/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { nome, preco, imagem, descricao, categoria } = req.body;
  try {
    await db.query(
      'UPDATE produtos SET nome=?, preco=?, imagem=?, descricao=?, categoria=? WHERE id=?',
      [nome, preco, imagem, descricao, categoria, id]
    );
    res.json({ id, nome, preco, imagem, descricao, categoria });
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar produto' });
  }
});

app.delete('/produtos/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM produtos WHERE id=?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar produto:', err);
    res.status(500).json({ error: 'Erro interno ao deletar produto' });
  }
});

app.use('/settings', authenticateJWT, settingsRoutes);

// Start
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://restaurante-delivery-chinesa.cacaucria.com.br:${port}`);
});
