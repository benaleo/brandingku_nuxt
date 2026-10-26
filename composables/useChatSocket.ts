// Minimal graphql-transport-ws client for the realtime chat subscriptions.
// One socket per tab is shared by every subscriber; it connects on the first
// subscription, reconnects with backoff, and closes when nothing listens.

type Sink = {
  next: (data: any) => void;
  error?: (err: any) => void;
};

type Sub = { query: string; variables: Record<string, any>; sink: Sink };

const state = {
  ws: null as WebSocket | null,
  ready: false,
  url: "",
  seq: 0,
  retry: 0,
  timer: null as ReturnType<typeof setTimeout> | null,
  connectedOnce: false,
  subs: new Map<string, Sub>(),
  reconnectHandlers: new Set<() => void>(),
};

// cookies written by useCookie are URI-encoded strings
const readCookie = (name: string) => {
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  if (!hit) return "";
  const raw = decodeURIComponent(hit.slice(name.length + 1));
  return raw === "null" ? "" : raw.replace(/^"|"$/g, "");
};

const initPayload = () => {
  const payload: Record<string, string> = {};
  const token = readCookie("token");
  const guestId = readCookie("chat_guest_id");
  if (token) payload.Authorization = `Bearer ${token}`;
  if (guestId) payload["X-Chat-Guest-Id"] = guestId;
  return payload;
};

const send = (msg: Record<string, any>) => {
  if (state.ws?.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(msg));
};

const sendSubscribe = (id: string, sub: Sub) => {
  send({ id, type: "subscribe", payload: { query: sub.query, variables: sub.variables } });
};

const scheduleReconnect = () => {
  if (state.timer || !state.subs.size) return;
  const delay = Math.min(30000, 1000 * 2 ** state.retry);
  state.retry++;
  state.timer = setTimeout(() => {
    state.timer = null;
    connect();
  }, delay);
};

const connect = () => {
  if (state.ws || !state.subs.size) return;
  const ws = new WebSocket(state.url, "graphql-transport-ws");
  state.ws = ws;

  ws.onopen = () => send({ type: "connection_init", payload: initPayload() });

  ws.onmessage = (event) => {
    let msg: any;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    switch (msg.type) {
      case "connection_ack": {
        state.ready = true;
        state.retry = 0;
        state.subs.forEach((sub, id) => sendSubscribe(id, sub));
        // let listeners catch up on anything missed while disconnected
        if (state.connectedOnce) state.reconnectHandlers.forEach((fn) => fn());
        state.connectedOnce = true;
        break;
      }
      case "next":
        state.subs.get(msg.id)?.sink.next(msg.payload?.data);
        break;
      case "error":
        state.subs.get(msg.id)?.sink.error?.(msg.payload);
        break;
      case "ping":
        send({ type: "pong" });
        break;
    }
  };

  ws.onclose = () => {
    if (state.ws === ws) {
      state.ws = null;
      state.ready = false;
      scheduleReconnect();
    }
  };
};

const disconnect = () => {
  const ws = state.ws;
  state.ws = null;
  state.ready = false;
  if (state.timer) clearTimeout(state.timer);
  state.timer = null;
  ws?.close(1000);
};

export const useChatSocket = () => {
  const config = useRuntimeConfig();
  if (!state.url && import.meta.client) {
    const base = String(config.public.API_URL || window.location.origin).replace(/\/$/, "");
    const path = String(config.public.graphqlPath || "/query");
    state.url = base.replace(/^http/, "ws") + path;
  }

  // returns an unsubscribe function; a no-op on the server
  const subscribe = (query: string, variables: Record<string, any>, sink: Sink) => {
    if (!import.meta.client) return () => {};
    const id = String(++state.seq);
    const sub = { query, variables, sink };
    state.subs.set(id, sub);
    if (state.ready) sendSubscribe(id, sub);
    else connect();

    return () => {
      if (!state.subs.delete(id)) return;
      send({ id, type: "complete" });
      if (!state.subs.size) disconnect();
    };
  };

  // runs after the socket comes back so callers can refetch what they missed
  const onReconnect = (fn: () => void) => {
    state.reconnectHandlers.add(fn);
    return () => state.reconnectHandlers.delete(fn);
  };

  // re-authenticates the shared socket, e.g. after login or a new guest session
  const reconnect = () => {
    if (!import.meta.client) return;
    disconnect();
    connect();
  };

  return { subscribe, onReconnect, reconnect };
};
