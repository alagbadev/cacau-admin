// src/components/LoginPage.tsx

import { useState } from 'react'
import { useLogin, useNotify, Notification } from 'react-admin'
import { Button, TextField, Typography, Box } from '@mui/material'
import { styled } from '@mui/system'

// Frosted glass card container
const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  maxWidth: 400,
  width: '100%',
  boxShadow: (theme.shadows as string[])[3], // corrigido index sem erro TS
}))

const FullScreenContainer = styled(Box)({
  width: '100%',
  height: '100vh',
  margin: 0,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1350&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
})

export default function LoginPage() {
  const login = useLogin()
  const notify = useNotify()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ username: email, password })
    } catch (error: any) {
      notify(error?.response?.data?.message || 'Erro ao fazer login', { type: 'warning' })
    }
  }

  return (
    <FullScreenContainer>
      <form
        onSubmit={submit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: 400,
          margin: '0 auto', // <<< ESSA LINHA CENTRALIZA o form!
        }}
      >
        <GlassCard>
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              color: '#ffffff',
              mb: 2,
            }}
          >
            Painel Cacau Cria
          </Typography>

          <TextField
            label="E-mail"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ style: { color: '#fff' } }}
            sx={{ input: { color: '#fff' } }}
          />

          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: '#fff' } }}
            sx={{ input: { color: '#fff' } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: 'rgba(255,255,255,0.8)',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
            Entrar
          </Button>
        </GlassCard>
      </form>
      <Notification />
    </FullScreenContainer>
  )
}
