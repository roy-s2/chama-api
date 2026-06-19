<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-sm space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold tracking-tight">Complete Your Profile</h1>
        <p class="text-muted-foreground mt-2">Please enter your names to continue</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium">First Name</label>
          <Input v-model="firstName" placeholder="e.g. Wanjiku" class="mt-1" />
        </div>
        <div>
          <label class="text-sm font-medium">Last Name</label>
          <Input v-model="lastName" placeholder="e.g. Muthoni" class="mt-1" />
        </div>
        <Button class="w-full" @click="submit" :disabled="!firstName || !lastName">
          Save & Continue
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button, Input } from '@/components/ui'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')

function submit() {
  const phone = route.query.phone
  if (!phone) {
    alert('Phone number missing. Please log in again.')
    router.push({ name: 'login' })
    return
  }
  authStore.completeRegistration(phone, firstName.value.trim(), lastName.value.trim())
  router.push({ name: 'dashboard' })
}
</script>