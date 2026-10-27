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
        <button class="text-primary-foreground/80 hover:text-primary-foreground" @click="toggleOpen">
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

      <!-- contact method is a fixed choice, so it is picked instead of typed -->
      <form
        v-if="choosingContact"
        class="space-y-2 border-t p-3"
        @submit.prevent="handleContactChoice"
      >
        <p class="text-xs text-muted-foreground">{{ t("app.chat.contactPrompt") }}</p>
        <div role="radiogroup" class="grid grid-cols-2 gap-2">
          <label
            v-for="opt in contactOptions"
            :key="opt.value"
            class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
            :class="contactChoice === opt.value ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-muted'"
          >
            <input
              v-model="contactChoice"
              type="radio"
              name="chat-contact-method"
              :value="opt.value"
              class="accent-primary"
            />
            <component :is="opt.icon" class="h-4 w-4 shrink-0" />
            {{ opt.label }}
          </label>
        </div>
        <Button type="submit" class="w-full" :disabled="sending || !contactChoice">
          {{ t("app.chat.contactSubmit") }}
        </Button>
      </form>
      <form v-else class="flex items-end gap-2 border-t p-3" @submit.prevent="handleSend">
        <!-- Enter sends, Shift+Enter adds a line; grows up to 4 lines then scrolls -->
        <textarea
          ref="inputEl"
          v-model="draft"
          rows="1"
          :inputmode="valueInputType"
          :placeholder="t('app.chat.placeholder')"
          :disabled="sending"
          class="min-h-9 flex-1 resize-none overflow-y-hidden rounded-md border border-input bg-transparent px-3 py-1.5 text-base leading-6 shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm"
          @input="resizeInput"
          @keydown.enter="onEnter"
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
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { Mail, MessageCircle, Phone, Send, X } from "lucide-vue-next";
import { Button } from "~/components/ui/button";
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
  fetchMySession,
  startRealtime,
} = useChatService();

const { open, pendingTopic } = useChatWidget();
const draft = ref("");
const unreadCount = ref(0);
const scrollEl = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLTextAreaElement | null>(null);
const MAX_INPUT_LINES = 4;

// fit the textarea to its content, capped at MAX_INPUT_LINES; beyond that it scrolls
const resizeInput = () => {
  const el = inputEl.value;
  if (!el) return;
  const style = getComputedStyle(el);
  const lineHeight = parseFloat(style.lineHeight) || 24;
  const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  const max = lineHeight * MAX_INPUT_LINES + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + borders;
  el.style.height = "auto";
  const content = el.scrollHeight + borders;
  el.style.height = `${Math.min(content, max)}px`;
  el.style.overflowY = content > max ? "auto" : "hidden";
};

const onEnter = (e: KeyboardEvent) => {
  // Shift+Enter and IME composition keep the default newline/compose behaviour
  if (e.shiftKey || e.isComposing) return;
  e.preventDefault();
  handleSend();
};

const isOwnMessage = (msg: ChatMessage) =>
  msg.sender_type === "guest" || msg.sender_type === "user";

const scrollToBottom = async () => {
  await nextTick();
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
};

const onNewMessages = (added: ChatMessage[]) => {
  if (!open.value) unreadCount.value += added.filter((m) => !isOwnMessage(m)).length;
};

const ensureSession = async () => {
  if (session.value) return;
  const existing = await fetchMySession();
  if (!existing) {
    await startSession(locale.value || "id");
  }
  startRealtime(onNewMessages);
};

// a topic from "ask admin" buttons waits until the name/contact steps are done;
// it may replace an earlier topic the visitor left untouched, never their own typing
let lastTopic = "";
const applyPendingTopic = () => {
  if (!pendingTopic.value || session.value?.stage !== "active") return;
  const current = draft.value.trim();
  if (current && current !== lastTopic) return;
  draft.value = lastTopic = pendingTopic.value;
  pendingTopic.value = "";
};

const toggleOpen = () => {
  open.value = !open.value;
};

watch(open, async (isOpen) => {
  if (!isOpen) return;
  unreadCount.value = 0;
  await ensureSession();
  applyPendingTopic();
  await scrollToBottom();
  inputEl.value?.focus();
});

watch(() => [session.value?.stage, pendingTopic.value], applyPendingTopic);

const choosingContact = computed(() => session.value?.stage === "awaiting_contact_method");
const contactChoice = ref<"email" | "phone" | "">("");
const contactOptions = computed(() => [
  { value: "email" as const, label: t("app.chat.contactEmail"), icon: Mail },
  { value: "phone" as const, label: t("app.chat.contactPhone"), icon: Phone },
]);
// the next answer is the address or number for the chosen method
const valueInputType = computed(() => {
  if (session.value?.stage !== "awaiting_contact_value") return "text";
  return session.value?.contact_method === "phone" ? "tel" : session.value?.contact_method === "email" ? "email" : "text";
});

// programmatic changes (send clears it, a product topic fills it) need a resize too
watch(draft, () => nextTick(resizeInput));

const handleContactChoice = async () => {
  if (!contactChoice.value) return;
  const choice = contactChoice.value;
  contactChoice.value = "";
  await sendMessage(choice);
  await scrollToBottom();
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

// returning visitors get admin replies live even before they reopen the widget
onMounted(async () => {
  if (!showWidget.value || open.value) return;
  const existing = await fetchMySession();
  if (existing) startRealtime(onNewMessages);
});
</script>
