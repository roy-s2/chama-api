<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-sm space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold tracking-tight">Chama Yetu</h1>
        <p class="text-muted-foreground mt-2">Sign in with your phone number</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium">Phone Number</label>
          <Input
            v-model="phone"
            placeholder="0712 345 678"
            type="tel"
            class="mt-1"
            :disabled="loading"
          />
          <p v-if="memberName" class="text-sm text-primary mt-1 font-medium">
            👋 Welcome back, {{ memberName.firstName }} {{ memberName.lastName }}
          </p>
        </div>

        <div>
          <label class="text-sm font-medium">Password</label>
          <Input
            v-model="password"
            placeholder="Last 4 digits of phone"
            type="password"
            class="mt-1"
            :disabled="loading"
          />
          <p class="text-xs text-muted-foreground mt-1">
            Use the last 4 digits of your phone number.
          </p>
        </div>

        <Button class="w-full" @click="login" :disabled="!canLogin || loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button, Input } from '@/components/ui'

const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const password = ref('')
const loading = ref(false)

const memberName = computed(() => {
  if (phone.value.length >= 10) {
    return authStore.getMemberName(phone.value)
  }
  return null
})

const canLogin = computed(() => phone.value.length >= 10 && password.value.length >= 4)

async function login() {
  loading.value = true
  try {
    const cleanPhone = phone.value.replace(/\D/g, '')
    const lastFour = cleanPhone.slice(-4)

    if (password.value !== lastFour) {
      alert('Incorrect password. For demo, use the last 4 digits of your phone number.')
      loading.value = false
      return
    }

    const result = await authStore.mockLogin(cleanPhone)
    if (result.needsRegistration) {
      // Go to registration page with phone number
      router.push({ name: 'register', query: { phone: cleanPhone } })
    } else {
      router.push({ name: 'dashboard' })
    }
  } catch (e) {
    alert('Login failed. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>