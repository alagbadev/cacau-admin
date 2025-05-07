// src/App.tsx
import { Admin, Resource, Layout as DefaultLayout } from 'react-admin';
import { useLocation } from 'react-router-dom';
import ptBrMessages from 'ra-language-portuguese';
import polyglotI18nProvider from 'ra-i18n-polyglot';

import authProvider from './auth/authProvider';
import dataProvider from './auth/dataProvider';

import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';

import { ProductList } from './products/ProductList';
import { ProductEdit } from './products/ProductEdit';
import { ProductCreate } from './products/ProductCreate';

import { ThemeList } from './themes/ThemeList';
import { CategoryList } from './products/CategoryList'; // novo CRUD de categorias

// Layout customizado para esconder AppBar e Sidebar na tela de login
const CustomLayout = (props: any) => {
  const { pathname } = useLocation();
  if (pathname === '/login') {
    return <>{props.children}</>;
  }
  return <DefaultLayout {...props} />;
};

// Tradução para pt-BR
const i18nProvider = polyglotI18nProvider(() => ptBrMessages, 'pt');

export default function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      loginPage={LoginPage}
      layout={CustomLayout}
      i18nProvider={i18nProvider}
      requireAuth
    >
      <Resource
        name="produtos"
        list={ProductList}
        edit={ProductEdit}
        create={ProductCreate}
        options={{ label: 'Produtos' }}
      />
      <Resource
        name="categorias"
        list={CategoryList}
        options={{ label: 'Categorias' }}
      />
      <Resource
        name="settings"
        list={ThemeList}
        options={{ label: 'Configurações' }}
      />
    </Admin>
  );
}
