<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-vue-next";

const props = defineProps<{ product: any }>();
const { openChat } = useChatWidget();
</script>

<template>
  <Button
    variant="outline"
    size="sm"
    :aria-label="$t('app.productPage.askAbout', { name: props.product?.name })"
    class="border-green-200 text-green-700 hover:bg-green-50"
    @click.stop="openChat($t('app.productPage.askAboutMessage', { name: props.product?.name }))"
  >
    <MessageCircle class="w-4 h-4" />
  </Button>
</template>
