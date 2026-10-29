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

        <!-- decorative product image: only where there is room beside the text -->
        <div class="relative hidden justify-center lg:flex">
          <div class="relative aspect-square w-full max-w-md rotate-3 overflow-hidden rounded-lg shadow-lg">
            <img
              src="https://picsum.photos/800/800?random=1"
              alt="Brandingku merchandise"
              width="800"
              height="800"
              class="h-full w-full object-cover"
              fetchpriority="high"
            />
            <Badge variant="secondary" class="absolute top-4 right-4">{{ $t('app.hero.newArrival') }}</Badge>
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
}
</style>
