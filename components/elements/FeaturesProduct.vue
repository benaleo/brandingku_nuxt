<script setup lang="ts">
import {Card, CardContent} from '@/components/ui/card'
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from '@/components/ui/carousel'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'

const tabs = [
  {
    "id": 1,
    "name": "popular",
    "count": 10,
  },
  {
    "id": 2,
    "name": "recommendation",
    "count": 6,
  },

]

</script>

<template>
  <Tabs default-value="popular" class="w-full px-4 md:px-0 md:max-w-3/4">
    <TabsList>
      <TabsTrigger v-for="(trigger, index) in tabs" :key="index" :value="trigger.name">
        {{ trigger.name.toLocaleUpperCase() }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="(val, index) in tabs" :key="val.id" :value="val.name">
      <Carousel
          class="relative w-full px-4 md:px-0"
          :opts="{
      align: 'start',
      loop: true,
    }"
      >
        <CarouselContent>
          <CarouselItem v-for="(_, index) in Array.from({length: val.count})" :key="index" class="md:basis-1/2 lg:basis-1/4">
            <div class="p-1">
              <Card>
                <CardContent class="flex aspect-square items-center justify-center p-6">
                  <span class="text-3xl font-semibold">{{ index + 1 }}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    </TabsContent>

  </Tabs>

</template>