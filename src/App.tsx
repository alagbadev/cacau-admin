// src/App.tsx
import { Admin, Resource, Layout as DefaultLayout } from 'react-admin'
import { useLocation } from 'react-router-dom'
import simpleRestProvider from 'ra-data-simple-rest'

import authProvider from './auth/authProvider'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'

import { ProductList } from './products/ProductList'
import { ProductEdit } from './products/ProductEdit'
import { ProductCreate } from './products/ProductCreate'

import { ThemeList } from './themes/ThemeList'

// Layout customizado para remover Sidebar/AppBar no login
const CustomLayout = (props: any) => {
  const { pathname } = useLocation()

  if (pathname === '/login') {
    return <>{props.children}</> // Se for rota de login, renderiza apenas o filho
  }

  return <DefaultLayout {...props} /> // Senão, usa o Layout padrão do react-admin
}

const dataProvider = simpleRestProvider('/api')

export default function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      loginPage={LoginPage}
      layout={CustomLayout}   // Usa nosso CustomLayout
      requireAuth             // Aguarda autenticação antes de renderizar qualquer tela
    >
      <Resource
        name="produtos"
        list={ProductList}
        edit={ProductEdit}
        create={ProductCreate}
      />
      <Resource
        name="settings"
        list={ThemeList}
      />
      {/* Você pode adicionar mais Resources (ex: pedidos, usuários, analytics) */}
    </Admin>
  )
}

