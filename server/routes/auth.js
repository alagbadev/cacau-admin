import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../server.js';

const router = express.Router();

// Registro (opcional)
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log('[AUTH] Tentando registrar usuário:', email);

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hash]
    );
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    console.error('[AUTH] Erro ao registrar usuário:', err);
    res.status(400).json({ message: 'Erro ao registrar', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('[AUTH] Tentando login com:', email);

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('[AUTH] Resultado da busca no banco:', rows);

    if (rows.length === 0) {
      console.warn('[AUTH] Usuário não encontrado:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log('[AUTH] Senha válida?', valid);

    if (!valid) {
      console.warn('[AUTH] Senha incorreta para:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('[AUTH] FALHA: JWT_SECRET não está definido no .env');
      return res.status(500).json({ message: 'Erro interno: JWT não configurado' });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    console.log('[AUTH] Token gerado para:', email);

    res.json({ token });
  } catch (error) {
    console.error('[AUTH] Erro interno no login:', error);
    res.status(500).json({ message: `Erro interno: ${error.message}` });
  }
});

export default router;
