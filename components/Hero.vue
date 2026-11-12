<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { NuxtLink } from '#components'

type MainGallery = { id: number; slug: string; title: string; galleries: { file: string }[] }

const { gqlFetch } = useGql()
const STORAGE_URL = useRuntimeConfig().public.STORAGE_URL

const { data } = await useAsyncData('landing-main-galleries', async () => {
  const res = await gqlFetch<{ getLandingMainGalleries: MainGallery[] }>(
    `query landingMainGalleries { getLandingMainGalleries { id slug title galleries { file } } }`,
  )
  return res.getLandingMainGalleries || []
})

const cards = computed(() =>
  (data.value || [])
    .filter((p) => p.galleries?.length)
    .slice(0, 5)
    .map((p) => {
      const f = p.galleries[0]!.file
      return { id: p.id, slug: p.slug, title: p.title, image: f.startsWith('http') ? f : `${STORAGE_URL}${f}` }
    }),
)

// card indexes from front to back; moving one card at a time keeps the others in their relative order,
// so nothing pops through the stack while it animates
const order = ref<number[]>([])
watch(() => cards.value.length, (n) => { order.value = Array.from({ length: n }, (_, i) => i) }, { immediate: true })
const pos = (i: number) => order.value.indexOf(i)

const paused = ref(false)
// the card being restacked: it fades out where it is, jumps to its new depth while invisible, then fades in
const mover = ref<{ i: number; phase: 'out' | 'place' } | null>(null)
let busy = false
let reduced = false
const OUT_MS = 260

const move = (i: number, restack: () => void) => {
  if (busy || cards.value.length < 2) return
  if (reduced) return restack()
  busy = true
  mover.value = { i, phase: 'out' }
  setTimeout(() => {
    restack()
    mover.value = { i, phase: 'place' }
    // two frames so the untransitioned jump is painted before the fade-in starts
    requestAnimationFrame(() => requestAnimationFrame(() => {
      mover.value = null
      setTimeout(() => { busy = false }, 300)
    }))
  }, OUT_MS)
}
const step = (dir: number) => {
  const list = order.value
  if (dir > 0) move(list[0]!, () => { order.value = [...list.slice(1), list[0]!] })
  else move(list[list.length - 1]!, () => { order.value = [list[list.length - 1]!, ...list.slice(0, -1)] })
}
const bringToFront = (i: number) => move(i, () => { order.value = [i, ...order.value.filter((x) => x !== i)] })

// tilt per layer; the front keeps the original 3deg, the rest spread out behind it
const FAN = [3, 11, -6, 19, -14]
const cardStyle = (i: number) => {
  const p = pos(i)
  const phase = mover.value?.i === i ? mover.value.phase : null
  // the front card lifts slightly towards the viewer as it fades, back cards sink a little
  const lift = phase ? (p === 0 ? 1.05 : 0.96) : 1
  return {
    transform: `rotate(${FAN[p] ?? 0}deg) scale(${(1 - p * 0.04) * lift})`,
    opacity: phase ? 0 : 1,
    transition: phase === 'place' ? 'none' : undefined,
    zIndex: 10 - p,
  }
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return
  timer = setInterval(() => {
    if (!paused.value && !document.hidden && cards.value.length > 1) step(1)
  }, 4000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section class="relative w-full overflow-hidden bg-white">
    <div class="relative bg-[#0f6e2d]">
      <!-- content flows normally so text never gets clipped; top padding clears the fixed navbar -->
      <div class="app-container relative z-10 grid items-center gap-10 px-4 pt-28 pb-10 md:px-6 md:pt-36 md:pb-14 lg:min-h-[calc(100svh-120px)] lg:grid-cols-2 lg:px-8 lg:pt-32">
        <div class="flex min-w-0 flex-col gap-5">
          <Badge variant="outline" class="w-fit border-[#9AF89F] bg-slate-400/20 text-white">
            {{ $t('app.hero.trustedBadge') }}
          </Badge>
          <h1 class="text-4xl font-bold leading-tight text-white text-balance break-words sm:text-5xl lg:text-6xl xl:text-7xl">
            {{ $t('app.hero.titlePrefix') }}<span class="text-[#9AF89F]">{{ $t('app.hero.titleHighlight') }}</span>{{ $t('app.hero.titleSuffix') }}
          </h1>
          <p class="max-w-2xl text-base text-white/90 sm:text-lg lg:text-xl">
            {{ $t('app.hero.description') }}
          </p>
          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button as-child class="h-auto bg-[#9AF89F] px-8 py-4 text-base text-[#0f6e2d] hover:bg-[#9AF89F]/90 md:px-10 md:py-5 md:text-lg">
              <NuxtLink to="/product">{{ $t('app.hero.ctaSearch') }}</NuxtLink>
            </Button>
            <Button as-child class="h-auto border-2 border-white/30 bg-transparent px-8 py-4 text-base text-white hover:bg-white/10 md:px-10 md:py-5 md:text-lg">
              <NuxtLink to="/kontak">{{ $t('app.hero.ctaConsult') }}</NuxtLink>
            </Button>
          </div>
        </div>

        <!-- main galleries from Options: front card plus a fan of up to 4 behind it; only where there is room beside the text -->
        <div v-if="cards.length" class="relative hidden justify-center lg:flex" @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="paused = false">
          <div class="hero-fan relative aspect-square w-full max-w-md">
            <component
              :is="pos(i) === 0 ? NuxtLink : 'button'"
              v-for="(card, i) in cards"
              :key="card.id"
              v-bind="pos(i) === 0 ? { to: `/portfolio/${card.slug}` } : { type: 'button' }"
              class="hero-card absolute inset-0 block overflow-hidden rounded-lg shadow-lg"
              :style="cardStyle(i)"
              :aria-label="card.title"
              :tabindex="pos(i) === 0 ? 0 : -1"
              @click="pos(i) !== 0 && bringToFront(i)"
            >
              <img
                :src="card.image"
                :alt="card.title"
                width="800"
                height="800"
                class="h-full w-full object-cover"
                :fetchpriority="i === 0 ? 'high' : 'low'"
                :loading="i === 0 ? 'eager' : 'lazy'"
              />
              <span class="hero-dim absolute inset-0 bg-black" :style="{ opacity: pos(i) * 0.12 }" />
              <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-3 text-left text-sm font-semibold text-white transition-opacity duration-300" :class="pos(i) === 0 ? 'opacity-100' : 'opacity-0'">
                {{ card.title }}
              </span>
            </component>

            <template v-if="cards.length > 1">
              <button type="button" class="hero-nav left-0 -translate-x-1/2" :aria-label="$t('app.hero.galleryPrev')" @click="step(-1)">
                <ChevronLeft class="size-5" />
              </button>
              <button type="button" class="hero-nav right-0 translate-x-1/2" :aria-label="$t('app.hero.galleryNext')" @click="step(1)">
                <ChevronRight class="size-5" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- animated waves: green fills hang from the hero into the white section below -->
    <div class="hero-waves relative h-16 sm:h-24 md:h-32 lg:h-40" aria-hidden="true">
      <svg class="absolute inset-0 h-full w-full" viewBox="0 24 150 28" preserveAspectRatio="none">
        <defs>
          <path id="hero-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g class="wave back"><use href="#hero-wave" x="48" y="5" /></g>
        <g class="wave back"><use href="#hero-wave" x="48" y="7" /></g>
        <g class="wave front"><use href="#hero-wave" x="48" y="0" /></g>
        <g class="wave front"><use href="#hero-wave" x="48" y="3" /></g>
      </svg>
    </div>
  </section>
</template>

<style scoped>
.hero-card {
  transform-origin: 50% 100%;
  transition: transform 0.6s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.26s ease;
  will-change: transform, opacity;
  backface-visibility: hidden;
}
.hero-dim {
  pointer-events: none;
  transition: opacity 0.6s ease;
}
.hero-nav {
  position: absolute;
  top: 50%;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-top: -1.25rem;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.9);
  color: #0f6e2d;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
}
.hero-nav:hover {
  background: #fff;
}
.hero-waves svg {
  transform: scaleY(-1);
}
.hero-waves .wave {
  animation: hero-wave 5s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
  transform-box: fill-box;
  transform-origin: center;
  will-change: transform;
}
.hero-waves .wave use {
  opacity: 0.8;
}
.hero-waves .wave.back use {
  fill: #16a34a;
}
.hero-waves .wave.front use {
  fill: #0f6e2d;
}
.hero-waves .wave:nth-of-type(1) { animation-delay: -4s; animation-duration: 13s; }
.hero-waves .wave:nth-of-type(2) { animation-delay: -5s; animation-duration: 20s; }
.hero-waves .wave:nth-of-type(3) { animation-delay: -2s; animation-duration: 7s; }
.hero-waves .wave:nth-of-type(4) { animation-delay: -3s; animation-duration: 10s; }

@keyframes hero-wave {
  0% { transform: translateX(-90px); }
  100% { transform: translateX(85px); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-waves .wave { animation: none; }
  .hero-card { transition: none; }
}
</style>
