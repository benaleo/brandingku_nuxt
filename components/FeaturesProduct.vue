<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useFeaturedProduct } from '~/composables/useFeaturedProduct'

const router = useRouter()
const { data, loading, error } = useFeaturedProduct()
const config = useRuntimeConfig()
const STORAGE_URL = config.public.STORAGE_URL

const tabs = computed(() => ([
  { id: 1, name: 'popular', count: data.value.filter(p => p.is_highlight).length },
  { id: 2, name: 'recommendation', count: data.value.filter(p => p.is_recommended).length },
]))

const filteredProducts = (type: string) => {
  if (type === 'popular') return data.value.filter(p => p.is_highlight)
  if (type === 'recommendation') return data.value.filter(p => p.is_recommended)
  return []
}

function goTo(slug: string) {
  if (!slug) return
  router.push(`/product/${slug}`)
}

</script>

<template>
  <div class="w-full px-4 md:px-0 md:max-w-3/4 mx-auto py-12">
    <div v-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else>
      <Tabs default-value="popular" class="w-full">
        <TabsList>
          <TabsTrigger v-for="(trigger, index) in tabs" :key="index" :value="trigger.name">
            {{ trigger.name.toLocaleUpperCase() }}
          </TabsTrigger>
        </TabsList>
        <TabsContent v-for="(val, index) in tabs" :key="val.id" :value="val.name">
          <Carousel class="relative w-full" :opts="{ align: 'start', loop: true }">
            <CarouselContent>
              <CarouselItem v-for="product in filteredProducts(val.name)" :key="product.id" class="md:basis-1/2 lg:basis-1/4">
                <div class="p-1">
                  <Card class="group cursor-pointer py-0" @click="goTo(product.slug)">
                    <CardHeader class="relative p-0 aspect-square overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                      <img :src="STORAGE_URL + product.image" :alt="product.name" class="w-full aspect-square object-cover rounded-t-lg" loading="lazy" />
                      <!-- center absolute -->
                      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                        <Button variant="ghost" size="icon" class="rounded-full bg-white shadow">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </Button>
                        <Button variant="outline" class="opacity-0 group-hover:opacity-100 transition-opacity" size="sm" @click.stop> Add to Cart </Button>
                      </div>
                    </CardHeader>
                    <CardContent class="p-4">
                      <h3 class="font-medium">{{ product.name }}</h3>
                      <p class="text-sm text-gray-500 mt-1">{{ product.category }}</p>
                      <div class="flex justify-between items-center mt-4">
                        <span class="font-bold">Rp. {{ product.price }} 
                        <span class="text-sm text-gray-500">/pcs</span></span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>