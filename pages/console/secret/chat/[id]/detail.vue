<template>
  <div>
    <AppBreadcrumb/>
    <AppTableHeader :pageTitle="pageTitle"/>

    <div v-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>

    <div v-else class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="rounded-xl border p-4 lg:col-span-1">
        <h3 class="mb-3 text-sm font-semibold text-muted-foreground">Session Info</h3>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Name</dt>
            <dd>{{ detail?.name || '-' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Contact</dt>
            <dd>{{ detail?.contact_value || '-' }}{{ detail?.contact_method ? ` (${detail.contact_method})` : '' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Language</dt>
            <dd>{{ detail?.lang || '-' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Stage</dt>
            <dd>{{ detail?.stage || '-' }}</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-muted-foreground">Status</dt>
            <dd>
              <Badge :class="detail?.status === 'human' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                {{ detail?.status === 'human' ? 'Human' : 'Bot' }}
              </Badge>
            </dd>
          </div>
        </dl>

        <Button
          class="mt-4 w-full"
          :variant="detail?.status === 'human' ? 'outline' : 'default'"
          :disabled="toggling"
          @click="handleToggleTakeover"
        >
          {{ detail?.status === 'human' ? 'Return to Bot' : 'Take Over Chat' }}
        </Button>
      </div>

      <div class="flex h-[560px] flex-col overflow-hidden rounded-xl border lg:col-span-2">
        <div ref="scrollEl" class="flex-1 space-y-3 overflow-y-auto p-4">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="isAdminSide(msg) ? 'justify-end' : 'justify-start'"
          >
            <div class="max-w-[80%]">
              <div class="mb-1 text-[11px] text-muted-foreground" :class="isAdminSide(msg) ? 'text-right' : 'text-left'">
                {{ msg.sender_name }} · {{ formatDateTime(msg.created_at) }}
              </div>
              <div
                class="rounded-2xl px-3 py-2"
                :class="
                  isAdminSide(msg)
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                "
              >
                <ChatMarkdown :content="msg.message"/>
              </div>
            </div>
          </div>
          <div v-if="loading" class="text-center text-xs text-muted-foreground">Loading...</div>
        </div>

        <form class="flex items-center gap-2 border-t p-3" @submit.prevent="handleSend">
          <Input
            v-model="draft"
            placeholder="Type a message..."
            :disabled="sending"
            class="flex-1"
          />
          <Button type="submit" size="icon" :disabled="sending || !draft.trim()">
            <Send class="h-4 w-4"/>
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { Send } from "lucide-vue-next";
import AppBreadcrumb from "~/components/elements/AppBreadcrumb.vue";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import ChatMarkdown from "~/components/chat/ChatMarkdown.vue";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { useChatAdminService } from "~/services/chat-admin.service";
import type { ChatMessage } from "~/types/chat.type";

const route = useRoute();
const id = computed(() => Number(route.params.id));

const {
  detail,
  messages,
  loading,
  error,
  sending,
  adminSendMessage,
  toggleTakeover,
  markRead,
} = useChatAdminService(false, id.value);

const draft = ref("");
const toggling = ref(false);
const scrollEl = ref<HTMLElement | null>(null);

const isAdminSide = (msg: ChatMessage) => msg.sender_type === "bot" || msg.sender_type === "admin";

const scrollToBottom = async () => {
  await nextTick();
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
};

const handleSend = async () => {
  const text = draft.value.trim();
  if (!text) return;
  draft.value = "";
  await adminSendMessage(id.value, text);
  await scrollToBottom();
};

const handleToggleTakeover = async () => {
  toggling.value = true;
  try {
    const takeover = detail.value?.status !== "human";
    await toggleTakeover(id.value, takeover);
  } finally {
    toggling.value = false;
  }
};

watch(
  () => messages.value.length,
  () => scrollToBottom()
);

onMounted(() => {
  markRead(id.value);
  scrollToBottom();
});

const pageTitle = computed(() => "Chat Session Detail");

useHead({
  title: pageTitle,
});

definePageMeta({
  layout: "console-secret",
});
</script>
