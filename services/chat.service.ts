import { ref, computed, onBeforeUnmount } from "vue";
import { useGql } from "~/composables/useGql";
import type { ChatMessage, ChatSession } from "~/types/chat.type";

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

export const useChatService = () => {
  const { gqlFetch } = useGql();
  const token = useCookie<string | null>("token", { sameSite: "lax" });
  const guestId = useCookie<string | null>("chat_guest_id", {
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  if (process.client && !guestId.value) {
    guestId.value = crypto.randomUUID();
  }

  const session = ref<ChatSession | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const sending = ref(false);
  const error = ref<string | null>(null);

  const isLoggedIn = computed(() => Boolean(token.value));

  const chatHeaders = () => {
    const headers: Record<string, string> = {};
    if (guestId.value) headers["X-Chat-Guest-Id"] = guestId.value;
    return headers;
  };

  const applySession = (s: ChatSession | null) => {
    session.value = s;
    if (s?.messages) messages.value = s.messages;
  };

  // appends unseen messages in id order and returns the ones that were new
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

  const startSession = async (lang: string) => {
    loading.value = true;
    error.value = null;
    try {
      const query = `
        mutation startChatSession($lang: String!) {
          startChatSession(lang: $lang) {
            ${CHAT_SESSION_FIELDS}
            messages { ${CHAT_MESSAGE_FIELDS} }
          }
        }
      `;
      const res = await gqlFetch<{ startChatSession: ChatSession }>(
        query,
        { lang },
        { auth: true, headers: chatHeaders() }
      );
      applySession(res.startChatSession);
      return res.startChatSession;
    } catch (err: any) {
      error.value = err?.message || "Failed to start chat session";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = async (message: string) => {
    if (!session.value) return;
    sending.value = true;
    error.value = null;
    try {
      const query = `
        mutation sendChatMessage($sessionId: Int!, $message: String!) {
          sendChatMessage(sessionId: $sessionId, message: $message) {
            ${CHAT_MESSAGE_FIELDS}
          }
        }
      `;
      const res = await gqlFetch<{ sendChatMessage: ChatMessage[] }>(
        query,
        { sessionId: session.value.id, message },
        { auth: true, headers: chatHeaders() }
      );
      pushMessages(res.sendChatMessage || []);
      // onboarding replies move the stage forward on the server; pick it up
      if (session.value.stage !== "active") await fetchMySession();
      return res.sendChatMessage;
    } catch (err: any) {
      error.value = err?.message || "Failed to send message";
      throw err;
    } finally {
      sending.value = false;
    }
  };

  const pollMessages = async (): Promise<ChatMessage[]> => {
    if (!session.value) return [];
    try {
      const afterId = messages.value.length
        ? Math.max(...messages.value.map((m) => m.id))
        : null;
      const query = `
        query getChatMessages($sessionId: Int!, $afterId: Int) {
          getChatMessages(sessionId: $sessionId, afterId: $afterId) {
            ${CHAT_MESSAGE_FIELDS}
          }
        }
      `;
      const res = await gqlFetch<{ getChatMessages: ChatMessage[] }>(
        query,
        { sessionId: session.value.id, afterId },
        { auth: true, headers: chatHeaders() }
      );
      return pushMessages(res.getChatMessages || []);
    } catch {
      // silent — a catch-up fetch should never surface transient errors to the user
      return [];
    }
  };

  // realtime: new messages for the current session arrive over the shared websocket
  const { subscribe, onReconnect } = useChatSocket();
  let stopRealtime: (() => void) | null = null;

  const startRealtime = (onNew?: (added: ChatMessage[]) => void) => {
    stopRealtime?.();
    if (!session.value) return;
    const unsubscribe = subscribe(
      `subscription chatMessageAdded($sessionId: Int!) {
        chatMessageAdded(sessionId: $sessionId) { ${CHAT_MESSAGE_FIELDS} }
      }`,
      { sessionId: session.value.id },
      {
        next: (data) => {
          const added = pushMessages(data?.chatMessageAdded ? [data.chatMessageAdded] : []);
          if (added.length) onNew?.(added);
        },
      }
    );
    const offReconnect = onReconnect(async () => {
      const added = await pollMessages();
      if (added.length) onNew?.(added);
    });
    stopRealtime = () => {
      unsubscribe();
      offReconnect();
      stopRealtime = null;
    };
  };

  onBeforeUnmount(() => stopRealtime?.());

  const fetchMySession = async () => {
    try {
      const query = `
        query getMyChatSession {
          getMyChatSession {
            ${CHAT_SESSION_FIELDS}
            messages { ${CHAT_MESSAGE_FIELDS} }
          }
        }
      `;
      const res = await gqlFetch<{ getMyChatSession: ChatSession | null }>(
        query,
        {},
        { auth: true, headers: chatHeaders() }
      );
      applySession(res.getMyChatSession);
      return res.getMyChatSession;
    } catch {
      return null;
    }
  };

  return {
    session,
    messages,
    loading,
    sending,
    error,
    isLoggedIn,
    startSession,
    sendMessage,
    pollMessages,
    fetchMySession,
    startRealtime,
  };
};
