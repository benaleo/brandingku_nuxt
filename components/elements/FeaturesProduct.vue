<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

const featuredProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 129.99,
    image: "https://picsum.photos/400/400?random=2",
    isNew: true,
    type: "popular"
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirt",
    category: "Fashion",
    price: 29.99,
    image: "https://picsum.photos/400/400?random=3",
    isNew: false,
    type: "popular"
  },
  {
    id: 3,
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 19.99,
    image: "https://picsum.photos/400/400?random=4",
    isNew: true,
    type: "recommendation"
  },
  {
    id: 4,
    name: "Natural Face Cream",
    category: "Beauty",
    price: 24.99,
    image: "https://picsum.photos/400/400?random=5",
    isNew: false,
    type: "popular"
  }
]

const filteredProducts = (type: string) => {
  return featuredProducts.filter(product => product.type === type)
}

</script>

<template>
  <Tabs default-value="popular" class="w-full px-4 md:px-0 md:max-w-3/4 mx-auto py-12">
    <TabsList>
      <TabsTrigger v-for="(trigger, index) in tabs" :key="index" :value="trigger.name">
        {{ trigger.name.toLocaleUpperCase() }}
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="(val, index) in tabs" :key="val.id" :value="val.name">
      <Carousel class="relative w-full px-4 md:px-0" :opts="{
        align: 'start',
        loop: true,
      }">
        <CarouselContent>
          <CarouselItem v-for="product in filteredProducts(val.name)" :key="product.id" class="md:basis-1/2 lg:basis-1/4">
            <div class="p-1">
              <Card class="group">
                <CardHeader class="relative p-0">
                  <img :src="product.image" :alt="product.name" class="w-full aspect-square object-cover rounded-t-lg"
                    loading="lazy" />
                  <Badge v-if="product.isNew" variant="secondary" class="absolute top-2 left-2">New</Badge>
                  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" class="rounded-full bg-white shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                        </path>
                      </svg>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent class="p-4">
                  <h3 class="font-medium">{{ product.name }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ product.category }}</p>
                  <div class="flex justify-between items-center mt-4">
                    <span class="font-bold">${{ product.price }}</span>
                    <Button variant="outline" size="sm">Add to Cart</Button>
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

</template>