// src/themes/ColorInput.tsx

import { useInput, InputProps } from 'react-admin'
import { TextField } from '@mui/material'
import { SxProps, Theme } from '@mui/material'

export interface ColorInputProps extends InputProps {
  source: string
  label?: string
  sx?: SxProps<Theme>   // apenas para permitir o sx
}

export const ColorInput = (props: ColorInputProps) => {
  const {
    field,
    fieldState: { invalid, error },
    isRequired
  } = useInput(props)

  return (
    <TextField
      type="color"
      label={props.label}
      {...field}
      required={isRequired}
      error={invalid}
      helperText={error?.message}
      variant="outlined"
      size="small"
      fullWidth
      margin="normal"
      sx={props.sx} // <-- agora aceitaremos 'sx' sem erros
    />
  )
}
