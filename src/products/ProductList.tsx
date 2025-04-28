import {
    List,
    Datagrid,
    TextField,
    NumberField,
    EditButton,
    DeleteButton
  } from 'react-admin'
  
  export const ProductList = () => (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="nome" />
        <NumberField
          source="preco"
          options={{ style: 'currency', currency: 'BRL' }}
        />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  )
  