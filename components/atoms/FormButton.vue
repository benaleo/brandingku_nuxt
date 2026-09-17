<template>
    <div class="form-actions">
        <Button class="w-full sm:w-auto sm:min-w-28" variant="outline" @click="handleBack" type="button">
            {{ isDetail ? 'Kembali' : 'Batal' }}
        </Button>
        <Button class="w-full sm:w-auto sm:min-w-32" type="submit" v-if="!isDetail && canAction(currentPath, currentPath.endsWith('/add') ? 'create' : 'update')">
            Simpan
        </Button>
    </div>
</template>

<script setup lang="ts">

const router = useRouter()
const currentPath = router.currentRoute.value.path
const { canAction } = useConsoleAccess()
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
