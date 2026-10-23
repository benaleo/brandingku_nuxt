<template>
  <div class="chat-markdown text-sm leading-relaxed" v-html="rendered"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef } from "vue";
import { marked } from "marked";

// dompurify needs a DOM; load it in the browser only so SSR (Workers) never imports it
const purify = shallowRef<{ sanitize: (html: string, cfg?: object) => string } | null>(null);
onMounted(async () => {
  purify.value = (await import("dompurify")).default;
});

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const props = defineProps<{ content: string }>();

const renderer = new marked.Renderer();
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : "";
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

const rendered = computed(() => {
  if (!purify.value) return escapeHtml(props.content || "").replace(/\n/g, "<br>");
  const html = marked.parse(props.content || "", { breaks: true, async: false, renderer }) as string;
  return purify.value.sanitize(html, { ADD_ATTR: ["target"] });
});
</script>

<style scoped>
.chat-markdown :deep(p) {
  margin: 0 0 0.4rem 0;
}
.chat-markdown :deep(p:last-child) {
  margin-bottom: 0;
}
.chat-markdown :deep(ul),
.chat-markdown :deep(ol) {
  margin: 0.2rem 0 0.4rem 1.1rem;
}
.chat-markdown :deep(a) {
  text-decoration: underline;
}
.chat-markdown :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.85em;
}
</style>
