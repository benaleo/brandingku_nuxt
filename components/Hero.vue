<template>
  <div class="w-full relative h-[60vh] overflow-hidden">
    <div class="waves back">
      <svg viewBox="0 24 150 28" preserveAspectRatio="none" style="transform: scaleY(-1); width: 100vw; height: 200px">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
        </defs>
        <g class="wave"><use href="#gentle-wave" xlink:href="#gentle-wave" x="48" y="5"></use></g>
        <g class="wave"><use href="#gentle-wave" xlink:href="#gentle-wave" x="48" y="7"></use></g>
      </svg>
    </div>
    <div class="waves front">
      <svg viewBox="0 24 150 28" preserveAspectRatio="none" style="transform: scaleY(-1); width: 100vw; height: 200px">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
        </defs>
        <g class="wave"><use href="#gentle-wave" xlink:href="#gentle-wave" x="48" y="0"></use></g>
        <g class="wave"><use href="#gentle-wave" xlink:href="#gentle-wave" x="48" y="3"></use></g>
      </svg>
    </div>
    <div class="absolute z-10 w-full top-0 h-[40vh] flex flex-col items-center justify-center">
    <div class="bg-[#0f6e2d] pt-16 w-full h-full">
      <div class="relative px-4 md:px-6 lg:px-8 container h-full flex flex-col justify-center" style="max-width: fit-content">
        <Badge variant="outline" class="text-white bg-slate-400/20">We Are</Badge>
        <div class="text-4xl font-bold text-white">Brandingku supplier merchandise terpercaya.</div>
        <div class="text-2xl text-white">Kami menyediakan berbagai produk untuk memenuhi kebutuhan Anda.</div>
      </div>
      </div>
    </div>
  </div>
</template>

<style>
.waves {
  position: absolute;
  top: 28vh;
  left: 0;
  height: 35vh;
  background: #135d13;
}

.waves svg {
  position: absolute;
  bottom: 0;
  left: 0;
}

.waves .wave {
  animation: wavewave 5s cubic-bezier(.55, .5, .45, .5) infinite;
  transform-box: fill-box;
  transform-origin: center;
  will-change: transform;
}
.waves .wave use { opacity: 0.8; }
.waves.back .wave use { fill: #16a34a; }
.waves.front .wave use { fill: #0f6e2d; }

.waves.back { z-index: 1; }
.waves.back svg > .wave:nth-of-type(1) { animation-delay: -4s; animation-duration: 13s; }
.waves.back svg > .wave:nth-of-type(2) { animation-delay: -5s; animation-duration: 20s; }

.waves.front { z-index: 3; }
.waves.front svg > .wave:nth-of-type(1) { animation-delay: -2s; animation-duration: 7s; }
.waves.front svg > .wave:nth-of-type(2) { animation-delay: -3s; animation-duration: 10s; }

@keyframes wavewave {
  0% { transform: translateX(-90px); }
  100% { transform: translateX(85px); }
}

@keyframes bob {
  0% { transform: rotate(-10deg) translateY(0vh); }
  100% { transform: rotate(8deg) translateY(-20vh); }
}

@media (prefers-color-scheme: dark) {
  body { background: #1A202C; }
  .waves::after {
    background-image: linear-gradient(to bottom right, #34D399, #34D399);
    top: 0;
    height: 60vh;
    content: "";
    position: absolute;
    width: 100%;
    left: 0;
  }
  .waves .wave use { fill: #34D399; }
  .boat .hull { background: darkred; border-top-color: #600000; }
  .boat .sail1,
  .boat .sail2 { border-bottom-color: whitesmoke; }
}
</style>