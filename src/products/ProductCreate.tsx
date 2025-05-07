// src/products/ProductCreate.tsx
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ImageInput,
  ImageField,
  required,
  useNotify,
  useRedirect,
} from 'react-admin';

export const ProductCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Create title="Criar Produto" redirect="list">
      <SimpleForm
        onSuccess={() => {
          notify('Produto criado com sucesso!');
          redirect('list');
        }}
        transform={(data: any) => ({
          ...data,
          imagem:
            typeof data.imagem === 'object' && data.imagem !== null
              ? (data.imagem as any).title
              : data.imagem,
        })}
      >
        <TextInput source="nome" label="Nome" validate={required()} fullWidth />
        <NumberInput source="preco" label="Preço (R$)" validate={required()} />
        <ImageInput source="imagem" label="Foto" accept={['image/*'] as readonly string[]}>
          <ImageField source="src" title="title" />
        </ImageInput>
        <TextInput source="descricao" label="Descrição" fullWidth multiline />
        <TextInput source="adicionais" label="Adicionais" fullWidth />
        <TextInput source="combina_com" label="Combina com" fullWidth />
        <TextInput source="categoria" label="Categoria" validate={required()} />
      </SimpleForm>
    </Create>
  );
};