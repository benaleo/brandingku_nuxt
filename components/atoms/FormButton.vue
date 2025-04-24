<template>
    <div class="w-full flex justify-end items-center gap-2">
        <Button variant="secondary" @click="handleBack" type="button">
            {{ isDetail ? 'Kembali' : 'Batal' }}
        </Button>
        <Button type="submit" v-if="!isDetail">
            Simpan
        </Button>
    </div>
</template>

<script setup lang="ts">

const router = useRouter()
const currentPath = router.currentRoute.value.path
const isDetail = currentPath.includes("/detail")

type HandleBack = () => void
const props = defineProps<{
    handleBack: HandleBack
}>()

defineEmits(['submit'])

defineExpose({
    handleBack: props.handleBack
})
</script>