<script setup lang="ts">
import { Card, CardContent } from "~/components/ui/card";

const services = [
  {
    id: 1,
    name: "Kualitas Premium",
    description:
      "Hanya menggunakan bahan baku terbaik untuk memastikan merchandise Anda tahan lama dan elegan.",
    image: "/icon/check-icon.svg",
  },
  {
    id: 2,
    name: "Produksi Cepat",
    description:
      "Sistem produksi yang efisien memungkinkan pengerjaan tepat waktu sesuai deadline korporasi Anda.",
    image: "/icon/speed-icon.svg",
  },
  {
    id: 3,
    name: "Ramah Lingkungan",
    description:
      "Berbagai pilihan produk ramah lingkungan yang mendukung kampanye sustainability perusahaan.",
    image: "/icon/leaf-icon.svg",
  },
];
</script>

<template>
  <section class="py-16 md:py-24 lg:max-w-6xl mx-auto">
    <div class="container px-4 mx-auto">
      <div class="relative flex justify-center items-center mb-8">
        <h2 class="text-2xl md:text-3xl font-bold">Layanan Kami</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          v-for="service in services"
          :key="service.id"
          class="hover:shadow-md transition-shadow py-0 bg-slate-50 hover:bg-slate-100 border-0"
        >
          <CardContent class="p-4 flex flex-col items-center">
            <div
              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
            >
              <nuxt-img :src="service.image" width="100" height="100" />
            </div>
            <h3 class="font-medium text-center">{{ service.name }}</h3>
            <p class="text-sm text-center">{{ service.description }}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
