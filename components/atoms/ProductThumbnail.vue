<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { watchOnce } from '@vueuse/core'
import { ref, defineProps } from 'vue'

const props = defineProps<{
  images: string[]
}>()

const emblaMainApi = ref<CarouselApi>()
const emblaThumbnailApi = ref<CarouselApi>()
const selectedIndex = ref(0)

function onSelect() {
  if (!emblaMainApi.value || !emblaThumbnailApi.value)
    return
  selectedIndex.value = emblaMainApi.value.selectedScrollSnap()
  emblaThumbnailApi.value.scrollTo(emblaMainApi.value.selectedScrollSnap())
}

function onThumbClick(index: number) {
  if (!emblaMainApi.value || !emblaThumbnailApi.value)
    return
  emblaMainApi.value.scrollTo(index)
}

watchOnce(emblaMainApi, (emblaMainApi) => {
  if (!emblaMainApi)
    return

  onSelect()
  emblaMainApi.on('select', onSelect)
  emblaMainApi.on('reInit', onSelect)
})
</script>

<template>
  <div class="w-full sm:w-auto px-12">
    <Carousel
      class="relative w-full"
      @init-api="(val) => emblaMainApi = val"
    >
      <CarouselContent class="shadow-lg">
        <CarouselItem v-for="(image, index) in images" :key="index">
          <div class="p-1">
            <Card class="py-0 overflow-hidden rounded-lg shadow">
              <CardContent class="flex aspect-square items-center justify-center px-0">
                <img :src="image" :alt="`Product image ${index + 1}`" class="w-full h-full object-cover px-0" />
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>

    <Carousel
      class="relative w-full"
      @init-api="(val) => emblaThumbnailApi = val"
    >
      <CarouselContent class="flex gap-1 ml-0">
        <CarouselItem v-for="(image, index) in images" :key="index" class="pl-0 basis-1/4 cursor-pointer" @click="onThumbClick(index)">
          <div class="p-1" :class="index === selectedIndex ? '' : 'opacity-50'">
            <Card class="flex items-center justify-center py-0 overflow-hidden rounded-lg">
              <CardContent class="flex items-center justify-center p-0 aspect-square">
                <img :src="image" :alt="`Product image ${index + 1}`" class="w-full h-full object-cover" />
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </div>
</template>