import type { ProductCategory } from "~/types/products.type";
import { ref, reactive, onMounted, watch } from 'vue'
import { useGql } from '~/composables/useGql'


export const useProductCategoryService = (opts?: { autoFetchParents?: boolean }) => {
    const { gqlFetch } = useGql()

    // State for list view (client-side pagination over GraphQL results)
    const datas = ref<ProductCategory[]>([])
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const pagination = ref({ page: 0, limit: 10, total: 0 })
    const params = reactive<{ keyword?: string }>({})
    const detail = ref<ProductCategory | null>(null)

    const fetchParents = async () => {
        loading.value = true
        error.value = null
        try {
            const query = `
                query getProductCategories {
                    getProductCategories {
                        id
                        name
                        slug
                        description
                        image
                        is_landing_page
                        is_active
                        created_at
                        updated_at
                        parent_id
                    }
                }
            `
            const res = await gqlFetch<{ getProductCategories: ProductCategory[] }>(
                query,
                undefined,
                { auth: true }
            )
            const all = (res?.getProductCategories || []) as ProductCategory[]

            // only parents
            let filtered = (all as any[]).filter((x) => x?.parent_id == null)

            // filter by keyword (name or slug)
            const kw = params.keyword?.toLowerCase()?.trim()
            if (kw && kw.length >= 1) {
                filtered = filtered.filter((x: any) =>
                    (x.name || '').toLowerCase().includes(kw) ||
                    (x.slug || '').toLowerCase().includes(kw)
                )
            }

            // client-side pagination
            pagination.value.total = filtered.length
            const start = (pagination.value.page || 0) * (pagination.value.limit || 10)
            const end = start + (pagination.value.limit || 10)
            datas.value = filtered.slice(start, end)
        } catch (e: any) {
            console.error('[product-category] fetchParents error:', e)
            error.value = e?.message || 'Gagal memuat data kategori'
        } finally {
            loading.value = false
        }
    }

    const reFetch = () => fetchParents()
    const changePage = (newPage: number) => {
        pagination.value.page = newPage
        fetchParents()
    }
    const changeLimit = (newLimit: number) => {
        pagination.value.limit = newLimit
        fetchParents()
    }
    const setParams = (newParams: Record<string, any>) => {
        Object.assign(params, newParams)
    }

    const autoFetchParents = opts?.autoFetchParents ?? true
    if (autoFetchParents) {
        watch(params, fetchParents, { deep: true })
        onMounted(fetchParents)
    }

    // Get all parent categories
    const getProductCategoriesParent = async () => {
        const query = `
            query getProductCategories {
                getProductCategories {
                    id
                    name
                }
            }
        `

        const data = await gqlFetch<{ getProductCategories: ProductCategory[] }>(
            query,
            undefined,
            { auth: true }
        )
        return data.getProductCategories
    }

    // Detail by id
    const getProductCategoryDetail = async (id: number) => {
        const query = `
            query GetProductCategoryDetail($id: Int!) {
                getProductCategoryDetail(id: $id) {
                    id
                    name
                    slug
                    description
                    image
                    is_landing_page
                    is_active
                    sub_categories {
                        id
                        name
                        slug
                    }
                }
            }
        `
        const data = await gqlFetch<{ getProductCategoryDetail: ProductCategory }>(
            query,
            { id },
            { auth: true }
        )
        return data.getProductCategoryDetail
    }

    // Get sub categories for a parent
    const getSubCategories = async (parentId: number): Promise<string[]> => {
        const query = `
            query getProductCategories {
                getProductCategories {
                    id
                    name
                    parent_id
                }
            }
        `
        const res = await gqlFetch<{ getProductCategories: ProductCategory[] }>(
            query,
            undefined,
            { auth: true }
        )
        const children = (res?.getProductCategories || []).filter(cat => cat.parent_id === parentId).map(cat => cat.name)
        return children
    }

    const loadDetail = async (id: number) => {
        const detailData = await getProductCategoryDetail(id)
        // Sub-categories are now included in the getProductCategoryDetail response
        detail.value = detailData
        return detail.value
    }

    // Children as full objects
    const getChildCategoriesByParentId = async (parentId: number, isAll: boolean) => {
        const query = `
            query GetProductCategoriesChild($parent_id: Int, $is_all: Boolean) {
                getProductCategoriesChild(parent_id: $parent_id, is_all: $is_all) {
                    id
                    name
                    slug
                    description
                    image
                    is_landing_page
                    is_active
                    created_at
                    updated_at
                    parent_id
                }
            }
        `
        const res = await gqlFetch<{ getProductCategoriesChild: ProductCategory[] }>(
            query,
            { parent_id: parentId },
            { auth: true }
        )
        const all = (res?.getProductCategoriesChild || []) as ProductCategory[]
        return all.filter((x: any) => Number(x.parent_id) === Number(parentId))
    }

    // Create a child category under a parent, auto-prefix slug with parent slug
    const createChildCategory = async (parentId: number, payload: {
        name: string
        slug?: string | null
        description: string
        image?: string
        is_landing_page?: boolean
        is_active?: boolean
    }) => {
        const parent = await getProductCategoryDetail(parentId)
        const base = (payload.slug ?? payload.name)
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
        const slug = `${parent.slug}-${base}`
        return await createProductCategory({
            name: payload.name,
            slug,
            description: payload.description,
            image: payload.image,
            parent_id: parentId,
            is_landing_page: payload.is_landing_page,
        })
    }

    // Update a child category
    const updateChildCategory = async (childId: number, payload: {
        name: string
        slug?: string | null
        description: string
        image?: string
        is_landing_page?: boolean
        is_active?: boolean
    }) => {
        // Keep slug if not provided
        const current = await getProductCategoryDetail(childId)
        return await updateProductCategory({
            id: Number(childId),
            name: payload.name,
            slug: payload.slug ?? current.slug,
            description: payload.description,
            image: payload.image,
            is_landing_page: payload.is_landing_page,
            is_active: payload.is_active,
        })
    }

    // Create a new product category
    const createProductCategory = async (vars: {
        name: string
        slug: string
        description?: string
        image?: string
        parent_id?: number
        is_landing_page?: boolean
    }) => {
        const mutation = `
            mutation CreateProductCategory(
                $name: String!,
                $slug: String!,
                $description: String,
                $image: String,
                $parent_id: Int,
                $is_landing_page: Boolean
            ) {
                createProductCategory(
                    name: $name,
                    slug: $slug,
                    description: $description,
                    image: $image,
                    parent_id: $parent_id,
                    is_landing_page: $is_landing_page
                ) {
                    id
                    name
                    slug
                    description
                    image
                    is_landing_page
                    is_active
                    created_at
                    updated_at
                }
            }
        `
        
        // Prepare the variables, including sub_categories if they exist
        const variables: any = { ...vars }

        const data = await gqlFetch<{ createProductCategory: ProductCategory }>(
            mutation,
            variables,
            { auth: true }
        )
        return data.createProductCategory
    }

    // Update an existing product category
    const updateProductCategory = async (vars: {
        id: number
        name?: string
        slug?: string
        description?: string
        image?: string
        parent_id?: number
        is_landing_page?: boolean
        is_active?: boolean
        sub_categories?: string[]
    }) => {
        const mutation = `
            mutation UpdateProductCategory(
                $id: Int!,
                $name: String!,
                $slug: String!,
                $description: String,
                $image: String,
                $parent_id: Int,
                $is_landing_page: Boolean,
                $is_active: Boolean
            ) {
                updateProductCategory(
                    id: $id,
                    name: $name,
                    slug: $slug,
                    description: $description,
                    image: $image,
                    parent_id: $parent_id,
                    is_landing_page: $is_landing_page,
                    is_active: $is_active
                ) {
                    id
                    name
                    slug
                    description
                    image
                    is_landing_page
                    is_active
                    created_at
                    updated_at
                }
            }
        `
        
        // Prepare the variables, including sub_categories if they exist
        const variables: any = { ...vars }
        const data = await gqlFetch<{ updateProductCategory: ProductCategory }>(
            mutation,
            variables,
            { auth: true }
        )
        return data.updateProductCategory
    }

    // Create along with sub categories
    const createProductCategoryWithSubs = async (vars: {
        name: string
        slug?: string | null
        description: string
        image?: string
        sub_categories?: string[]
        is_landing_page: boolean
        is_active: boolean
    }) => {
        // create parent
        const parentSlug = (vars.slug ?? vars.name)
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
        const parent = await createProductCategory({
            name: vars.name,
            slug: parentSlug,
            description: vars.description,
            image: vars.image,
            is_landing_page: vars.is_landing_page,
            // is_active handled by backend default or separate mutation if required
        })

        console.log('sub categories list', vars.sub_categories)

        // create subs if provided
        if (Array.isArray(vars.sub_categories) && vars.sub_categories.length) {
            // fetch existing children names to avoid duplicates
            const existingNames = await getSubCategories(Number(parent.id))
            for (const sub of vars.sub_categories) {
                const subName = String(sub).trim()
                if (!subName) continue
                if (existingNames.includes(subName)) continue
                const subSlug = subName
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '')
                await createProductCategory({
                    name: subName,
                    slug: parent.slug + "-" + subSlug,
                    description: '-',
                    parent_id: Number(parent.id),
                })
            }
        }
        return parent
    }

    // Update by id and optionally create new sub categories
    const updateProductCategoryById = async (
        id: string | number,
        vars: {
            name: string
            slug?: string | null
            description: string
            image?: string
            sub_categories?: string[]
            is_landing_page: boolean
            is_active: boolean
        }
    ) => {
        const updated = await updateProductCategory({
            id: Number(id),
            name: vars.name,
            slug: vars.slug ?? undefined,
            description: vars.description,
            image: vars.image ?? undefined,
            is_landing_page: vars.is_landing_page,
        })
        if (Array.isArray(vars.sub_categories) && vars.sub_categories.length) {
            // get parent detail and existing children to avoid duplicates and prefix slug
            const parentDetail = await getProductCategoryDetail(Number(id))
            const existingChildren = await getChildCategoriesByParentId(Number(id))
            const existingSlugs = new Set(existingChildren.map(c => c.slug))
            
            for (const sub of vars.sub_categories) {
                const subName = String(sub).trim()
                if (!subName) continue
                
                // Generate the expected slug
                const subSlug = subName
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '')
                const fullSlug = `${parentDetail.slug}-${subSlug}`
                
                // Skip if a category with this slug already exists
                if (existingSlugs.has(fullSlug)) continue
                
                try {
                    await createProductCategory({
                        name: subName,
                        slug: fullSlug,
                        description: '-',
                        parent_id: Number(id),
                    })
                    // Add to existing slugs to prevent duplicates in the same batch
                    existingSlugs.add(fullSlug)
                } catch (error) {
                    console.error(`Failed to create sub-category "${subName}":`, error)
                    // Continue with next sub-category even if one fails
                }
            }
        }
        return updated
    }

// Delete a product category
const deleteProductCategory = async (id: number) => {
    const mutation = `
        mutation DeleteProductCategory($id: Int!) {
            deleteProductCategory(id: $id)
        }
    `

    const data = await gqlFetch<{ deleteProductCategory: boolean }>(
        mutation,
        { id },
        { auth: true }
    )
    return data.deleteProductCategory
}

// GraphQL wrappers to match page usages
const updateProductCategoryImage = async (id: string, payload: { url: string }) => {
    const mutation = `
        mutation UpdateProductCategoryImage($id: Int!, $image: String!) {
            updateProductCategory(id: $id, image: $image) {
                id
                image
            }
        }
    `
    const data = await gqlFetch<{ updateProductCategory: { id: string; image: string } }>(
        mutation,
        { id: Number(id), image: payload.url },
        { auth: true }
    )
    return data.updateProductCategory
}

const deleteProductCategoryById = async (id: string) => {
    const deleted = await deleteProductCategory(Number(id))
    return deleted
}

return {
    // GraphQL list state (backward-compatible shape for the page)
    datas,
    loading,
    error,
    pagination,
    changePage,
    changeLimit,
    setParams,
    params,
    reFetch,
    deleteProductCategoryById,
    updateProductCategoryImage,

    // Detail helpers
    detail,
    loadDetail,

    // GraphQL APIs
    getProductCategoriesParent,
    getProductCategoryDetail,
    createProductCategory,
    createProductCategoryWithSubs,
    updateProductCategory,
    updateProductCategoryById,
    deleteProductCategory,
    // Children helpers
    getChildCategoriesByParentId,
    createChildCategory,
    updateChildCategory,
}
}