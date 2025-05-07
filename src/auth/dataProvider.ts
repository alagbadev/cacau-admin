// src/auth/dataProvider.ts
import { fetchUtils } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const apiUrl = 'http://localhost:3000'; // ou o domínio real

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

// Customiza o dataProvider com a lógica de paginação
const dataProvider = simpleRestProvider(apiUrl, httpClient);

dataProvider.getList = async (resource: string, params: any) => {
  const { page, perPage } = params;
  const url = `${apiUrl}/${resource}?_page=${page}&_perPage=${perPage}`;

  const { headers, json } = await httpClient(url);

  // Pega o valor do cabeçalho Content-Range
  const contentRange = headers.get('Content-Range');
  const total = contentRange ? parseInt(contentRange.split('/')[1], 10) : json.length;

  return {
    data: json,
    total: total,  // Atualiza o total com base no cabeçalho Content-Range
  };
};

export default dataProvider;
