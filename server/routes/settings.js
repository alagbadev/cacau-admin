import express from 'express';
import { db } from '../db.js';
const router = express.Router();

// Middleware para expor o Content-Range nos cabeçalhos
router.use((req, res, next) => {
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
  next();
});

// Ler todas as configs com paginação
router.get('/', async (req, res) => {
  // Recebe os parâmetros de paginação (_page, _perPage) com valores padrão
  const page = parseInt(req.query._page) || 1;
  const perPage = parseInt(req.query._perPage) || 10; // Pode ajustar conforme necessário
  const offset = (page - 1) * perPage;

  // Contagem total de registros
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM site_settings');
  
  // Busca as configurações para a página solicitada
  const [rows] = await db.query(
    'SELECT `key`, `value` FROM site_settings ORDER BY `key` ASC LIMIT ? OFFSET ?',
    [perPage, offset]
  );

  // Cabeçalho Content-Range para o React-Admin (início-fim/total)
  res.setHeader('Content-Range', `settings ${offset}-${offset + rows.length - 1}/${total}`);
  
  // Monta o resultado da resposta com as configurações
  const result = rows.map(r => ({
    key: r.key,
    value: JSON.parse(r.value),  // Assumindo que os valores são armazenados como JSON
  }));

  res.json(result);
});

// Atualizar uma configuração
router.put('/:key', async (req, res) => {
  const { key } = req.params;
  // Serializa o corpo da requisição antes de salvar no banco
  const value = JSON.stringify(req.body);
  
  await db.execute(
    'UPDATE site_settings SET `value` = ? WHERE `key` = ?',
    [value, key]
  );
  
  res.json({ message: 'Configuração atualizada com sucesso' });
});

export default router;
