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

const SESSION_UPDATED_SUBSCRIPTION = `
  subscription chatSessionUpdated {
    chatSessionUpdated { ${CHAT_SESSION_FIELDS} }
  }
`;

// coalesces bursts of realtime events (guest message + bot reply) into one call
const debounce = (fn: () => void, ms: number) => {
  let t: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (t) clearTimeout(t);
    t = setTimeout(fn, ms);
  };
};

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

  // silent refreshes come from realtime events and skip the table loading state
  const fetchList = async (silent = false) => {
    if (!fetchResult) return;
    if (!silent) loading.value = true;
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
    const added: ChatMessage[] = [];
    if (!incoming?.length) return added;
    const seen = new Set(messages.value.map((m) => m.id));
    for (const m of incoming) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      added.push(m);
    }
    if (added.length) {
      messages.value = [...messages.value, ...added].sort((a, b) => a.id - b.id);
    }
    return added;
  };

  const pollDetail = async (id: number): Promise<ChatMessage[]> => {
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
      return pushMessages(res.getChatMessages || []);
    } catch {
      // silent — a catch-up fetch should never surface transient errors to the user
      return [];
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

  // realtime: the list follows session activity, the detail view follows its own messages
  const { subscribe, onReconnect } = useChatSocket();
  const stops: (() => void)[] = [];
  const markReadSoon = debounce(() => sessionId && markRead(sessionId), 800);

  const startRealtime = () => {
    if (fetchResult) {
      const refreshList = debounce(() => fetchList(true), 400);
      stops.push(subscribe(SESSION_UPDATED_SUBSCRIPTION, {}, { next: refreshList }));
      stops.push(onReconnect(refreshList));
    }
    if (sessionId) {
      const onNew = (added: ChatMessage[]) => {
        // the admin is looking at this chat, so visitor messages count as read
        if (added.some((m) => m.sender_type === "guest" || m.sender_type === "user")) markReadSoon();
      };
      stops.push(
        subscribe(
          `subscription chatMessageAdded($sessionId: Int!) {
            chatMessageAdded(sessionId: $sessionId) { ${CHAT_MESSAGE_FIELDS} }
          }`,
          { sessionId },
          { next: (data) => onNew(pushMessages(data?.chatMessageAdded ? [data.chatMessageAdded] : [])) }
        )
      );
      // takeover changes made by another admin
      stops.push(
        subscribe(SESSION_UPDATED_SUBSCRIPTION, {}, {
          next: (data) => {
            const s = data?.chatSessionUpdated as ChatSession | undefined;
            if (s && s.id === sessionId && detail.value) detail.value = { ...detail.value, ...s, messages: detail.value.messages };
          },
        })
      );
      stops.push(onReconnect(async () => onNew(await pollDetail(sessionId))));
    }
  };

  onMounted(() => {
    if (fetchResult) fetchList();
    if (sessionId) loadDetail(sessionId);
    startRealtime();
  });

  onBeforeUnmount(() => stops.splice(0).forEach((stop) => stop()));

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

// onIncrease runs when the count goes up after the first load
export const useChatUnreadCount = (onIncrease?: (added: number) => void) => {
  const { gqlFetch } = useGql();
  const unreadCount = ref(0);
  const { subscribe, onReconnect } = useChatSocket();
  const stops: (() => void)[] = [];
  let loaded = false;

  const fetchUnreadCount = async () => {
    try {
      const query = `query getChatUnreadCount { getChatUnreadCount }`;
      const res = await gqlFetch<{ getChatUnreadCount: number }>(query, {}, { auth: true });
      const prev = unreadCount.value;
      unreadCount.value = res.getChatUnreadCount || 0;
      if (loaded && unreadCount.value > prev) onIncrease?.(unreadCount.value - prev);
      loaded = true;
    } catch {
      // silent — badge just stays at its last known value
    }
  };

  onMounted(() => {
    fetchUnreadCount();
    const refresh = debounce(fetchUnreadCount, 300);
    stops.push(subscribe(SESSION_UPDATED_SUBSCRIPTION, {}, { next: refresh }));
    stops.push(onReconnect(refresh));
  });

  onBeforeUnmount(() => stops.splice(0).forEach((stop) => stop()));

  return { unreadCount, fetchUnreadCount };
};
