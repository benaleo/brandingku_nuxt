<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Legal Header -->
    <header class="bg-gradient-to-r from-green-600 to-green-700 text-white pt-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <p class="text-sm font-medium uppercase tracking-wider mb-4">{{ $t('app.tncPage.eyebrow') }}</p>
          <h1 class="text-4xl font-bold mb-6">{{ $t('app.tncPage.title') }}</h1>
          <p class="text-xl text-green-100 max-w-3xl mx-auto mb-8">
            {{ $t('app.tncPage.intro') }}
          </p>
          <div class="flex justify-center space-x-4">
            <a href="#terms-of-use" class="bg-white text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors">
              {{ $t('app.tncPage.sections.terms') }}
            </a>
            <a href="#privacy-policy" class="bg-green-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-900 transition-colors">
              {{ $t('app.tncPage.sections.privacy') }}
            </a>
            <a href="#shipping-returns" class="bg-green-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-900 transition-colors">
              {{ $t('app.tncPage.sections.shipping') }}
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Table of Contents -->
        <aside class="relative w-64 flex-shrink-0">
          <nav class="sticky" style="top: 7rem">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">{{ $t('app.tncPage.toc') }}</h3>
            <ul class="space-y-2">
              <li>
                <a href="#terms-of-use" class="toc-link text-gray-600 hover:text-blue-800 text-sm">{{ $t('app.tncPage.sections.terms') }}</a>
              </li>
              <li>
                <a href="#privacy-policy" class="toc-link text-gray-600 hover:text-gray-800 text-sm">{{ $t('app.tncPage.sections.privacy') }}</a>
              </li>
              <li>
                <a href="#shipping-returns" class="toc-link text-gray-600 hover:text-gray-800 text-sm">{{ $t('app.tncPage.sections.shipping') }}</a>
              </li>
              <li>
                <a href="#intellectual-property" class="toc-link text-gray-600 hover:text-gray-800 text-sm">{{ $t('app.tncPage.sections.ip') }}</a>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Content Area -->
        <div class="flex-1">
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">{{ $t('app.tncPage.title') }}</h2>

            <!-- Terms of Use Section -->
            <section id="terms-of-use" class="mb-12 section-observer">
              <div class="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 transition-all duration-300">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('app.tncPage.sections.terms') }}</h2>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.terms.p1') }}
                </p>
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.terms.p2') }}
                </p>
                <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">{{ $t('app.tncPage.terms.accountTitle') }}</h3>
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.terms.accountText') }}
                </p>
                <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">{{ $t('app.tncPage.terms.responsibilitiesTitle') }}</h3>
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.terms.responsibilitiesText') }}
                </p>
              </div>
              </div>
            </section>

            <!-- Privacy Policy Section -->
            <section id="privacy-policy" class="mb-12 section-observer">
              <div class="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 transition-all duration-300">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('app.tncPage.sections.privacy') }}</h2>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.privacy.p1') }}
                </p>
                <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">{{ $t('app.tncPage.privacy.collectTitle') }}</h3>
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.privacy.collectText') }}
                </p>
                <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">{{ $t('app.tncPage.privacy.useTitle') }}</h3>
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.privacy.useText') }}
                </p>
              </div>
              </div>
            </section>

            <!-- Shipping & Returns Section -->
            <section id="shipping-returns" class="mb-12 section-observer">
              <div class="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 transition-all duration-300">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('app.tncPage.sections.shipping') }}</h2>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.shipping.p1') }}
                </p>
                <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">{{ $t('app.tncPage.shipping.shippingTitle') }}</h3>
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.shipping.shippingText') }}
                </p>
                <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">{{ $t('app.tncPage.shipping.returnTitle') }}</h3>
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.shipping.returnText') }}
                </p>
              </div>
              </div>
            </section>

            <!-- Intellectual Property Section -->
            <section id="intellectual-property" class="mb-12 section-observer">
              <div class="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 transition-all duration-300">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('app.tncPage.sections.ip') }}</h2>
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.ip.p1') }}
                </p>
                <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">{{ $t('app.tncPage.ip.trademarksTitle') }}</h3>
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.ip.trademarksText') }}
                </p>
                <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">{{ $t('app.tncPage.ip.ugcTitle') }}</h3>
                <p class="text-gray-700 mb-4">
                  {{ $t('app.tncPage.ip.ugcText') }}
                </p>
              </div>
              </div>
            </section>

            <!-- Need Help Section -->
            <section class="mb-8 bg-blue-50 rounded-lg p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('app.tncPage.helpTitle') }}</h3>
                  <p class="text-gray-700">{{ $t('app.tncPage.helpText') }}</p>
                </div>
                <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {{ $t('app.tncPage.contactSupport') }}
                </button>
              </div>
            </section>

            <!-- Footer Info -->
            <div class="border-t border-gray-200 pt-6 flex justify-between items-center">
              <p class="text-sm text-gray-500">{{ $t('app.tncPage.lastUpdated') }}</p>
              <a href="#" class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {{ $t('app.tncPage.downloadPdf') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Page metadata
useHead(() => ({
  title: t('app.tncPage.metaTitle'),
  meta: [
    { name: 'description', content: t('app.tncPage.metaDescription') }
  ]
}))

// Active section highlighting
onMounted(() => {
  const sections = document.querySelectorAll('.section-observer')
  let activeSection: Element | null = null
  let isScrolling = false
  
  const observer = new IntersectionObserver(
    (entries) => {
      // Don't update if we're in the middle of a scroll animation
      if (isScrolling) return
      
      // Find the section that's closest to center of viewport
      let centerSection: Element | null = null
      let minDistance = Infinity
      
      const viewportHeight = window.innerHeight
      const viewportCenter = viewportHeight / 2
      
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const rect = entry.boundingClientRect
          const sectionCenter = rect.top + rect.height / 2
          const distanceFromCenter = Math.abs(sectionCenter - viewportCenter)
          
          if (distanceFromCenter < minDistance) {
            minDistance = distanceFromCenter
            centerSection = entry.target
          }
        }
      })
      
      // Only update if we have a center section and it's different from current
      if (centerSection && centerSection !== activeSection) {
        updateActiveSection(centerSection)
      }
    },
    {
      threshold: 0.1, // Low threshold to detect when section enters viewport
      rootMargin: '0px' // No margin to use full viewport
    }
  )

  // Function to update active section styling
  const updateActiveSection = (newActiveSection: Element) => {
    // Remove active styling from previous section
    if (activeSection) {
      const prevSectionDiv = (activeSection as HTMLElement).querySelector(':scope > div') as HTMLElement
      if (prevSectionDiv) {
        prevSectionDiv.classList.remove('bg-green-50', 'border-l-4', 'border-green-500', 'shadow-md')
        prevSectionDiv.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500')
      }
      
      const prevNavLink = document.querySelector(`.toc-link[href="#${(activeSection as HTMLElement).id}"]`)
      if (prevNavLink) {
        prevNavLink.classList.remove('text-blue-600', 'font-medium')
        prevNavLink.classList.add('text-gray-600')
      }
    }
    
    // Add active styling to new section
    const sectionDiv = (newActiveSection as HTMLElement).querySelector(':scope > div') as HTMLElement
    if (sectionDiv) {
      sectionDiv.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500')
      sectionDiv.classList.add('bg-green-50', 'border-l-4', 'border-green-500', 'shadow-md')
    }
    
    // Update table of contents active state
    const sectionId = (newActiveSection as HTMLElement).id
    const navLinks = document.querySelectorAll('.toc-link')
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${sectionId}`) {
        link.classList.remove('text-gray-600')
        link.classList.add('text-blue-600', 'font-medium')
      } else {
        link.classList.remove('text-blue-600', 'font-medium')
        link.classList.add('text-gray-600')
      }
    })
    
    activeSection = newActiveSection
  }

  // Handle click events on navigation links
  const handleNavClick = (e: Event) => {
    e.preventDefault()
    const target = e.target as HTMLAnchorElement
    const targetId = target.getAttribute('href')
    if (!targetId) return
    
    const targetSection = document.querySelector(targetId) as HTMLElement
    if (!targetSection) return
    
    // Set scrolling flag to prevent observer interference
    isScrolling = true
    
    // Manually update active section immediately
    updateActiveSection(targetSection)
    
    // Scroll to section
    targetSection.scrollIntoView({ behavior: 'smooth' })
    
    // Clear scrolling flag after animation completes
    setTimeout(() => {
      isScrolling = false
    }, 1000) // Give time for smooth scroll to complete
  }

  // Add click listeners to navigation links
  const navLinks = document.querySelectorAll('.toc-link')
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick)
  })

  // Observe all sections
  sections.forEach(section => observer.observe(section))

  // Set initial active state to first section
  if (sections.length > 0) {
    updateActiveSection(sections[0]!)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    sections.forEach(section => observer.unobserve(section))
    navLinks.forEach(link => {
      link.removeEventListener('click', handleNavClick)
    })
  })
})
</script>

<style scoped>
/* Smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}

/* Custom prose styling for better readability */
.prose {
  color: #374151;
  line-height: 1.7;
}

.prose h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose p {
  margin-bottom: 1rem;
}

/* Sticky navigation for table of contents */
.sticky {
  position: sticky;
  top: 2rem;
}

/* Offset for anchor links to avoid header overlap */
.section-observer {
  scroll-margin-top: 10rem;
}
</style>