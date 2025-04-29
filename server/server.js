import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

// Carrega variáveis de ambiente
dotenv.config();

// garanta que há um segredo definido, senão encerra com erro claro
if (!process.env.JWT_SECRET) {
  console.error('FATAL: falta a variável JWT_SECRET no .env');
  process.exit(1);
}
const app = express();

// Configuração correta do CORS para o Vite (localhost:5173)
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions)); // Só esse!
app.use(express.json());

// Conexão MySQL
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Config JWT
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Exporta db para outras rotas
export { db };

// Importa rotas
import authRoutes from './routes/auth.js';
import produtosRoutes from './routes/produtos.js';
import settingsRoutes from './routes/settings.js';

// Middleware de autenticação (protege rotas)
import { authenticateJWT } from './middleware/authMiddleware.js';

// Rotas públicas
app.use('/auth', authRoutes);

// Rotas protegidas
app.use('/produtos', authenticateJWT, produtosRoutes);
app.use('/settings', authenticateJWT, settingsRoutes);

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
