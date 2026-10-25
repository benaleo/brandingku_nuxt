<script setup lang="ts">
import { X } from "lucide-vue-next";

// bottom sheet on mobile, centered dialog from sm up
const open = defineModel<boolean>("open", { default: false });
defineProps<{ title: string; description?: string }>();

const close = () => (open.value = false);

const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") close();
};

watch(open, (v) => {
  if (typeof document === "undefined") return;
  document.documentElement.style.overflow = v ? "hidden" : "";
  if (v) window.addEventListener("keydown", onKey);
  else window.removeEventListener("keydown", onKey);
});

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  if (open.value) document.documentElement.style.overflow = "";
  window.removeEventListener("keydown", onKey);
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px]"
        @click="close"
      />
    </Transition>
    <Transition
      enter-active-class="transition duration-250 ease-out"
      leave-active-class="transition duration-150 ease-in"
      enter-from-class="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
      leave-to-class="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
    >
      <div
        v-if="open"
        class="pointer-events-none fixed inset-0 z-[71] flex items-end justify-center sm:items-center sm:p-4"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          class="pointer-events-auto flex max-h-[85dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
        >
          <div class="mx-auto mt-2 h-1.5 w-10 rounded-full bg-gray-200 sm:hidden" />
          <div class="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
              <p v-if="description" class="text-sm text-gray-500">{{ description }}</p>
            </div>
            <button
              type="button"
              class="-mr-2 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              aria-label="Tutup"
              @click="close"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="border-t px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
