import { ref, onMounted, onUnmounted } from 'vue'

export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const target = ref<HTMLElement | null>(null)
  const hasIntersected = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!process.client) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasIntersected.value) {
            hasIntersected.value = true
            callback()
            // Optional: stop observing after first intersection
            observer?.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '100px 0px', // Start loading 100px before element comes into view
        ...options,
      }
    )

    if (target.value) {
      observer.observe(target.value)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    target,
    hasIntersected,
  }
}
