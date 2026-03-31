import { ref, reactive, onMounted, watch } from "vue";
import { useGql } from "~/composables/useGql";
import type { Testimonial } from "~/types/testimonial.type";
import type { PageInfo } from "~/types/Pagination";

export const useTestimonialService = () => {
  const { gqlFetch } = useGql();

  const datas = ref<Testimonial[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  // Keep local page 0-based for UI consistency (like useProductService)
  const pagination = ref({ page: 0, limit: 10, total: 0 });
  const pageInfo = ref<PageInfo | null>(null);
  const params = reactive<{ keyword?: string; is_active?: boolean }>({});
  const detail = ref<Testimonial | null>(null);

  // List with server-side pagination
  const fetchList = async () => {
    loading.value = true;
    error.value = null;
    try {
      const query = `
        query GetTestimonials($page: Int!, $limit: Int!, $is_active: Boolean) {
          getTestimonials(pagination: { page: $page, limit: $limit }, is_active: $is_active) {
            items {
              id
              name
              job
              content
              rating
              orders
            }
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
      const serverLimit = pagination.value.limit || 10;
      const variables: any = {
        page: serverPage,
        limit: serverLimit,
        ...(params.is_active != null
          ? { is_active: Boolean(params.is_active) }
          : {}),
      };

      const res = await gqlFetch<{
        getTestimonials: {
          items: Array<{
            id: number;
            name: string;
            job: string;
            content: string;
            rating: number;
            orders: number;
          }>;
          page_info: PageInfo;
        };
      }>(query, variables, { auth: true });

      let items = (res?.getTestimonials?.items || []).map((it) => ({
        id: String(it.id),
        name: it.name,
        job: it.job,
        content: it.content,
        rating: it.rating,
        orders: it.orders,
        // When API list doesn't include is_active, fallback to filter param or true
        is_active: params.is_active ?? true,
      }));

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
        getTestimonialDetail(id: $id) {
          id
          name
          job
          content
          rating
          orders
          is_active
        }
      }
    `;
    const data = await gqlFetch<{
      getTestimonialDetail: {
        id: number;
        name: string;
        job: string;
        content: string;
        rating: number;
        orders: number;
        is_active: boolean;
      };
    }>(query, { id }, { auth: true });

    const d = data.getTestimonialDetail;
    return {
      id: String(d.id),
      name: d.name,
      job: d.job,
      content: d.content,
      rating: d.rating,
      orders: d.orders,
      is_active: d.is_active,
    } as Testimonial;
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
  }) => {
    const mutation = `
      mutation CreateTestimonial($name: String!, $job: String!, $content: String!, $rating: Int!, $orders: Int!, $is_active: Boolean!) {
        createTestimonial(name: $name, job: $job, content: $content, rating: $rating, orders: $orders, is_active: $is_active) {
          id
          name
          job
          content
          rating
          orders
          is_active
        }
      }
    `;
    const data = await gqlFetch<{
      createTestimonial: {
        id: number;
        name: string;
        job: string;
        content: string;
        rating: number;
        orders: number;
        is_active: boolean;
      };
    }>(mutation, vars, { auth: true });

    const c = data.createTestimonial;
    return {
      id: String(c.id),
      name: c.name,
      job: c.job,
      content: c.content,
      rating: c.rating,
      orders: c.orders,
      is_active: c.is_active,
    } as Testimonial;
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
  }) => {
    const mutation = `
      mutation UpdateTestimonial($id: Int!, $name: String!, $job: String, $content: String, $rating: Int, $orders: Int, $is_active: Boolean) {
        updateTestimonial(id: $id, name: $name, job: $job, content: $content, rating: $rating, orders: $orders, is_active: $is_active) {
          id
          name
          job
          content
          rating
          orders
          is_active
        }
      }
    `;
    const data = await gqlFetch<{
      updateTestimonial: {
        id: number;
        name: string;
        job: string;
        content: string;
        rating: number;
        orders: number;
        is_active: boolean;
      };
    }>(mutation, vars, { auth: true });

    const c = data.updateTestimonial;
    return {
      id: String(c.id),
      name: c.name,
      job: c.job,
      content: c.content,
      rating: c.rating,
      orders: c.orders,
      is_active: c.is_active,
    } as Testimonial;
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
