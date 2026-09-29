<template>
  <div class="chat-markdown text-sm leading-relaxed" v-html="rendered"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

const props = defineProps<{ content: string }>();

const renderer = new marked.Renderer();
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : "";
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

const rendered = computed(() => {
  const html = marked.parse(props.content || "", { breaks: true, async: false, renderer }) as string;
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
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
