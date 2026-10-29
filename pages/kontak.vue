<script lang="ts" setup>
import { Phone, Mail, MapPin, Globe, Users, Clock } from 'lucide-vue-next'
import { useWebContactService } from '~/services/web-contact.service'

// contact details are editable in the console Options menu and rendered server-side
const { phone, email, address, hours, mapsUrl, phoneHref, emailHref } = useSiteSettings()
const siteUrl = useRuntimeConfig().public.BASE_URL
const { t } = useI18n()

useHead({
  title: computed(() => t('app.contactPage.metaTitle')),
  script: [{
    type: 'application/ld+json',
    // structured data so search engines can show the business contact details
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Brandingku',
      ...(siteUrl ? { url: siteUrl } : {}),
      email: email.value,
      telephone: phone.value,
      address: { '@type': 'PostalAddress', streetAddress: address.value },
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service', telephone: phone.value, email: email.value }],
    })),
  }],
});

const { createInquiry, loading, error } = useWebContactService()

// the stored subject stays in English so inquiries read the same in the console whatever the visitor's language
const subjectOptions = [
  { value: 'Sustainable Merchandise Inquiry', key: 'merchandise' },
  { value: 'General Question', key: 'general' },
  { value: 'Partnership Opportunity', key: 'partnership' },
  { value: 'Support Request', key: 'support' },
]
const DEFAULT_SUBJECT = subjectOptions[0]!.value

const form = reactive({
  name: '',
  email: '',
  subject: DEFAULT_SUBJECT,
  message: '',
  model: 'web-contact'
})

const submitted = ref(false)
const submitError = ref<string | null>(null)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  submitError.value = null

  if (!form.name || !form.email || !form.message) {
    submitError.value = t('app.contactPage.requiredError')
    return
  }

  try {
    await createInquiry({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
      model: form.model
    })
    submitted.value = true
    // Reset form
    form.name = ''
    form.email = ''
    form.message = ''
    form.subject = DEFAULT_SUBJECT
  } catch (err: any) {
    submitError.value = err?.message || t('app.contactPage.sendFailed')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <!-- in normal flow on phones; the side picture shows from lg up -->
    <section class="ps bg-linear-green relative overflow-hidden pb-40 pt-28 text-white lg:flex lg:min-h-screen lg:items-center lg:pb-48 lg:pt-32">
      <!-- Wave SVG at bottom -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F9FAFB"/>
        </svg>
      </div>
      
      <div class="container relative z-10 mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-block px-4 py-2 bg-white/20 rounded-full mb-6">
              <span class="text-sm font-semibold">{{ $t('app.contactPage.eyebrow') }}</span>
            </div>
            <h1 class="mb-4 text-4xl font-bold leading-tight md:mb-6 md:text-5xl">{{ $t('app.contactPage.title') }}</h1>
            <p class="text-base leading-relaxed opacity-90 md:text-xl">
              {{ $t('app.contactPage.subtitle') }}
            </p>
          </div>
          <div class="relative hidden justify-center lg:flex">
            <img src="/images/no-image.jpg" :alt="$t('app.contactPage.heroImageAlt')" class="w-full max-w-[500px] rotate-3 rounded-lg shadow-2xl" />
            <div class="absolute bg-white text-green-600 px-4 py-3 rounded-lg shadow-lg" style="left: 70px; bottom: -15px">
              <div class="text-2xl font-bold">24/7</div>
              <div class="text-xs">{{ $t('app.contactPage.supportBadge') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Cards -->
    <div class="max-w-7xl mx-auto px-4 mb-12">
      <div class="relative z-10 mb-12 -mt-28 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <!-- Call Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="font-semibold text-lg mb-2">{{ $t('app.contactPage.callTitle') }}</h3>
          <p class="text-gray-600 mb-3">{{ hours }}</p>
          <a :href="phoneHref" class="font-medium text-gray-900 hover:text-green-700">{{ phone }}</a>
        </div>

        <!-- Email Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="font-semibold text-lg mb-2">{{ $t('app.contactPage.emailTitle') }}</h3>
          <p class="text-gray-600 mb-3">{{ $t('app.contactPage.emailText') }}</p>
          <a :href="emailHref" class="font-medium text-gray-900 break-all hover:text-green-700">{{ email }}</a>
        </div>

        <!-- Office Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="font-semibold text-lg mb-2">{{ $t('app.contactPage.officeTitle') }}</h3>
          <p class="text-gray-600 mb-3">{{ $t('app.contactPage.officeText') }}</p>
          <a v-if="mapsUrl" :href="mapsUrl" target="_blank" rel="noopener" class="font-medium text-gray-900 hover:text-green-700">{{ address }}</a>
          <p v-else class="font-medium text-gray-900">{{ address }}</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Contact Form -->
        <div class="lg:col-span-2">
          <div class="rounded-lg bg-white p-5 shadow-lg md:p-8">
            <h2 class="text-2xl font-bold mb-2">{{ $t('app.contactPage.formTitle') }}</h2>
            <p class="text-gray-600 mb-6">{{ $t('app.contactPage.formSubtitle') }}</p>

            <!-- Success Message -->
            <div v-if="submitted" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-green-800 font-medium">{{ $t('app.contactPage.success') }}</p>
            </div>

            <!-- Error Message -->
            <div v-if="submitError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-800 font-medium">{{ submitError }}</p>
            </div>

            <form @submit="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('app.contactPage.nameLabel') }}</label>
                <input
                  v-model="form.name"
                  type="text"
                  :placeholder="$t('app.contactPage.namePlaceholder')"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('app.contactPage.emailLabel') }}</label>
                <input
                  v-model="form.email"
                  type="email"
                  :placeholder="$t('app.contactPage.emailPlaceholder')"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('app.contactPage.subjectLabel') }}</label>
                <select v-model="form.subject" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option v-for="opt in subjectOptions" :key="opt.value" :value="opt.value">
                    {{ $t(`app.contactPage.subjects.${opt.key}`) }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('app.contactPage.messageLabel') }}</label>
                <textarea
                  v-model="form.message"
                  :placeholder="$t('app.contactPage.messagePlaceholder')"
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? $t('app.contactPage.sending') : $t('app.contactPage.send') }}
              </button>
            </form>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Studio Image -->
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="relative h-48 bg-gradient-to-br from-green-400 to-green-600">
              <div class="absolute inset-0 flex items-center justify-center text-white">
                <div class="text-center">
                  <div class="text-xs font-semibold mb-1">{{ $t('app.contactPage.studioLabel') }}</div>
                  <div class="text-lg font-bold">The Greenhouse HQ</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Global Support -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold mb-3">{{ $t('app.contactPage.globalTitle') }}</h3>
            <p class="text-gray-600 text-sm mb-4">
              {{ $t('app.contactPage.globalText') }}
            </p>
            <div class="flex justify-around">
              <div class="text-center">
                <Globe class="w-8 h-8 text-green-600 mx-auto mb-1" />
                <div class="text-xs text-gray-600">{{ $t('app.contactPage.worldwide') }}</div>
              </div>
              <div class="text-center">
                <Users class="w-8 h-8 text-green-600 mx-auto mb-1" />
                <div class="text-xs text-gray-600">{{ $t('app.contactPage.expertTeam') }}</div>
              </div>
              <div class="text-center">
                <Clock class="w-8 h-8 text-green-600 mx-auto mb-1" />
                <div class="text-xs text-gray-600">{{ $t('app.contactPage.support247') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
