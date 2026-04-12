import { ref, reactive, onMounted, watch } from "vue";
import { useGql } from "~/composables/useGql";
import type { Inquiry } from "~/types/inquiry.type";
import type { PageInfo } from "~/types/Pagination";

export const useWebContactService = (fetchResult?: boolean, dataId?: string) => {
  const { gqlFetch } = useGql();

  const datas = ref<Inquiry[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const pagination = ref({ page: 0, limit: 10, total: 0 });
  const pageInfo = ref<PageInfo | null>(null);
  const params = reactive<{ keyword?: string }>({});
  const detail = ref<Inquiry | null>(null);

  // List with server-side pagination
  const fetchList = async () => {
    if (!fetchResult) return;
    loading.value = true;
    error.value = null;
    try {
      const query = `
        query getReportMessages($page: Int!, $limit: Int!) {
          getReportMessages(pagination: {limit: $limit, page: $page}) {
            items {
              id
              name
              email
              subject
              message
              model
              status
              created_at
              created_by
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

      const serverPage = (pagination.value.page || 0) + 1;
      const serverLimit = pagination.value.limit || 10;
      const variables: any = {
        page: serverPage,
        limit: serverLimit,
      };

      const res = await gqlFetch<{
        getReportMessages: {
          items: Inquiry[];
          page_info: PageInfo;
        };
      }>(query, variables, { auth: true });

      let items = (res?.getReportMessages?.items || []).map((it) => ({
        id: it.id,
        name: it.name,
        email: it.email,
        subject: it.subject,
        message: it.message,
        model: it.model,
        status: it.status,
        created_at: it.created_at,
        created_by: it.created_by,
      }));

      // keyword filter (by name, email, subject)
      const kw = params.keyword?.toLowerCase()?.trim();
      if (kw && kw.length >= 1) {
        items = items.filter((x) =>
          (x.name || "").toLowerCase().includes(kw) ||
          (x.email || "").toLowerCase().includes(kw) ||
          (x.subject || "").toLowerCase().includes(kw)
        );
      }

      // Update pagination from server; keep local page 0-based
      pageInfo.value = res?.getReportMessages?.page_info || null;
      if (pageInfo.value) {
        pagination.value.limit = Number(pageInfo.value.per_page || serverLimit);
        pagination.value.total = Number(
          pageInfo.value.total_items || items.length
        );
        const cp = Number(pageInfo.value.current_page || serverPage);
        pagination.value.page = cp > 0 ? cp - 1 : 0;
      } else {
        pagination.value.total = items.length;
      }

      datas.value = items;
    } catch (e: any) {
      console.error("[web-contact] fetchList error:", e);
      error.value = e?.message || "Failed to load inquiries";
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
  const reFetch = () => {
    if (fetchResult) return fetchList();
    if (dataId) return getInquiryDetail(Number(dataId));
  };

  watch(params, fetchList, { deep: true });
  onMounted(() => {
    reFetch();
  });

  // Detail
  const getInquiryDetail = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const query = `
        query getReportMessageDetail($id: Int!) {
          getReportMessageDetail(id: $id) {
            id
            name
            email
            subject
            message
            model
            status
            created_at
            created_by
          }
        }
      `;
      const data = await gqlFetch<{
        getReportMessageDetail: Inquiry;
      }>(query, { id }, { auth: true });

      detail.value = data.getReportMessageDetail;
      return detail.value;
    } catch (e: any) {
      console.error("[web-contact] getInquiryDetail error:", e);
      error.value = e?.message || "Failed to load inquiry detail";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const loadDetail = async (id: number) => {
    detail.value = await getInquiryDetail(id);
    return detail.value;
  };

  // Create (for contact form)
  const createInquiry = async (vars: {
    name: string;
    email: string;
    subject: string;
    message: string;
    model: string;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      const mutation = `
        mutation createInquiry($name: String!, $email: String!, $subject: String!, $message: String!, $model: String!) {
          createInquiries(
            name: $name
            email: $email
            subject: $subject
            message: $message
            model: $model
          ) {
            name
            email
            subject
            message
            model
            status
            created_at
            created_by
          }
        }
      `;

      const data = await gqlFetch<{
        createInquiries: {
          name: string;
          email: string;
          subject: string;
          message: string;
          model: string;
          status: string;
          created_at: string;
          created_by: string;
        };
      }>(mutation, vars);

      return data.createInquiries;
    } catch (e: any) {
      console.error("[web-contact] createInquiry error:", e);
      error.value = e?.message || "Failed to send inquiry";
      throw e;
    } finally {
      loading.value = false;
    }
  };

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

    // create
    createInquiry,
  };
};
