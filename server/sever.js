// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
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