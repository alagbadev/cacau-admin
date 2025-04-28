import {
    List,
    SimpleForm,
    TextInput,
    required,
    useNotify,
    useDataProvider,
    SaveButton,
    Toolbar
  } from 'react-admin'
  import { Box, Typography } from '@mui/material'
  import { ColorInput } from './ColorInput'
  
  const CustomToolbar = (props: any) => (
    <Toolbar {...props}>
      <SaveButton />
    </Toolbar>
  )
  
  export const ThemeList = () => {
    const notify = useNotify()
    const dataProvider = useDataProvider()
  
    const onSave = async (values: any) => {
      // Atualiza settings via sua API
      await Promise.all(
        Object.entries(values).map(([key, val]) =>
          dataProvider.update('settings', {
            id: key,
            data: { valor: val },
            previousData: { valor: val }       // <— adicionado
          })
        )
      )
      notify('Configurações salvas', { type: 'info' })
    }
  
    return (
      <List actions={false}>
        <Box p={2}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins' }}>
            Personalização do Site
          </Typography>
          <SimpleForm
            onSubmit={onSave}
            toolbar={<CustomToolbar />}
            mode="onBlur"
          >
            <TextInput
              source="siteTitle"
              label="Título do Site"
              validate={required()}
              sx={{ mb: 2, fontFamily: 'Inter' }}
            />
            <ColorInput
              source="primaryColor"
              label="Cor Primária"
              validate={required()}
              sx={{ mb: 2 }}
            />
            <ColorInput
              source="secondaryColor"
              label="Cor Secundária"
              validate={required()}
              sx={{ mb: 2 }}
            />
            <TextInput
              source="logoUrl"
              label="URL do Logo"
              validate={required()}
            />
          </SimpleForm>
        </Box>
      </List>
    )
  }
  