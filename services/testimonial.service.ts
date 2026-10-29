import { ref, reactive, onMounted, watch } from "vue";
import { useGql } from "~/composables/useGql";
import type { Testimonial, TestimonialPlacement } from "~/types/testimonial.type";
import type { PageInfo } from "~/types/Pagination";

const FIELDS = "id name job content rating orders is_active placement product_id product_name order_id public_consent created_at";
const toTestimonial = (t: Omit<Testimonial, "id"> & { id: number }): Testimonial => ({ ...t, id: String(t.id) });

// stars: ratings from that many stars up to the next (4 -> 4 and 4.5)
type TestimonialParams = { keyword?: string; is_active?: boolean; placement?: string; product_id?: number; source?: string; stars?: number; limit?: number };

// initial: list filters set before the first fetch, without triggering one
export const useTestimonialService = (initial: TestimonialParams = {}) => {
  const { gqlFetch } = useGql();

  const datas = ref<Testimonial[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  // Keep local page 0-based for UI consistency (like useProductService)
  const pagination = ref({ page: 0, limit: 10, total: 0 });
  const pageInfo = ref<PageInfo | null>(null);
  // placement: landing_page | product; source: customer (written after an order) | console
  const params = reactive<TestimonialParams>({ ...initial });
  const detail = ref<Testimonial | null>(null);

  // List with server-side pagination
  const fetchList = async () => {
    loading.value = true;
    error.value = null;
    try {
      const query = `
        query GetTestimonials($page: Int!, $limit: Int!, $is_active: Boolean, $placement: String, $product_id: Int, $source: String, $stars: Int) {
          getTestimonials(pagination: { page: $page, limit: $limit }, is_active: $is_active, placement: $placement, product_id: $product_id, source: $source, stars: $stars) {
            items { ${FIELDS} }
            page_info {
              current_page
              per_page
              total_items
              total_pages
              has_next_page
              has_previous_page
              start_item
              end_item
            }
          }
        }
      `;

      // server is 1-based pages; local is 0-based
      const serverPage = (pagination.value.page || 0) + 1;
      const serverLimit = params.limit || pagination.value.limit || 10;
      const variables: any = {
        page: serverPage,
        limit: serverLimit,
        ...(params.is_active != null
          ? { is_active: Boolean(params.is_active) }
          : {}),
        placement: params.placement || null,
        product_id: params.product_id ?? null,
        source: params.source || null,
        stars: params.stars ?? null,
      };

      const res = await gqlFetch<{
        getTestimonials: {
          items: Array<Omit<Testimonial, 'id'> & { id: number }>;
          page_info: PageInfo;
        };
      }>(query, variables, { auth: true });

      let items: Testimonial[] = (res?.getTestimonials?.items || []).map(toTestimonial);

      // testimonial-side keyword filter (by name)
      const kw = params.keyword?.toLowerCase()?.trim();
      if (kw && kw.length >= 1) {
        items = items.filter((x) => (x.name || "").toLowerCase().includes(kw));
      }

      // Update pagination from server; keep local page 0-based
      pageInfo.value = res?.getTestimonials?.page_info || null;
      if (pageInfo.value) {
        pagination.value.limit = Number(pageInfo.value.per_page || serverLimit);
        pagination.value.total = Number(
          pageInfo.value.total_items || items.length
        );
        const cp = Number(pageInfo.value.current_page || serverPage);
        pagination.value.page = cp > 0 ? cp - 1 : 0;
      } else {
        // Fallback
        pagination.value.total = items.length;
      }

      datas.value = items;
    } catch (e: any) {
      console.error("[testimonial] fetchList error:", e);
      error.value = e?.message || "Failed to load testimonials";
    } finally {
      loading.value = false;
    }
  };

  const changePage = (newPage: number) => {
    pagination.value.page = newPage;
    fetchList();
  };
  const changeLimit = (newLimit: number) => {
    pagination.value.limit = newLimit;
    fetchList();
  };
  const setParams = (newParams: Record<string, any>) => {
    Object.assign(params, newParams);
  };
  const reFetch = () => fetchList();

  watch(params, fetchList, { deep: true });
  onMounted(() => {
    // Remove automatic fetching - will be called manually when component is in view
  });

  // Detail
  const getTestimonialDetail = async (id: number) => {
    const query = `
      query GetTestimonialDetail($id: Int!) {
        getTestimonialDetail(id: $id) { ${FIELDS} }
      }
    `;
    const data = await gqlFetch<{ getTestimonialDetail: Omit<Testimonial, 'id'> & { id: number } }>(query, { id }, { auth: true });
    return toTestimonial(data.getTestimonialDetail);
  };

  const loadDetail = async (id: number) => {
    detail.value = await getTestimonialDetail(id);
    return detail.value;
  };

  // Create
  const createTestimonial = async (vars: {
    name: string;
    job: string;
    content: string;
    rating: number;
    orders: number;
    is_active: boolean;
    placement: TestimonialPlacement;
    product_id: number | null;
  }) => {
    const mutation = `
      mutation CreateTestimonial($name: String!, $job: String!, $content: String!, $rating: Float!, $orders: Int!, $is_active: Boolean!, $placement: String, $product_id: Int) {
        createTestimonial(name: $name, job: $job, content: $content, rating: $rating, orders: $orders, is_active: $is_active, placement: $placement, product_id: $product_id) { ${FIELDS} }
      }
    `;
    const data = await gqlFetch<{ createTestimonial: Omit<Testimonial, 'id'> & { id: number } }>(mutation, vars, { auth: true });
    return toTestimonial(data.createTestimonial);
  };

  // Update
  const updateTestimonial = async (vars: {
    id: number;
    name: string;
    job?: string;
    content?: string;
    rating?: number;
    orders?: number;
    is_active?: boolean;
    placement?: TestimonialPlacement;
    product_id?: number | null;
  }) => {
    const mutation = `
      mutation UpdateTestimonial($id: Int!, $name: String!, $job: String, $content: String, $rating: Float, $orders: Int, $is_active: Boolean, $placement: String, $product_id: Int) {
        updateTestimonial(id: $id, name: $name, job: $job, content: $content, rating: $rating, orders: $orders, is_active: $is_active, placement: $placement, product_id: $product_id) { ${FIELDS} }
      }
    `;
    const data = await gqlFetch<{ updateTestimonial: Omit<Testimonial, 'id'> & { id: number } }>(mutation, vars, { auth: true });
    return toTestimonial(data.updateTestimonial);
  };

  // Delete
  const deleteTestimonial = async (id: number) => {
    const mutation = `
      mutation DeleteTestimonial($id: Int!) {
        deleteTestimonial(id: $id)
      }
    `;
    const data = await gqlFetch<{ deleteTestimonial: boolean }>(
      mutation,
      { id },
      { auth: true }
    );
    return data.deleteTestimonial;
  };

  const deleteTestimonialById = async (id: string) => deleteTestimonial(Number(id));

  return {
    // list state
    datas,
    loading,
    error,
    pagination,
    pageInfo,
    params,
    setParams,
    changePage,
    changeLimit,
    reFetch,

    // detail
    detail,
    loadDetail,

    // CRUD
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    deleteTestimonialById,
  };
};
