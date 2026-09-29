import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useGql } from "~/composables/useGql";
import type { ChatMessage, ChatSession, ChatSessionConnection } from "~/types/chat.type";
import type { PageInfo } from "~/types/Pagination";

const CHAT_SESSION_FIELDS = `
  id
  guest_id
  user_id
  name
  contact_method
  contact_value
  lang
  stage
  status
  assigned_admin_id
  last_message_at
  unread_admin
  unread_guest
  created_at
  updated_at
`;

const CHAT_MESSAGE_FIELDS = `
  id
  chat_session_id
  sender_type
  sender_id
  sender_name
  message
  created_at
`;

export const useChatAdminService = (fetchResult?: boolean, sessionId?: number) => {
  const { gqlFetch } = useGql();

  const datas = ref<ChatSession[]>([]);
  const loading = ref<boolean>(Boolean(fetchResult || sessionId));
  const error = ref<string | null>(null);
  const pagination = ref({ page: 0, limit: 10, total: 0 });
  const pageInfo = ref<PageInfo | null>(null);
  const params = reactive<{ status?: string }>({});

  const detail = ref<ChatSession | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const sending = ref(false);

  const fetchList = async () => {
    if (!fetchResult) return;
    loading.value = true;
    error.value = null;
    try {
      const query = `
        query getChatSessions($pagination: PaginationInput, $status: String) {
          getChatSessions(pagination: $pagination, status: $status) {
            items { ${CHAT_SESSION_FIELDS} }
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
      const variables = {
        pagination: { page: serverPage, limit: serverLimit, sortBy: "last_message_at,desc" },
        status: params.status,
      };
      const res = await gqlFetch<{ getChatSessions: ChatSessionConnection }>(
        query,
        variables,
        { auth: true }
      );
      datas.value = res?.getChatSessions?.items || [];
      pageInfo.value = res?.getChatSessions?.page_info || null;
      if (pageInfo.value) {
        pagination.value.limit = Number(pageInfo.value.per_page || serverLimit);
        pagination.value.total = Number(pageInfo.value.total_items || 0);
        const cp = Number(pageInfo.value.current_page || serverPage);
        pagination.value.page = cp > 0 ? cp - 1 : 0;
      }
    } catch (e: any) {
      console.error("[chat-admin] fetchList error:", e);
      error.value = e?.message || "Failed to load chat sessions";
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
    pagination.value.page = 0;
    fetchList();
  };

  const setParams = (newParams: Record<string, any>) => {
    Object.assign(params, newParams);
  };

  const reFetch = () => {
    if (fetchResult) return fetchList();
    if (sessionId) return loadDetail(sessionId);
  };

  const loadDetail = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const query = `
        query getChatSessionDetail($id: Int!) {
          getChatSessionDetail(id: $id) {
            ${CHAT_SESSION_FIELDS}
            messages { ${CHAT_MESSAGE_FIELDS} }
          }
        }
      `;
      const res = await gqlFetch<{ getChatSessionDetail: ChatSession }>(
        query,
        { id },
        { auth: true }
      );
      detail.value = res.getChatSessionDetail;
      messages.value = res.getChatSessionDetail?.messages || [];
      return detail.value;
    } catch (e: any) {
      console.error("[chat-admin] loadDetail error:", e);
      error.value = e?.message || "Failed to load chat session";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const pushMessages = (incoming: ChatMessage[]) => {
    if (!incoming?.length) return;
    const seen = new Set(messages.value.map((m) => m.id));
    for (const m of incoming) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      messages.value.push(m);
    }
  };

  const pollDetail = async (id: number) => {
    try {
      const afterId = messages.value.length
        ? Math.max(...messages.value.map((m) => m.id))
        : null;
      const query = `
        query getChatMessages($sessionId: Int!, $afterId: Int) {
          getChatMessages(sessionId: $sessionId, afterId: $afterId) { ${CHAT_MESSAGE_FIELDS} }
        }
      `;
      const res = await gqlFetch<{ getChatMessages: ChatMessage[] }>(
        query,
        { sessionId: id, afterId },
        { auth: true }
      );
      pushMessages(res.getChatMessages || []);
    } catch {
      // silent — polling should never surface transient errors to the user
    }
  };

  const adminSendMessage = async (id: number, message: string) => {
    sending.value = true;
    error.value = null;
    try {
      const mutation = `
        mutation adminSendMessage($sessionId: Int!, $message: String!) {
          adminSendMessage(sessionId: $sessionId, message: $message) { ${CHAT_MESSAGE_FIELDS} }
        }
      `;
      const res = await gqlFetch<{ adminSendMessage: ChatMessage }>(
        mutation,
        { sessionId: id, message },
        { auth: true }
      );
      pushMessages([res.adminSendMessage]);
      return res.adminSendMessage;
    } catch (e: any) {
      error.value = e?.message || "Failed to send message";
      throw e;
    } finally {
      sending.value = false;
    }
  };

  const toggleTakeover = async (id: number, takeover: boolean) => {
    try {
      const mutation = `
        mutation adminToggleTakeover($sessionId: Int!, $takeover: Boolean!) {
          adminToggleTakeover(sessionId: $sessionId, takeover: $takeover) { ${CHAT_SESSION_FIELDS} }
        }
      `;
      const res = await gqlFetch<{ adminToggleTakeover: ChatSession }>(
        mutation,
        { sessionId: id, takeover },
        { auth: true }
      );
      detail.value = res.adminToggleTakeover;
      return res.adminToggleTakeover;
    } catch (e: any) {
      error.value = e?.message || "Failed to toggle takeover";
      throw e;
    }
  };

  const markRead = async (id: number) => {
    try {
      const mutation = `
        mutation markChatRead($sessionId: Int!, $asAdmin: Boolean!) {
          markChatRead(sessionId: $sessionId, asAdmin: $asAdmin)
        }
      `;
      await gqlFetch<{ markChatRead: boolean }>(mutation, { sessionId: id, asAdmin: true }, { auth: true });
    } catch {
      // best-effort — an unread badge staying stale is not worth surfacing an error for
    }
  };

  onMounted(() => {
    if (fetchResult) fetchList();
    if (sessionId) loadDetail(sessionId);
  });

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
    messages,
    sending,
    loadDetail,
    pollDetail,
    adminSendMessage,
    toggleTakeover,
    markRead,
  };
};

export const useChatUnreadCount = () => {
  const { gqlFetch } = useGql();
  const unreadCount = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  const fetchUnreadCount = async () => {
    try {
      const query = `query getChatUnreadCount { getChatUnreadCount }`;
      const res = await gqlFetch<{ getChatUnreadCount: number }>(query, {}, { auth: true });
      unreadCount.value = res.getChatUnreadCount || 0;
    } catch {
      // silent — badge just stays at its last known value
    }
  };

  onMounted(() => {
    fetchUnreadCount();
    timer = setInterval(fetchUnreadCount, 15000);
  });

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
  });

  return { unreadCount, fetchUnreadCount };
};
