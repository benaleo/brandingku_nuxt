<template>
<div class="relative w-full min-h-screen">
<div class="absolute top-0 left-0 w-full h-[20vh] bg-gradient-to-r from-green-800 to-green-200">

  <div class="container mx-auto p-6 max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Update User Avatar</h1>
    
    <div class="bg-white p-6 rounded-lg shadow">
      <AvatarUploadForm 
        :initial-user-id="userId"
        @success="handleUploadSuccess"
      />
      
      <div v-if="avatarUrl" class="mt-6 pt-6 border-t">
        <h2 class="text-lg font-medium mb-2">Current Avatar:</h2>
        <img :src="avatarUrl" alt="User Avatar" class="h-32 w-32 rounded-full object-cover" />
      </div>
    </div>
  </div>
</div>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// Import the component
import AvatarUploadForm from '~/components/forms/AvatarUploadForm.vue';

const userId = ref<number>(1); // Default user ID, you can make this dynamic
const avatarUrl = ref<string>('');

const handleUploadSuccess = (newAvatarUrl: string) => {
  avatarUrl.value = newAvatarUrl;
};
</script>
