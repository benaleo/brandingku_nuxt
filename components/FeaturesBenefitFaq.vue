<script setup lang="ts">
import { useBenefitService } from "~/services/benefit.service";

const { datas: benefits, loading, error } = useBenefitService();

// Add Plus Jakarta Sans font
useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap'
    }
  ]
});
</script>

<template>
  <div class="w-full px-4 py-12" style="font-family: 'Plus Jakarta Sans', sans-serif;">
    <div class="container max-w-3xl mx-auto py-12">
      <h2 class="text-2xl font-bold text-center mb-6" style="font-family: 'Plus Jakarta Sans', sans-serif;">Pertanyaan Populer</h2>

      <div v-if="loading" class="text-center py-4">
        <p style="font-family: 'Plus Jakarta Sans', sans-serif;">Memuat pertanyaan...</p>
      </div>

      <div v-else-if="error" class="text-center py-4 text-red-500">
        <p style="font-family: 'Plus Jakarta Sans', sans-serif;">{{ error }}</p>
      </div>

      <Accordion v-else type="single" collapsible class="w-full">
        <AccordionItem
          v-for="benefit in benefits"
          :key="benefit.id"
          :value="benefit.id"
        >
          <AccordionTrigger class="hover:bg-slate-100 px-4 rounded-md text-left" style="font-family: 'Plus Jakarta Sans', sans-serif;">
            {{ benefit.question }}
          </AccordionTrigger>
          <AccordionContent>
            <p class="text-gray-600 px-6 py-4 pb-2 border-x border-gray-200" style="font-family: 'Plus Jakarta Sans', sans-serif;">{{ benefit.answer }}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</template>
