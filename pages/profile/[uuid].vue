<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const route = useRoute();
const uuid = Array.isArray(route.params.uuid) ? route.params.uuid[0] : route.params.uuid;
const { profile, loading, error, getUserProfile } = useUserProfile();

// Authorization check - redirect to login if not authenticated
const token = useCookie<string | null>('token', { sameSite: 'lax' });
const router = useRouter();

// Check authentication on mount
onMounted(() => {
  if (!token.value) {
    router.push('/console/auth');
    return;
  }
  // Fetch user profile
  if (uuid) {
    getUserProfile(uuid);
  }
});

// Hardcoded data for now (will be replaced with actual profile data)
const profileData = computed(() => ({
  name: profile.value?.name || "Alexandra",
  email: profile.value?.email || "alexandra@example.com",
  phone: profile.value?.phone || "+62 812-3456-7890",
  address: profile.value?.address || "Jakarta, Indonesia",
  avatar: profile.value?.avatar || "/images/avatars/alexandra.jpg",
  sustainabilityMetrics: {
    itemsSaved: 247,
    landfillDiverted: 89.5,
    goalProgress: 67
  },
  activeOrders: [
    {
      id: "ORD-001",
      productName: "Eco-Friendly Tote Bag",
      quantity: 50,
      status: "In Production",
      estimatedDelivery: "2024-04-15"
    },
    {
      id: "ORD-002", 
      productName: "Bamboo Water Bottle",
      quantity: 100,
      status: "Processing",
      estimatedDelivery: "2024-04-20"
    }
  ],
  isProMember: true,
  recommendedProducts: [
    {
      id: 1,
      name: "Recycled Notebook Set",
      price: 45000,
      image: "/images/products/notebook-set.jpg",
      badge: "New"
    },
    {
      id: 2,
      name: "Organic Cotton T-Shirt",
      price: 120000,
      image: "/images/products/cotton-shirt.jpg",
      badge: "Best Seller"
    },
    {
      id: 3,
      name: "Solar Power Bank",
      price: 250000,
      image: "/images/products/solar-bank.jpg",
      badge: "Eco Tech"
    },
    {
      id: 4,
      name: "Biodegradable Phone Case",
      price: 75000,
      image: "/images/products/phone-case.jpg",
      badge: "Popular"
    }
  ]
}));

definePageMeta({
  layout: "default",
});

// Update head title when profile data changes
watchEffect(() => {
  useHead({
    title: `Profile - ${profileData.value.name}`,
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading profile...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-red-600 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p class="text-gray-600 mb-2">{{ error }}</p>
        <Button @click="uuid && getUserProfile(uuid)" variant="outline">Try Again</Button>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else>
      <!-- Header Section -->
      <div class="bg-white shadow-sm border-b">
      <div class="app-container py-6">
        <div class="pt-24 flex items-center justify-between">
          <div class="">
            <h1 class="text-2xl font-bold text-gray-900">Hello, {{ profileData.name }}.</h1>
            <p class="text-gray-600 mt-1">Welcome back to your sustainability dashboard</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-gray-500">Member Since</p>
              <p class="font-semibold">March 2024</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-purple-600 font-bold">{{ profileData.name.charAt(0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="app-container py-8">
      <!-- Sustainability Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Items Saved</p>
                <p class="text-3xl font-bold text-green-600">{{ profileData.sustainabilityMetrics.itemsSaved }}</p>
                <p class="text-sm text-gray-600 mt-1">This month</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Landfill Diverted</p>
                <p class="text-3xl font-bold text-blue-600">{{ profileData.sustainabilityMetrics.landfillDiverted }}kg</p>
                <p class="text-sm text-gray-600 mt-1">Total impact</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Goal Progress</p>
                <p class="text-3xl font-bold text-purple-600">{{ profileData.sustainabilityMetrics.goalProgress }}%</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div class="bg-purple-600 h-2 rounded-full" :style="`width: ${profileData.sustainabilityMetrics.goalProgress}%`"></div>
                </div>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Active Orders -->
        <div class="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center justify-between">
                <span>Active Orders</span>
                <Badge variant="secondary">{{ profileData.activeOrders.length }} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="order in profileData.activeOrders" :key="order.id" class="border rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-semibold">{{ order.productName }}</p>
                      <p class="text-sm text-gray-500">{{ order.id }} - Quantity: {{ order.quantity }}</p>
                      <p class="text-sm text-gray-600">Est. Delivery: {{ order.estimatedDelivery }}</p>
                    </div>
                    <div class="text-right">
                      <Badge :variant="order.status === 'In Production' ? 'default' : 'secondary'">
                        {{ order.status }}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-4">
                <Button variant="outline" class="w-full" @click="router.push('/profile/order-histories')">View All Orders</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Pro Member Section -->
        <div>
          <Card class="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <Badge variant="secondary" class="bg-white/20 text-white">PRO</Badge>
              </div>
              <h3 class="text-xl font-bold mb-2">Pro Member</h3>
              <p class="text-sm opacity-90 mb-4">Enjoy exclusive benefits and priority support</p>
              <div class="space-y-2 text-sm">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  Free shipping on all orders
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  15% discount on eco-products
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  Priority customer support
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Recommended Eco-Swag -->
      <div class="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Eco-Swag</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div v-for="product in profileData.recommendedProducts" :key="product.id" class="group">
                <div class="relative overflow-hidden rounded-lg border">
                  <div class="aspect-square bg-gray-100 relative">
                    <img 
                      :src="product.image" 
                      :alt="product.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onerror="this.src='/images/no-image.jpg'"
                    />
                    <Badge class="absolute top-2 left-2" variant="secondary">
                      {{ product.badge }}
                    </Badge>
                  </div>
                  <div class="p-4">
                    <h3 class="font-semibold text-sm mb-2 line-clamp-2">{{ product.name }}</h3>
                    <div class="flex items-center justify-between">
                      <p class="text-lg font-bold text-green-600">Rp {{ product.price.toLocaleString() }}</p>
                      <Button size="sm" variant="outline">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  </div>
</template>
