import { ref, reactive, onMounted, watch } from "vue";
import { useGql } from "~/composables/useGql";
import type { Benefit } from "~/types/benefit.type";
import type { PageInfo } from "~/types/Pagination";

export const useBenefitService = () => {
  const { gqlFetch } = useGql();

  const datas = ref<Benefit[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  // Keep local page 0-based for UI consistency (like useProductService)
  const pagination = ref({ page: 0, limit: 10, total: 0 });
  const pageInfo = ref<PageInfo | null>(null);
  const params = reactive<{ keyword?: string; is_active?: boolean }>({});
  const detail = ref<Benefit | null>(null);

  // List with server-side pagination
  const fetchList = async () => {
    loading.value = true;
    error.value = null;
    try {
      const query = `
        query GetBenefits($page: Int!, $limit: Int!, $is_active: Boolean) {
          getBenefits(pagination: { page: $page, limit: $limit }, is_active: $is_active) {
            items {
              id
              name
              logo
              question
              answer
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
        getBenefits: {
          items: Array<{
            id: number;
            name: string;
            logo: string;
            orders: number;
            question: string;
            answer: string;
          }>;
          page_info: PageInfo;
        };
      }>(query, variables, { auth: true });

      let items = (res?.getBenefits?.items || []).map((it) => ({
        id: String(it.id),
        name: it.name,
        logo: it.logo,
        orders: it.orders,
        question: it.question,
        answer: it.answer,
        // When API list doesn't include is_active, fallback to filter param or true
        is_active: params.is_active ?? true,
      }));

      // benefit-side keyword filter (by name)
      const kw = params.keyword?.toLowerCase()?.trim();
      if (kw && kw.length >= 1) {
        items = items.filter((x) => (x.name || "").toLowerCase().includes(kw));
      }

      // Update pagination from server; keep local page 0-based
      pageInfo.value = res?.getBenefits?.page_info || null;
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
      console.error("[benefit] fetchList error:", e);
      error.value = e?.message || "Failed to load benefits";
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
  onMounted(fetchList);

  // Detail
  const getBenefitDetail = async (id: number) => {
    const query = `
      query GetBenefitDetail($id: Int!) {
        getBenefitDetail(id: $id) {
          id
          name
          logo
          question
          answer
          orders
          is_active
        }
      }
    `;
    const data = await gqlFetch<{
      getBenefitDetail: {
        id: number;
        name: string;
        logo: string;
        orders: number;
        question: string;
        answer: string;
        is_active: boolean;
      };
    }>(query, { id }, { auth: true });

    const d = data.getBenefitDetail;
    return {
      id: String(d.id),
      name: d.name,
      logo: d.logo,
      question: d.question,
      answer: d.answer,
      orders: d.orders,
      is_active: d.is_active,
    } as Benefit;
  };

  const loadDetail = async (id: number) => {
    detail.value = await getBenefitDetail(id);
    return detail.value;
  };

  // Create
  const createBenefit = async (vars: {
    name: string;
    logo: string;
    orders: number;
    question: string;
    answer: string;
    is_active: boolean;
  }) => {
    const mutation = `
      mutation CreateBenefit($name: String!, $logo: String!, $orders: Int!, $question: String!, $answer: String!, $is_active: Boolean!) {
        createBenefit(name: $name, logo: $logo, orders: $orders, question:$question, answer: $answer, is_active: $is_active) {
          id
          name
          logo
          question
          answer
          orders
          is_active
        }
      }
    `;
    const data = await gqlFetch<{
      createBenefit: {
        id: number;
        name: string;
        logo: string;
        orders: number;
        question: string;
        answer: string;
        is_active: boolean;
      };
    }>(mutation, vars, { auth: true });

    const c = data.createBenefit;
    return {
      id: String(c.id),
      name: c.name,
      logo: c.logo,
      question: c.question,
      answer: c.answer,
      orders: c.orders,
      is_active: c.is_active,
    } as Benefit;
  };

  // Update
  const updateBenefit = async (vars: {
    id: number;
    name: string;
    logo?: string;
    question?: string;
    answer?: string;
    orders?: number;
    is_active?: boolean;
  }) => {
    const mutation = `
      mutation UpdateBenefit($id: Int!, $name: String!, $logo: String, $orders: Int, $question: String; $answer: String; $is_active: Boolean) {
        updateBenefit(id: $id, name: $name, logo: $logo, orders: $orders, question: $question, answer: $answer, is_active: $is_active) {
          id
          name
          logo
          question
          answer
          orders
          is_active
        }
      }
    `;
    const data = await gqlFetch<{
      updateBenefit: {
        id: number;
        name: string;
        logo: string;
        orders: number;
        question: string;
        answer: string;
        is_active: boolean;
      };
    }>(mutation, vars, { auth: true });

    const c = data.updateBenefit;
    return {
      id: String(c.id),
      name: c.name,
      logo: c.logo,
      question: c.question,
      answer: c.answer,
      orders: c.orders,
      is_active: c.is_active,
    } as Benefit;
  };

  const updateBenefitImage = async (id: string, payload: { url: string }) => {
    // Convenience wrapper: ensure we have a name to satisfy updateBenefit mutation
    let name = detail.value?.name;
    if (!name) {
      const d = await getBenefitDetail(Number(id));
      name = d.name;
    }
    const updated = await updateBenefit({
      id: Number(id),
      name: name || "",
      logo: payload.url,
    });
    return updated;
  };

  // Delete
  const deleteBenefit = async (id: number) => {
    const mutation = `
      mutation DeleteBenefit($id: Int!) {
        deleteBenefit(id: $id)
      }
    `;
    const data = await gqlFetch<{ deleteBenefit: boolean }>(
      mutation,
      { id },
      { auth: true }
    );
    return data.deleteBenefit;
  };

  const deleteBenefitById = async (id: string) => deleteBenefit(Number(id));

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
    createBenefit,
    updateBenefit,
    deleteBenefit,
    deleteBenefitById,
    updateBenefitImage,
  };
};
