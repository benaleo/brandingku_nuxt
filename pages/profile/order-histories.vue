<script setup lang="ts">
import { computed, h, ref, watchEffect } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type OrderStatus = "SHIPPED" | "PROCESSING" | "DELIVERED";

type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  invoiceUrl?: string;
};

definePageMeta({
  layout: "default",
});

watchEffect(() => {
  useHead({
    title: "Order History",
  });
});

const router = useRouter();

const searchOrderId = ref("");
const dateFrom = ref("");
const dateTo = ref("");

const page = ref(0);
const limit = ref(10);

const orders = ref<Order[]>([
  {
    id: "#BK-90231",
    date: "2024-10-24",
    status: "SHIPPED",
    total: 1240,
    invoiceUrl: "#",
  },
  {
    id: "#BK-89912",
    date: "2024-10-18",
    status: "PROCESSING",
    total: 450.5,
    invoiceUrl: "#",
  },
  {
    id: "#BK-89540",
    date: "2024-09-29",
    status: "DELIVERED",
    total: 2890,
    invoiceUrl: "#",
  },
  {
    id: "#BK-88210",
    date: "2024-08-15",
    status: "DELIVERED",
    total: 720,
    invoiceUrl: "#",
  },
  {
    id: "#BK-87002",
    date: "2024-08-05",
    status: "SHIPPED",
    total: 310,
    invoiceUrl: "#",
  },
  {
    id: "#BK-86011",
    date: "2024-07-28",
    status: "DELIVERED",
    total: 1550,
    invoiceUrl: "#",
  },
  {
    id: "#BK-85888",
    date: "2024-07-14",
    status: "PROCESSING",
    total: 200,
    invoiceUrl: "#",
  },
  {
    id: "#BK-85004",
    date: "2024-06-20",
    status: "DELIVERED",
    total: 980,
    invoiceUrl: "#",
  },
  {
    id: "#BK-84001",
    date: "2024-06-02",
    status: "SHIPPED",
    total: 640,
    invoiceUrl: "#",
  },
  {
    id: "#BK-83017",
    date: "2024-05-22",
    status: "DELIVERED",
    total: 399,
    invoiceUrl: "#",
  },
  {
    id: "#BK-82003",
    date: "2024-05-03",
    status: "DELIVERED",
    total: 1299,
    invoiceUrl: "#",
  },
  {
    id: "#BK-81019",
    date: "2024-04-14",
    status: "SHIPPED",
    total: 500,
    invoiceUrl: "#",
  },
]);

const filteredOrders = computed(() => {
  const keyword = searchOrderId.value.trim().toLowerCase();
  const from = dateFrom.value ? new Date(dateFrom.value) : null;
  const to = dateTo.value ? new Date(dateTo.value) : null;

  return orders.value.filter((o) => {
    const matchesKeyword = !keyword || o.id.toLowerCase().includes(keyword);

    const d = new Date(o.date);
    const matchesFrom = !from || d >= from;
    const matchesTo = !to || d <= to;

    return matchesKeyword && matchesFrom && matchesTo;
  });
});

const pagedOrders = computed(() => {
  const start = page.value * limit.value;
  const end = start + limit.value;
  return filteredOrders.value.slice(start, end);
});

const pagination = computed(() => ({
  page: page.value,
  limit: limit.value,
  total: filteredOrders.value.length,
}));

const shippedThisMonth = computed(() => {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();

  return filteredOrders.value.filter((o) => {
    if (o.status !== "SHIPPED") return false;
    const d = new Date(o.date);
    return d.getMonth() === m && d.getFullYear() === y;
  }).length;
});

const totalOrders = computed(() => filteredOrders.value.length);
const inProcessing = computed(
  () => filteredOrders.value.filter((o) => o.status === "PROCESSING").length,
);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
};

const statusVariant = (status: OrderStatus) => {
  if (status === "SHIPPED") return "default";
  if (status === "PROCESSING") return "secondary";
  return "secondary";
};

const columns: ColumnDef<Order, any>[] = [
  {
    accessorKey: "id",
    header: () => "Order ID",
    cell: ({ row }) => row.original.id,
  },
  {
    accessorKey: "date",
    header: () => "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "status",
    header: () => "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return h(
        Badge,
        {
          variant: statusVariant(status) as any,
          class:
            status === "SHIPPED"
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-gray-100 text-gray-700 hover:bg-gray-100",
        },
        () => status,
      );
    },
  },
  {
    accessorKey: "total",
    header: () => "Total",
    cell: ({ row }) => formatCurrency(row.original.total),
  },
  {
    id: "action",
    header: () => "Action",
    cell: ({ row }) => {
      const url = row.original.invoiceUrl || "#";
      return h(
        Button,
        {
          variant: "ghost" as any,
          class: "text-green-700 hover:text-green-800",
          onClick: () => window.open(url, "_blank"),
        },
        () => "Invoice",
      );
    },
  },
];

const onPageChange = (next: number) => {
  page.value = next;
};

const onLimitChange = (next: number) => {
  limit.value = next;
  page.value = 0;
};

const onResetFilters = () => {
  searchOrderId.value = "";
  dateFrom.value = "";
  dateTo.value = "";
  page.value = 0;
};

watchEffect(() => {
  const maxPage = Math.max(
    0,
    Math.ceil(filteredOrders.value.length / limit.value) - 1,
  );
  if (page.value > maxPage) page.value = maxPage;
});

const onGoHome = () => router.push("/");
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="app-container py-8">
      <div class="pt-24">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <button class="hover:text-primary" type="button" @click="onGoHome">
            Home
          </button>
          <span>/</span>
          <span class="text-primary">Order History</span>
        </div>

        <div class="mt-6">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900">
            Order History
          </h1>
          <p class="mt-2 text-gray-600 max-w-2xl">
            Manage your recent merchandise orders, track shipments, and download
            invoices for your corporate records.
          </p>
        </div>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent class="p-6">
              <p class="text-xs tracking-wide text-gray-500">TOTAL ORDERS</p>
              <p class="mt-2 text-3xl font-bold text-green-700">
                {{ totalOrders }}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6">
              <p class="text-xs tracking-wide text-gray-500">IN PROCESSING</p>
              <p class="mt-2 text-3xl font-bold text-rose-700">
                {{ inProcessing }}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="p-6">
              <p class="text-xs tracking-wide text-gray-500">
                SHIPPED THIS MONTH
              </p>
              <p class="mt-2 text-3xl font-bold text-green-700">
                {{ shippedThisMonth }}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card class="mt-8">
          <CardContent class="p-6">
            <div
              class="flex flex-col lg:flex-row lg:items-end gap-4 lg:justify-between"
            >
              <div class="flex flex-col sm:flex-row gap-3 flex-wrap">
                <div class="grid gap-2">
                  <label class="text-sm text-gray-600">From</label>
                  <Input
                    v-model="dateFrom"
                    type="date"
                    class="w-full sm:w-[180px]"
                  />
                </div>
                <div class="grid gap-2">
                  <label class="text-sm text-gray-600">To</label>
                  <Input
                    v-model="dateTo"
                    type="date"
                    class="w-full sm:w-[180px]"
                  />
                </div>
              </div>

              <div class="grid gap-2">
                <label class="text-sm text-gray-600">Search Order ID</label>
                <Input
                  v-model="searchOrderId"
                  placeholder="e.g. #BK-90231"
                  class="w-full lg:w-[260px]"
                />
              </div>

              <div class="mt-4 flex justify-end">
                <Button variant="outline" type="button" @click="onResetFilters"
                  >Reset Filter</Button
                >
              </div>
            </div>

            <div class="mt-6">
              <DatatablesDataTable
                :columns="columns"
                :data="pagedOrders"
                :pagination="pagination"
                @page-change="onPageChange"
                @limit-change="onLimitChange"
              />
            </div>
          </CardContent>
        </Card>

        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card class="bg-green-800 text-white overflow-hidden">
            <CardContent class="p-6 flex flex-col h-full">
              <h3 class="text-2xl font-bold">Need help with an order?</h3>
              <p class="mt-2 text-white/90 max-w-md">
                Our concierge team is available 24/7 to assist with tracking,
                returns, or volume adjustments.
              </p>
              <div class="mt-6">
                <Button variant="secondary">Contact Support</Button>
              </div>
            </CardContent>
          </Card>

          <Card class="bg-green-50 overflow-hidden">
            <CardContent class="p-6 flex flex-col h-full">
              <h3 class="text-2xl font-bold text-gray-900">
                Sustainability Impact
              </h3>
              <p class="mt-2 text-gray-600 max-w-md">
                Your orders this year have contributed to planting 12 trees and
                reducing 45kg of carbon emissions.
              </p>
              <div class="mt-6">
                <Button variant="outline">View Eco-Report</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
