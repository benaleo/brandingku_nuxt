<template>
  <div class="w-full relative h-[60vh] overflow-hidden">
    <div class="waves back">
      <svg viewBox="0 24 150 28" style="transform: scaleY(-1);">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
        </defs>
        <use xlink:href="#gentle-wave" x="48" y="5"></use>
        <use xlink:href="#gentle-wave" x="48" y="7"></use>
      </svg>
    </div>
    <div class="boat">
      <div class="sail1"></div>
      <div class="sail2"></div>
      <div class="hull"></div>
    </div>
    <div class="waves front">
      <svg viewBox="0 24 150 28" style="transform: scaleY(-1);">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
        </defs>
        <use xlink:href="#gentle-wave" x="48" y="0"></use>
        <use xlink:href="#gentle-wave" x="48" y="3"></use>
      </svg>
    </div>
    <div class="px-4 absolute w-full top-24 md:top-40 flex flex-col items-center justify-center z-10">
      <Badge variant="outline" class="text-white bg-slate-400/20">We Are</Badge>
      <div class="text-4xl font-bold text-white">Brandingku supplier merchandise terpercaya.</div>
      <div class="text-2xl text-white">Kami menyediakan berbagai produk untuk memenuhi kebutuhan Anda.</div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.waves {
  position: absolute;
  bottom: 100px;
  left: 0;
  height: 75vh;
  width: 100%;

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    width: 100%;
    bottom:0;
    height: 50px;
    background: #1A202C;
  }

  svg {
    position: absolute;
    top: 60vh;
    left: 0;
  }

  use {
    animation: wavewave 5s cubic-bezier(.55, .5, .45, .5) infinite;
    fill: #1A202C;
    opacity: 0.7;
  }
}

.waves.back {
  z-index: 1;

  use:nth-child(2) {
    animation-delay: -4s;
    animation-duration: 13s;
  }

  use:nth-child(3) {
    animation-delay: -5s;
    animation-duration: 20s;
  }
}

.waves.front {
  z-index: 3;

  use:nth-child(2) {
    animation-delay: -2s;
    animation-duration: 7s;
  }

  use:nth-child(3) {
    animation-delay: -3s;
    animation-duration: 10s;
  }
}

@keyframes wavewave {
  0% {
    transform: translate(-90px);
  }

  100% {
    transform: translate(85px);
  }
}


@keyframes bob {
  0% {
    transform: rotate(-10deg) translateY(0vh);
  }

  100% {
    transform: rotate(8deg) translateY(-20vh);
  }
}

@media (prefers-color-scheme: dark) {
  body {
    background: #1A202C;
  }

  .waves {
    &:after {
      background-image: linear-gradient(to bottom right, #34D399, #34D399);
      top: 0;
      height: 60vh;
      content: "";
      position: absolute;
      width: 100%;
    }

    use {
      fill: #34D399;
    }
  }

  .boat {
    .hull {
      background: darkred;
      border-top-color: #600000;
    }

    .sail1,
    .sail2 {
      border-bottom-color: whitesmoke;
    }
  }
}
</style>