// src/products/CategoryList.tsx
import { List, Datagrid, TextField } from 'react-admin';

export const CategoryList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="nome" />
    </Datagrid>
  </List>
);
