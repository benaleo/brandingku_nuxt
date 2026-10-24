<template>
    <div class="form-actions">
        <Button class="w-full sm:w-auto sm:min-w-28" variant="outline" @click="goBack" type="button" :disabled="busy">
            <Loader2 v-if="backLoading" class="size-4 animate-spin" />
            {{ isDetail ? 'Kembali' : 'Batal' }}
        </Button>
        <Button class="w-full sm:w-auto sm:min-w-32" type="submit" :disabled="busy" v-if="!isDetail && canAction(currentPath, currentPath.endsWith('/add') ? 'create' : 'update')">
            <Loader2 v-if="submitting" class="size-4 animate-spin" />
            {{ submitting ? 'Menyimpan…' : 'Simpan' }}
        </Button>
    </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { FormContextKey } from 'vee-validate'

const router = useRouter()
const currentPath = router.currentRoute.value.path
const { canAction } = useConsoleAccess()
const isDetail = currentPath.includes("/detail")

type HandleBack = () => void
const props = defineProps<{
    handleBack: HandleBack
    loading?: boolean
}>()

defineEmits(['submit'])

// forms built with useForm expose isSubmitting through injection; others can pass `loading`
const form = inject(FormContextKey, null)
// absent boolean props are cast to false, so `??` would never reach isSubmitting
const submitting = computed(() => props.loading || form?.isSubmitting.value || false)

const backLoading = ref(false)
const busy = computed(() => submitting.value || backLoading.value)

// afterEach also runs for aborted/failed navigations, so the spinner never sticks
const stopAfterEach = router.afterEach(() => { backLoading.value = false })
onBeforeUnmount(stopAfterEach)

const goBack = () => {
    backLoading.value = true
    props.handleBack()
}

defineExpose({
    handleBack: props.handleBack
})
</script>
