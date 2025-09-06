<script setup lang="ts">
import {ref} from 'vue';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import AuthLoginTabs from "~/components/layouts/AuthLoginTabs.vue";
import AuthRegisterTabs from "~/components/layouts/AuthRegisterTabs.vue";

const activeTab = ref('login')

const tabs = [
  {
    "id": 1,
    "name": "login",
    "element": AuthLoginTabs
  },
  {
    "id": 2,
    "name": "register",
    "element": AuthRegisterTabs
  },
]

const handleSwitchTab = (tabName: string) => {
  activeTab.value = tabName
}
</script>

<template>
  <div class="w-full h-screen flex justify-center bg-green-400 pt-[20vh]">
    <Tabs v-model="activeTab" class="w-full px-4 md:px-0 md:max-w-3/4 h-fit">
      <TabsList class="w-full">
        <TabsTrigger v-for="(trigger, index) in tabs" :key="index" :value="trigger.name">
          {{ trigger.name.toLocaleUpperCase() }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="(val, index) in tabs" :key="val.id" :value="val.name" :class="{ 'rounded-tl-xl rounded-br-xl': val.id === 1, 'rounded-tr-xl rounded-bl-xl': val.id === 2 }" class="transition-opacity bg-white">
        <component :is="val.element" @switch-tab="handleSwitchTab"/>
      </TabsContent>
    </Tabs>
  </div>
</template>