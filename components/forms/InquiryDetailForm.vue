<template>
  <div v-if="loading" class="text-center py-4">
    Loading...
  </div>
  <div v-else-if="error" class="text-center py-4 text-red-500">
    {{ error }}
  </div>
  <div v-else-if="inquiry" class="bg-white rounded-lg shadow-lg p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <p class="text-gray-900">{{ inquiry.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <p class="text-gray-900">{{ inquiry.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <p class="text-gray-900">{{ inquiry.subject }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Model</label>
        <p class="text-gray-900">{{ inquiry.model }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <p class="text-gray-900">{{ inquiry.status }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Created At</label>
        <p class="text-gray-900">{{ new Date(inquiry.created_at).toLocaleString() }}</p>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <p class="text-gray-900 whitespace-pre-wrap">{{ inquiry.message }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Created By</label>
        <p class="text-gray-900">{{ inquiry.created_by || '-' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWebContactService } from '~/services/web-contact.service'

const props = defineProps<{
  id: string
}>()

const { detail, loading, error } = useWebContactService(false, props.id)

const inquiry = computed(() => detail.value)
</script>
