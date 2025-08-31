<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import FieldXText from '~/components/forms/fields/FieldXText.vue'
import type { OptionType } from '~/types/options.type'
import type { ProductAdditional } from '~/types/products.type'
import { useOptionsService } from '~/services/options.service'

const props = defineProps<{
  modelValue: ProductAdditional[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: ProductAdditional[]): void
}>()

const dtypes = ref<OptionType[]>([])

const list = ref<ProductAdditional[]>(props.modelValue || [])

watch(() => props.modelValue, (v) => { list.value = v || [] }, { immediate: true })
watch(list, (v) => emit('update:modelValue', v), { deep: true })

function addAdditional() {
  list.value.push({ name: '', price: 0, moq: 0, stock: 0, discount: 0, discount_type: 'AMOUNT', attributes: '' })
}
function removeAdditional(idx: number) {
  if (list.value.length > 1) list.value.splice(idx, 1)
}

onMounted(async () => {
  dtypes.value = await useOptionsService().fetchDiscountTypes()
})
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold">Additionals</h3>
      <Button type="button" @click="addAdditional">Add Additional</Button>
    </div>

    <div v-for="(additional, addIdx) in list" :key="addIdx" class="border rounded p-4 mb-4 relative">
      <Button type="button" variant="destructive" class="absolute top-2 right-2" @click="removeAdditional(addIdx)"
              v-if="list.length > 1">Remove</Button>
      <div class="flex flex-wrap gap-2">
        <FieldXText item-class="w-full md:w-1/2 lg:w-1/3" name="additional_name" label="Name" placeholder="Name"
                    v-model="additional.name"/>
        <FieldXText item-class="w-full md:w-1/2 lg:w-1/3" name="price" label="Price" placeholder="Price"
                    v-model="additional.price"/>
        <FieldXText item-class="w-full md:w-1/2 lg:w-1/3" name="moq" label="MOQ" placeholder="MOQ"
                    v-model="additional.moq"/>
        <FieldXText item-class="w-full md:w-1/2 lg:w-1/3" name="stock" label="Stock" placeholder="Stock"
                    v-model="additional.stock"/>
        <FieldXText item-class="w-full md:w-1/2 lg:w-1/3" name="discount" label="Discount" placeholder="Discount"
                    v-model="additional.discount"/>
        <div class="w-full md:w-1/2 lg:w-1/3 px-1">
          <label class="block form-label mb-2">Discount Type</label>
          <select v-model="additional.discount_type" class="form-input">
            <option v-for="type in dtypes" :key="type.id" :value="type.id">{{ type.label }}</option>
          </select>
        </div>
        <div class="w-full px-1">
          <label class="block form-label mb-2">Attributes (JSON string or text)</label>
          <textarea class="form-input" rows="2" v-model="additional.attributes" placeholder='e.g. "color:red,size:M"'></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
