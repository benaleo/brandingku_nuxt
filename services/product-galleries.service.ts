import { useGql } from '~/composables/useGql'
import type { ProductGallery } from '~/types/products.type'

type CreateProductGalleryInput = {
  image: string
  orders: number
  product_id: number
}

type UpdateProductGalleryInput = Partial<{
  image: string
  orders: number
  product_id: number
}>

export const useProductGalleriesService = () => {
  const { gqlFetch } = useGql()

  const getProductGalleries = async (productId: number) => {
    const query = `
      query GetProductGalleries($productId: Int!) {
        getProductGalleries(product_id: $productId) {
          id
          product_id
          image
          orders
          created_at
          updated_at
        }
      }
    `
    const response = await gqlFetch<{ getProductGalleries: ProductGallery[] }>(query, { productId }, { auth: true })
    return response?.getProductGalleries || []
  }

  const getProductGalleryDetail = async (id: number) => {
    const query = `
      query GetProductGalleryDetail($id: Int!) {
        getProductGalleryDetail(id: $id) {
          id
          product_id
          image
          orders
          created_at
          updated_at
        }
      }
    `
    const response = await gqlFetch<{ getProductGalleryDetail: ProductGallery }>(query, { id }, { auth: true })
    return response?.getProductGalleryDetail
  }

  const createProductGallery = async (input: CreateProductGalleryInput) => {
    const mutation = `
      mutation CreateProductGallery(
        $image: String!,
        $orders: Int!,
        $product_id: Int!
      ) {
        createProductGallery(
          image: $image,
          orders: $orders,
          product_id: $product_id
        ) {
          id
          product_id
          image
          orders
        }
      }
    `
    const response = await gqlFetch<{ createProductGallery: ProductGallery }>(mutation, input, { auth: true })
    return response?.createProductGallery
  }

  const updateProductGallery = async (id: number, input: UpdateProductGalleryInput) => {
    const mutation = `
      mutation UpdateProductGallery(
        $id: Int!,
        $image: String,
        $orders: Int,
        $product_id: Int
      ) {
        updateProductGallery(
          id: $id,
          image: $image,
          orders: $orders,
          product_id: $product_id
        ) {
          id
          product_id
          image
          orders
        }
      }
    `
    const response = await gqlFetch<{ updateProductGallery: ProductGallery }>(mutation, { id, ...input }, { auth: true })
    return response?.updateProductGallery
  }

  const deleteProductGallery = async (id: number) => {
    const mutation = `
      mutation DeleteProductGallery($id: Int!) {
        deleteProductGallery(id: $id)
      }
    `
    const response = await gqlFetch<{ deleteProductGallery: boolean }>(mutation, { id }, { auth: true })
    return response?.deleteProductGallery || false
  }

  return {
    getProductGalleries,
    getProductGalleryDetail,
    createProductGallery,
    updateProductGallery,
    deleteProductGallery
  }
}
