<template>
  <div v-if="showWidget" class="fixed bottom-5 right-5 z-50 [.has-bottom-bar_&]:bottom-24 lg:[.has-bottom-bar_&]:bottom-5 flex flex-col items-end gap-3">
    <div
      v-if="open"
      class="flex h-[520px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
    >
      <div class="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
        <div class="flex flex-col">
          <span class="font-semibold">{{ t("app.chat.title") }}</span>
          <span class="text-xs opacity-80">{{ t("app.chat.subtitle") }}</span>
        </div>
        <button class="text-primary-foreground/80 hover:text-primary-foreground" @click="open = false">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div ref="scrollEl" class="flex-1 space-y-3 overflow-y-auto p-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex"
          :class="isOwnMessage(msg) ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded-2xl px-3 py-2"
            :class="
              isOwnMessage(msg)
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
            "
          >
            <ChatMarkdown :content="msg.message" />
          </div>
        </div>
        <div v-if="loading || sending" class="flex justify-start">
          <div class="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-xs text-muted-foreground">
            <span>{{ t("app.chat.loading") }}</span>
            <span class="flex gap-0.5">
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
            </span>
          </div>
        </div>
      </div>

      <form class="flex items-center gap-2 border-t p-3" @submit.prevent="handleSend">
        <Input
          v-model="draft"
          :placeholder="t('app.chat.placeholder')"
          :disabled="sending"
          class="flex-1"
        />
        <Button type="submit" size="icon" :disabled="sending || !draft.trim()">
          <Send class="h-4 w-4" />
        </Button>
      </form>
    </div>

    <button
      class="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105"
      @click="toggleOpen"
    >
      <MessageCircle class="h-6 w-6" />
      <span
        v-if="unreadCount > 0 && !open"
        class="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white"
      >
        {{ unreadCount > 9 ? "9+" : unreadCount }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { MessageCircle, Send, X } from "lucide-vue-next";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useChatService } from "~/services/chat.service";
import type { ChatMessage } from "~/types/chat.type";

const { t, locale } = useI18n();
const route = useRoute();
const showWidget = computed(() => !route.path.startsWith("/console"));
const {
  session,
  messages,
  loading,
  sending,
  startSession,
  sendMessage,
  pollMessages,
  fetchMySession,
} = useChatService();

const open = ref(false);
const draft = ref("");
const unreadCount = ref(0);
const scrollEl = ref<HTMLElement | null>(null);

let pollTimer: ReturnType<typeof setInterval> | null = null;

const isOwnMessage = (msg: ChatMessage) =>
  msg.sender_type === "guest" || msg.sender_type === "user";

const scrollToBottom = async () => {
  await nextTick();
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
};

const ensureSession = async () => {
  if (session.value) return;
  const existing = await fetchMySession();
  if (!existing) {
    await startSession(locale.value || "id");
  }
};

const toggleOpen = async () => {
  open.value = !open.value;
  if (open.value) {
    unreadCount.value = 0;
    await ensureSession();
    await scrollToBottom();
  }
};

const handleSend = async () => {
  const text = draft.value.trim();
  if (!text) return;
  draft.value = "";
  await sendMessage(text);
  await scrollToBottom();
};

watch(
  [() => messages.value.length, sending],
  () => {
    if (open.value) scrollToBottom();
  }
);

onMounted(() => {
  pollTimer = setInterval(async () => {
    if (!session.value) return;
    const before = messages.value.length;
    await pollMessages();
    const added = messages.value.length - before;
    if (added > 0 && !open.value) {
      unreadCount.value += added;
    }
  }, 4000);
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>
