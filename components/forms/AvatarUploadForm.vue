<template>
  <div class="space-y-4">
    <div>
      <label for="userId" class="block text-sm font-medium text-gray-700">User ID</label>
      <input
        id="userId"
        v-model.number="userId"
        type="number"
        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        placeholder="Enter user ID"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Avatar</label>
      <div class="mt-1 flex items-center">
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept="image/*"
          @change="handleFileChange"
        />
        <button
          type="button"
          @click="fileInput?.click()"
          class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Choose File
        </button>
        <span class="ml-2 text-sm text-gray-500">{{ fileName || 'No file chosen' }}</span>
      </div>
      <div v-if="previewUrl" class="mt-2">
        <img :src="previewUrl" alt="Preview" class="h-20 w-20 rounded-full object-cover" />
      </div>
    </div>

    <button
      type="button"
      @click="uploadAvatar"
      :disabled="!canSubmit"
      class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isUploading ? 'Uploading...' : 'Upload Avatar' }}
    </button>

    <div v-if="message" class="mt-2 text-sm" :class="messageType === 'success' ? 'text-green-600' : 'text-red-600'">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, withDefaults, computed } from 'vue';
import { gql } from '@apollo/client';
import { useMutation } from '@vue/apollo-composable';

// Define props with TypeScript interface
const props = withDefaults(defineProps<{
  initialUserId?: number | null
}>(), {
  initialUserId: null
});

const userId = ref<number | null>(props.initialUserId || null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>('');
const isUploading = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const fileInput = ref<HTMLInputElement | null>(null);

const canSubmit = computed(() => {
  return userId.value && selectedFile.value && !isUploading.value;
});

const fileName = computed(() => {
  return selectedFile.value?.name || '';
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    previewUrl.value = URL.createObjectURL(selectedFile.value);
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const uploadAvatar = async () => {
  if (!selectedFile.value) return;
  if (!userId.value) {
    message.value = 'Please enter a valid user ID';
    messageType.value = 'error';
    return;
  }

  isUploading.value = true;
  message.value = '';

  try {
    const UPDATE_AVATAR = gql`
      mutation UpdateUserAvatar($id: Int!, $avatar: String!) {
        updateUserAvatar(id: $id, avatar: $avatar)
      }
    `;

    // Convert file to base64 first
    const base64String = await fileToBase64(selectedFile.value);
    
    // Use the mutation with variables
    const { mutate } = useMutation(UPDATE_AVATAR);
    
    // Execute the mutation with variables
    const result = await mutate({
      id: Number(userId.value),
      avatar: base64String
    });

    message.value = 'Avatar updated successfully!';
    messageType.value = 'success';
    
    // Emit success event
    emit('success', result?.data?.updateUserAvatar);
    
    // Reset form
    selectedFile.value = null;
    previewUrl.value = '';
    if (document.getElementById('fileInput')) {
      (document.getElementById('fileInput') as HTMLInputElement).value = '';
    }
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    message.value = error?.message || 'Failed to upload avatar';
    messageType.value = 'error';
  } finally {
    isUploading.value = false;
  }
};

const emit = defineEmits(['success']);

// Watch for prop changes
watch(() => props.initialUserId, (newVal) => {
  if (newVal) {
    userId.value = newVal;
  }
});
</script>
