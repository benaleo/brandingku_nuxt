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
  <div class="w-full">
    <Carousel
      class="relative w-full"
      @init-api="(val) => emblaMainApi = val"
    >
      <CarouselContent>
        <CarouselItem v-for="(image, index) in images" :key="index">
          <div class="aspect-square overflow-hidden bg-gray-50 sm:rounded-xl sm:border">
            <img :src="image" :alt="$t('app.productPage.detail.imageAlt', { n: index + 1 })" class="h-full w-full object-cover" />
          </div>
        </CarouselItem>
      </CarouselContent>
      <!-- keep arrows inside the carousel; the default -left/-right-12 overflows the page -->
      <CarouselPrevious v-if="images.length > 1" class="left-3 bg-white/90 shadow-md" />
      <CarouselNext v-if="images.length > 1" class="right-3 bg-white/90 shadow-md" />
    </Carousel>

    <Carousel
      class="relative mt-2 w-full px-4 sm:px-0"
      @init-api="(val) => emblaThumbnailApi = val"
    >
      <CarouselContent class="flex gap-1 ml-0">
        <CarouselItem v-for="(image, index) in images" :key="index" class="pl-0 basis-1/5 cursor-pointer sm:basis-1/4" @click="onThumbClick(index)">
          <div class="p-1" :class="index === selectedIndex ? '' : 'opacity-50'">
            <Card class="flex items-center justify-center py-0 overflow-hidden rounded-lg">
              <CardContent class="flex items-center justify-center p-0 aspect-square overflow-hidden">
                <img :src="image" :alt="$t('app.productPage.detail.imageAlt', { n: index + 1 })" class="w-full h-full object-cover" />
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </div>
</template>