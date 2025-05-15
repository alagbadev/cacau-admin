import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import { db } from './db.js';
import siteVisitsRoutes from './routes/siteVisits.js';
import whatsappOrdersRoutes from './routes/whatsappOrders.js';
import latestOrdersRoutes from './routes/latestOrders.js';
import trackingEventsRoutes from './routes/trackingEvents.js';
import authRoutes from './routes/auth.js';
import produtosRoutes from './routes/produtos.js';
import settingsRoutes from './routes/settings.js';
import categoriasRoutes from './routes/categorias.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

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

// Middleware de CORS e JSON
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://restaurante-delivery-chinesa.cacaucria.com.br',
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Middleware para expor Content-Range quando resposta for array
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    try {
      const json = typeof body === 'string' ? JSON.parse(body) : body;
      if (Array.isArray(json)) {
        res.setHeader('Content-Range', `items 0-${json.length - 1}/${json.length}`);
      }
    } catch (e) {
      // body não é JSON, ignora
    }
    return originalSend.call(this, body);
  };
  next();
});

// Rotas públicas
app.use('/auth', authRoutes);
app.use('/siteVisits', siteVisitsRoutes);
app.use('/whatsappOrders', whatsappOrdersRoutes);
app.use('/latestOrders', latestOrdersRoutes);
app.use('/trackingEvents', trackingEventsRoutes);
app.use('/categorias', categoriasRoutes);

// Rotas de produtos (GET público, demais protegidas)
app.use(
  '/produtos',
  (req, res, next) => (req.method === 'GET' ? next() : authenticateJWT(req, res, next)),
  produtosRoutes
);

// Rotas de settings protegidas
app.use('/settings', authenticateJWT, settingsRoutes);

// Middleware de autenticação JWT reutilizável
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

// Handler para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Handler de erros genérico
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
