import { Title, useDataProvider } from 'react-admin'
import { Card, CardContent } from '@mui/material'
import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { Typography, Box, Grid, Button } from '@mui/material'

// Tipografia e cores baseadas na identidade Cacau Cria
const titleStyle = { fontFamily: 'Poppins, sans-serif', color: '#000000' }
const subTitleStyle = { fontFamily: 'Inter, sans-serif', color: '#009FFD' }

export default function Dashboard() {
  const dataProvider = useDataProvider()
  const [visits, setVisits] = useState<{ date: string; count: number }[]>([])
  const [orders, setOrders] = useState<{ date: string; count: number }[]>([])
  const [latestOrders, setLatestOrders] = useState<any[]>([])

  useEffect(() => {
    // Visitas ultimas 24 horas
    dataProvider.getList('siteVisits', {
      pagination: { page: 1, perPage: 24 },
      sort: { field: 'hour', order: 'ASC' }
    }).then(({ data }) => setVisits(data))

    // Pedidos via WhatsApp últimas 24h
    dataProvider.getList('whatsappOrders', {
      pagination: { page: 1, perPage: 24 },
      sort: { field: 'hour', order: 'ASC' }
    }).then(({ data }) => setOrders(data))

    // Últimos 5 pedidos
    dataProvider.getList('latestOrders', {
      pagination: { page: 1, perPage: 5 },
      sort: { field: 'timestamp', order: 'DESC' }
    }).then(({ data }) => setLatestOrders(data))
  }, [dataProvider])

  return (
    <Box p={2} bgcolor="#FFFFFF">
      <Title title="Painel Cacau Cria" />
      <Grid container spacing={2}>
        {/* Visitas ao site */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" style={titleStyle}>Visitas (24h)</Typography>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={visits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#009FFD" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pedidos via WhatsApp */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" style={titleStyle}>Pedidos WhatsApp</Typography>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={orders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FFE666" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Últimos Pedidos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" style={titleStyle}>Últimos Pedidos</Typography>
              {latestOrders.map(order => (
                <Box
                  key={order.id}
                  display="flex"
                  alignItems="center"
                  mb={1}
                >
                  {order.userPhoto ? (
                    <img
                      src={order.userPhoto}
                      alt={order.userName}
                      width={40}
                      height={40}
                      style={{ borderRadius: '50%', marginRight: 8 }}
                    />
                  ) : (
                    <Box
                      width={40} height={40}
                      display="flex" alignItems="center" justifyContent="center"
                      bgcolor="#009FFD" color="#FFFFFF"
                      borderRadius="50%" mr={1}
                    >
                      {order.id}
                    </Box>
                  )}
                  <Typography style={subTitleStyle}>
                    {order.userName || `Pedido #${order.id}`} — {order.timestamp}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Atualizações Cacau Cria */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" style={titleStyle}>Novidades Cacau Cria</Typography>
              <Typography style={subTitleStyle} mb={1}>
                • Lançamos o módulo de pagamento online!  
              </Typography>
              <Typography style={subTitleStyle} mb={1}>
                • Novo tema “Noite Tropical” disponível.  
              </Typography>
              <Button variant="contained" size="small" sx={{ backgroundColor: '#009FFD', mt: 1 }}>
                Ver todas as novidades
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Suporte */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" style={titleStyle}>Suporte</Typography>
              <Typography style={subTitleStyle} mb={1}>
                Precisa de ajuda? Fale com nosso time.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                href="https://wa.me/5511999999999"
                target="_blank"
                sx={{ borderColor: '#009FFD', color: '#009FFD' }}
              >
                WhatsApp Suporte
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
