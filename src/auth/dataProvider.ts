// src/auth/dataProvider.ts
import { fetchUtils } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

// URL do backend do painel (Express rodando na porta 3001)
const apiUrl = 'http://localhost:3001';

// Cliente HTTP que injeta headers de autenticação
const httpClient = async (url: string, options: any = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  return fetchUtils.fetchJson(url, options);
};

// DataProvider base do React-Admin
const dataProvider = simpleRestProvider(apiUrl, httpClient);

// Override de getList para incluir paginação com defaults
dataProvider.getList = async (resource: string, params: any) => {
  // resource: 'siteVisits', 'whatsappOrders', 'latestOrders'
  // params pode vir sem page/perPage, então colocamos defaults
  const page    = params.page    ?? 1;
  const perPage = params.perPage ?? 5;

  // Monta URL com query params corretos
  const url = `${apiUrl}/${resource}?_page=${page}&_perPage=${perPage}`;

  // Executa requisição
  const { headers, json } = await httpClient(url);

  // Extrai total de itens do header Content-Range no formato "<nome> start-end/total"
  const contentRange = headers.get('Content-Range');
  const total = contentRange
    ? parseInt(contentRange.split('/')[1], 10)
    : json.length;

  return {
    data: json,
    total: total,
  };
};

export default dataProvider;
