import { useGql } from '~/composables/useGql'
import type { ProductAdditional } from '~/types/products.type'

export const useProductAdditionalService = () => {
  const { gqlFetch } = useGql()

  const getProductAdditionals = async (productId: number) => {
    const query = `
      query GetProductAdditionals($productId: Int!) {
        getProductAdditionals(product_id: $productId) {
          id
          name
          price
          moq
          stock
          discount
          discount_type
          attributes
          product_id
          created_at
          updated_at
        }
      }
    `
    const response = await gqlFetch<{ getProductAdditionals: ProductAdditional[] }>(query, { productId }, { auth: true })
    return response?.getProductAdditionals || []
  }

  const getProductAdditionalDetail = async (id: number) => {
    const query = `
      query GetProductAdditionalDetail($id: Int!) {
        getProductAdditionalDetail(id: $id) {
          id
          name
          price
          moq
          stock
          discount
          discount_type
          attributes
          product_id
          created_at
          updated_at
        }
      }
    `
    const response = await gqlFetch<{ getProductAdditionalDetail: ProductAdditional }>(query, { id }, { auth: true })
    return response?.getProductAdditionalDetail
  }

  const createProductAdditional = async (input: (Omit<ProductAdditional, 'id' | 'created_at' | 'updated_at'> & { product_id: number })) => {
    const mutation = `
      mutation CreateProductAdditional(
        $name: String!,
        $moq: Int!,
        $price: Int!,
        $stock: Int!,
        $discount: Int,
        $discount_type: String,
        $attributes: String,
        $product_id: Int!
      ) {
        createProductAdditional(
          name: $name,
          moq: $moq,
          price: $price,
          stock: $stock,
          discount: $discount,
          discount_type: $discount_type,
          attributes: $attributes,
          product_id: $product_id
        ) {
          id
          name
          price
          moq
          stock
          discount
          discount_type
          attributes
          product_id
        }
      }
    `
    const response = await gqlFetch<{ createProductAdditional: ProductAdditional }>(mutation, input, { auth: true })
    return response?.createProductAdditional
  }

  const updateProductAdditional = async (id: number, input: Partial<Omit<ProductAdditional, 'id' | 'created_at' | 'updated_at'>>) => {
    const mutation = `
      mutation UpdateProductAdditional(
        $id: Int!,
        $name: String!,
        $moq: Int!,
        $price: Int!,
        $stock: Int!,
        $discount: Int!,
        $discount_type: String!,
        $attributes: String!
      ) {
        updateProductAdditional(
          id: $id,
          name: $name,
          moq: $moq,
          price: $price,
          stock: $stock,
          discount: $discount,
          discount_type: $discount_type,
          attributes: $attributes
        ) {
          id
          name
          price
          moq
          stock
          discount
          discount_type
          attributes
        }
      }
    `
    // Ensure all required fields are provided with sensible defaults
    const variables = {
      id,
      name: input.name ?? '',
      moq: Number(input.moq ?? 0),
      price: Number(input.price ?? 0),
      stock: Number(input.stock ?? 0),
      discount: Number(input.discount ?? 0),
      discount_type: input.discount_type ?? 'AMOUNT',
      attributes: typeof input.attributes === 'string' ? input.attributes : '[]',
    }
    const response = await gqlFetch<{ updateProductAdditional: ProductAdditional }>(mutation, variables, { auth: true })
    return response?.updateProductAdditional
  }

  const deleteProductAdditional = async (id: number) => {
    const mutation = `
      mutation DeleteProductAdditional($id: Int!) {
        deleteProductAdditional(id: $id)
      }
    `
    const response = await gqlFetch<{ deleteProductAdditional: boolean }>(mutation, { id }, { auth: true })
    return response?.deleteProductAdditional || false
  }

  return {
    getProductAdditionals,
    getProductAdditionalDetail,
    createProductAdditional,
    updateProductAdditional,
    deleteProductAdditional
  }
}
