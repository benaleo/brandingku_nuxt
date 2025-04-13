<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoginForm from '~/components/forms/LoginForm.vue';
import RegisterForm from '~/components/forms/RegisterForm.vue';

const tabs = [
  {
    "id": 1,
    "name": "login",
    "element": LoginForm
  },
  {
    "id": 2,
    "name": "register",
    "element": RegisterForm
  },

]

</script>

<template>
  <div class="w-full h-screen flex justify-center mt-[20vh]">
    <Tabs default-value="login" class="w-full px-4 md:px-0 md:max-w-3/4">
      <TabsList class="w-full">
        <TabsTrigger v-for="(trigger, index) in tabs" :key="index" :value="trigger.name">
          {{ trigger.name.toLocaleUpperCase() }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="(val, index) in tabs" :key="val.id" :value="val.name">
        <component :is="val.element" />
      </TabsContent>

    </Tabs>
  </div>
</template>