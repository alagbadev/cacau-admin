import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Carrega variáveis de ambiente
dotenv.config();

// Instância do app
const app = express();
const port = process.env.PORT || 3000;

// Pool de conexões MySQL
const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

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

// Middleware para CORS e JSON
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://restaurante-delivery-chinesa.cacaucria.com.br',
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Middleware JWT para rotas protegidas
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

// Importa rotas
import authRoutes from './routes/auth.js';
import produtosRoutes from './routes/produtos.js';
import settingsRoutes from './routes/settings.js';

// Rotas públicas de autenticação
app.use('/auth', authRoutes);

// Rotas de produtos
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

// CRUD completo para painel (protegido)
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

// Rotas de configurações protegidas
app.use('/settings', authenticateJWT, settingsRoutes);

// Inicia o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://restaurante-delivery-chinesa.cacaucria.com.br:${port}`);
});
