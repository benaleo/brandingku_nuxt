<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, FileText, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { Order, OrderProgress, OrderProgressFile } from '~/types/order.type'

// production of a quotation order after its first payment: the admin reports each step,
// the customer approves the mockup, the sample and the start of mass production. viewer=customer shows their answer buttons.
const props = defineProps<{ order: Order; viewer: 'customer' | 'staff'; busy?: boolean }>()
const emit = defineEmits<{ review: [progressId: number, approve: boolean, note: string] }>()

const { t, locale } = useI18n()
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL
const PRODUCTION = ['mockup', 'sample', 'mass_production', 'qc', 'ready_to_ship'] as const
// steps the customer approves before the next one starts
const APPROVAL = ['mockup', 'sample', 'mass_production']
const needsApproval = (stage: string) => APPROVAL.includes(stage)

type Step = { key: string; state: 'done' | 'current' | 'upcoming'; entries: OrderProgress[] }
const steps = computed<Step[]>(() => {
  const o = props.order
  const at = o.production_stage === 'done' ? PRODUCTION.length : PRODUCTION.indexOf(o.production_stage as typeof PRODUCTION[number])
  const shipped = o.status === 'shipped' || o.status === 'completed'
  const list: Step[] = PRODUCTION.map((key, i) => ({
    key,
    state: i < at ? 'done' : i === at ? 'current' : 'upcoming',
    entries: o.progress.filter(p => p.stage === key),
  }))
  list.push({ key: 'shipped', state: shipped ? 'done' : at >= PRODUCTION.length ? 'current' : 'upcoming', entries: [] })
  list.push({ key: 'completed', state: o.status === 'completed' ? 'done' : shipped ? 'current' : 'upcoming', entries: [] })
  return list
})
// the approval step waiting for the customer's answer
const pending = computed(() => [...props.order.progress].reverse().find(p => p.stage === props.order.production_stage && needsApproval(p.stage) && !p.decision))

const formatWhen = (iso: string) =>
  new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
const fileUrl = (f: OrderProgressFile) => (f.path.startsWith('http') ? f.path : `${STORAGE_URL}${f.path}`)
const isImage = (f: OrderProgressFile) => f.content_type.startsWith('image/')

// hint under the current step, worded for whoever is looking
const currentHint = (key: string) => {
  if (needsApproval(key)) {
    if (pending.value) return props.viewer === 'customer' ? t(`app.production.waitingYou.${key}`) : t('app.production.waitingCustomer')
    return t(`app.production.preparing.${key}`)
  }
  // the final sets paid_at: from then on only the shipment is left
  if (key === 'shipped') {
    if (!props.order.paid_at) return t('app.production.shipWaiting')
    return props.viewer === 'customer' ? t('app.production.shipReadyCustomer') : t('app.production.shipReadyStaff')
  }
  return t('app.production.inProgress')
}

const revising = ref(false)
const revisionNote = ref('')
const answer = (approve: boolean) => {
  if (!pending.value) return
  emit('review', pending.value.id, approve, approve ? '' : revisionNote.value.trim())
}
const viewing = ref<OrderProgressFile | null>(null)
defineExpose({ resetReview: () => { revising.value = false; revisionNote.value = '' } })
</script>

<template>
  <section class="rounded-xl border bg-card p-5 text-sm shadow-sm">
    <h2 class="font-semibold">{{ $t('app.production.title') }}</h2>
    <ol class="mt-4">
      <li v-for="(step, i) in steps" :key="step.key" class="relative flex gap-3 pb-5 last:pb-0">
        <span v-if="i < steps.length - 1" class="absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-px" :class="step.state === 'done' ? 'bg-green-600' : 'bg-slate-200'" aria-hidden="true" />
        <span
          class="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-semibold"
          :class="step.state === 'done' ? 'border-green-600 bg-green-600 text-white' : step.state === 'current' ? 'border-green-600 bg-white text-green-700' : 'border-slate-200 bg-white text-slate-400'"
        >
          <Check v-if="step.state === 'done'" class="size-3.5" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-medium" :class="step.state === 'upcoming' ? 'text-slate-400' : 'text-slate-900'">{{ $t(`app.production.steps.${step.key}`) }}</p>
          <p v-if="step.state === 'current'" class="mt-0.5 text-xs text-green-700">{{ currentHint(step.key) }}</p>

          <div v-for="entry in step.entries" :key="entry.id" class="mt-2 rounded-lg border bg-slate-50 p-3">
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>{{ formatWhen(entry.created_at) }}</span>
              <span
                v-if="needsApproval(entry.stage) && entry.decision"
                class="rounded-full px-2 py-0.5 font-medium"
                :class="entry.decision === 'approved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'"
              >{{ $t(`app.production.decision.${entry.decision}`) }}</span>
              <!-- mass production reported before it needed approval has no answer and no badge -->
              <span v-else-if="entry.id === pending?.id" class="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">{{ $t('app.production.decision.waiting') }}</span>
            </div>
            <p v-if="entry.note" class="mt-1 whitespace-pre-wrap break-words text-slate-700">{{ entry.note }}</p>
            <div v-if="entry.files.length" class="mt-2 flex flex-wrap gap-2">
              <template v-for="f in entry.files" :key="f.path">
                <button
                  v-if="isImage(f)"
                  type="button"
                  class="size-20 overflow-hidden rounded-md border bg-white focus-visible:outline-2 focus-visible:outline-green-600"
                  :aria-label="$t('app.production.viewFile', { name: f.file_name })"
                  @click="viewing = f"
                >
                  <img :src="fileUrl(f)" :alt="f.file_name" loading="lazy" class="size-full object-cover">
                </button>
                <a v-else :href="fileUrl(f)" target="_blank" rel="noopener" class="flex h-20 w-32 flex-col items-center justify-center gap-1 rounded-md border bg-white px-2 text-center text-xs text-slate-600 hover:border-green-600">
                  <FileText class="size-5" />
                  <span class="w-full truncate">{{ f.file_name }}</span>
                </a>
              </template>
            </div>
            <p v-if="entry.decision === 'revision' && entry.decision_note" class="mt-2 rounded-md bg-orange-50 p-2 text-xs text-orange-800">
              {{ $t('app.production.revisionNote') }}: {{ entry.decision_note }}
            </p>
          </div>

          <!-- the customer answers the approval step waiting for them -->
          <div v-if="viewer === 'customer' && order.can_review_progress && pending && step.key === pending.stage" class="mt-3 space-y-2">
            <div class="flex flex-wrap gap-2">
              <Button size="sm" class="bg-green-600 hover:bg-green-700" :disabled="busy" @click="answer(true)">
                <Loader2 v-if="busy" class="size-4 animate-spin" />{{ $t(`app.production.approve.${step.key}`) }}
              </Button>
              <Button size="sm" variant="outline" :disabled="busy" @click="revising = !revising">{{ $t('app.production.requestRevision') }}</Button>
            </div>
            <form v-if="revising" class="space-y-2" @submit.prevent="answer(false)">
              <label for="progress-revision" class="sr-only">{{ $t('app.production.revisionPlaceholder') }}</label>
              <textarea id="progress-revision" v-model="revisionNote" rows="3" maxlength="1000" :placeholder="$t('app.production.revisionPlaceholder')" class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-green-600" />
              <Button type="submit" size="sm" :disabled="busy || !revisionNote.trim()">{{ $t('app.production.sendRevision') }}</Button>
            </form>
          </div>
          <slot v-if="step.state === 'current'" :name="`current-${step.key}`" />
        </div>
      </li>
    </ol>

    <Dialog :open="!!viewing" @update:open="(open: boolean) => { if (!open) viewing = null }">
      <DialogContent class="max-w-[calc(100%-2rem)] gap-3 p-3 sm:max-w-3xl">
        <DialogTitle class="truncate pr-8 text-sm font-medium">{{ viewing?.file_name }}</DialogTitle>
        <DialogDescription class="sr-only">{{ $t('app.production.title') }}</DialogDescription>
        <img v-if="viewing" :src="fileUrl(viewing)" :alt="viewing.file_name" class="mx-auto max-h-[75vh] w-auto max-w-full rounded-md object-contain">
      </DialogContent>
    </Dialog>
  </section>
</template>
