import { 
    Create, 
    SimpleForm, 
    TextInput, 
    NumberInput, 
    ImageInput, 
    ImageField 
  } from 'react-admin'
  
  export const ProductCreate = () => (
    <Create>
      <SimpleForm>
        <TextInput source="nome" />
        <NumberInput source="preco" />
        <ImageInput 
  source="imagem" 
  label="Foto" 
  accept={{ 'image/*': [] }}
>
  <ImageField source="src" title="title" />
</ImageInput>

        <TextInput source="categoria" />
      </SimpleForm>
    </Create>
  )
  