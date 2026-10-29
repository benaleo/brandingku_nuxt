import { useGql } from '~/composables/useGql'
import type {
  BrandingDefault, BrandingMethod, BrandingMethodInput, BrandingTier, CategoryBrandingPrice, ProductBranding, ProductBrandingInput,
} from '~/types/branding.type'

const METHOD_FIELDS = 'id name description is_active orders created_at updated_at'
const PRODUCT_BRANDING_FIELDS = 'branding_method_id name description tiers { min_qty price } custom_price is_active'

export const useBrandingService = () => {
  const { gqlFetch } = useGql()

  const getBrandingMethods = async (isActive?: boolean) => {
    const res = await gqlFetch<{ getBrandingMethods: BrandingMethod[] }>(
      `query getBrandingMethods($active: Boolean) { getBrandingMethods(is_active: $active) { ${METHOD_FIELDS} } }`,
      { active: isActive ?? null },
    )
    return res.getBrandingMethods
  }

  const createBrandingMethod = async (input: BrandingMethodInput) => {
    const res = await gqlFetch<{ createBrandingMethod: BrandingMethod }>(
      `mutation createBrandingMethod($name: String!, $description: String, $active: Boolean, $orders: Int) {
        createBrandingMethod(name: $name, description: $description, is_active: $active, orders: $orders) { ${METHOD_FIELDS} }
      }`,
      { name: input.name, description: input.description, active: input.is_active, orders: input.orders },
      { auth: true },
    )
    return res.createBrandingMethod
  }

  const updateBrandingMethod = async (id: number, input: Partial<BrandingMethodInput>) => {
    const res = await gqlFetch<{ updateBrandingMethod: BrandingMethod }>(
      `mutation updateBrandingMethod($id: Int!, $name: String, $description: String, $active: Boolean, $orders: Int) {
        updateBrandingMethod(id: $id, name: $name, description: $description, is_active: $active, orders: $orders) { ${METHOD_FIELDS} }
      }`,
      { id, name: input.name ?? null, description: input.description ?? null, active: input.is_active ?? null, orders: input.orders ?? null },
      { auth: true },
    )
    return res.updateBrandingMethod
  }

  const deleteBrandingMethod = async (id: number) => {
    await gqlFetch('mutation deleteBrandingMethod($id: Int!) { deleteBrandingMethod(id: $id) }', { id }, { auth: true })
  }

  const getCategoryBrandingPrices = async (categoryId: number) => {
    const res = await gqlFetch<{ getCategoryBrandingPrices: CategoryBrandingPrice[] }>(
      `query getCategoryBrandingPrices($id: Int!) {
        getCategoryBrandingPrices(category_id: $id) { branding_method_id tiers { min_qty price } }
      }`,
      { id: categoryId },
      { auth: true },
    )
    return res.getCategoryBrandingPrices
  }

  const saveCategoryBrandingPrices = async (categoryId: number, prices: { branding_method_id: number; tiers: BrandingTier[] }[]) => {
    await gqlFetch(
      `mutation saveCategoryBrandingPrices($id: Int!, $prices: [CategoryBrandingPriceInput!]!) {
        saveCategoryBrandingPrices(category_id: $id, prices: $prices) { branding_method_id }
      }`,
      { id: categoryId, prices },
      { auth: true },
    )
  }

  const getBrandingDefaults = async (categoryId: number) => {
    const res = await gqlFetch<{ getBrandingDefaults: BrandingDefault[] }>(
      `query getBrandingDefaults($id: Int!) {
        getBrandingDefaults(category_id: $id) { branding_method_id category_id category_name tiers { min_qty price } }
      }`,
      { id: categoryId },
      { auth: true },
    )
    return res.getBrandingDefaults
  }

  const getProductBrandings = async (productId: number) => {
    const res = await gqlFetch<{ getProductBrandings: ProductBranding[] }>(
      `query getProductBrandings($id: Int!) { getProductBrandings(product_id: $id) { ${PRODUCT_BRANDING_FIELDS} } }`,
      { id: productId },
      { auth: true },
    )
    return res.getProductBrandings
  }

  const saveProductBrandings = async (productId: number, brandings: ProductBrandingInput[]) => {
    await gqlFetch(
      `mutation saveProductBrandings($id: Int!, $brandings: [ProductBrandingInput!]!) {
        saveProductBrandings(product_id: $id, brandings: $brandings) { branding_method_id }
      }`,
      { id: productId, brandings },
      { auth: true },
    )
  }

  return {
    getBrandingMethods, createBrandingMethod, updateBrandingMethod, deleteBrandingMethod,
    getCategoryBrandingPrices, saveCategoryBrandingPrices, getBrandingDefaults, getProductBrandings, saveProductBrandings,
  }
}
