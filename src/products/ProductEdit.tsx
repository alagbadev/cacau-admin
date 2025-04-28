import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ImageInput,
    ImageField
  } from 'react-admin'
  
  export const ProductEdit = () => (
    <Edit>
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
    </Edit>
  )
  