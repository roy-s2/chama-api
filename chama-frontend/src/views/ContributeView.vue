<template>
  <div class="px-4 py-6 space-y-6">
    <div>
      <button class="text-sm text-muted-foreground mb-1" @click="$router.back()">← Back</button>
      <h1 class="text-2xl font-bold">Make a Contribution</h1>
      <p class="text-sm text-muted-foreground mt-1">
        M‑Pesa STK Push will be sent to your phone
      </p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium">Amount (KES)</label>
        <Input
          v-model.number="amount"
          type="number"
          placeholder="e.g. 1000"
          class="mt-1"
          :disabled="submitting"
        />
      </div>

      <div class="flex gap-2">
        <Button
          v-for="preset in [500, 1000, 2000, 5000]"
          :key="preset"
          variant="outline"
          size="sm"
          @click="amount = preset"
          :disabled="submitting"
        >
          {{ preset }}
        </Button>
      </div>

      <div class="bg-muted p-4 rounded-xl text-sm space-y-1">
        <p>
          <span class="text-muted-foreground">Phone:</span>
          {{ authStore.member?.phone_number }}
        </p>
        <p>
          <span class="text-muted-foreground">Paybill:</span>
          174379 (Sandbox)
        </p>
        <p v-if="amount" class="font-medium mt-2">
          Amount: KES {{ amount.toLocaleString() }}
        </p>
      </div>

      <Button
        class="w-full"
        @click="submit"
        :disabled="!amount || submitting"
      >
        <Loader2 v-if="submitting" class="w-4 h-4 mr-2 animate-spin" />
        {{ submitting ? 'Sending STK Push...' : 'Pay with M‑Pesa' }}
      </Button>
    </div>

    <!-- Success / Error feedback -->
    <div
      v-if="successMsg"
      class="bg-green-50 border border-green-200 p-4 rounded-xl space-y-2"
    >
      <p class="font-medium text-green-700">✅ {{ successMsg }}</p>
      <p v-if="mpesaRef" class="text-xs text-muted-foreground">
        Ref: {{ mpesaRef }}
      </p>
      <Button variant="outline" size="sm" @click="$router.push('/')">
        Back to Dashboard
      </Button>
    </div>

    <div
      v-if="errorMsg"
      class="bg-red-50 border border-red-200 p-4 rounded-xl"
    >
      <p class="font-medium text-red-700">❌ {{ errorMsg }}</p>
      <Button variant="outline" size="sm" class="mt-2" @click="errorMsg = ''">
        Try Again
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { initiateSTKPush } from '@/services/mpesa'
import { Button, Input } from '@/components/ui'
import { Loader2 } from '@lucide/vue'

const router = useRouter()
const authStore = useAuthStore()

const amount = ref(null)
const submitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const mpesaRef = ref('')

async function submit() {
  if (!amount.value || amount.value <= 0) return
  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const phone = authStore.member?.phone_number?.replace(/\D/g, '')
    // Ensure phone starts with 254 for M‑Pesa
    const formattedPhone = phone.startsWith('0')
      ? '254' + phone.slice(1)
      : phone

    const response = await initiateSTKPush(formattedPhone, amount.value)
    if (response.data.ResponseCode === '0') {
      successMsg.value =
        'STK Push sent to your phone. Enter your M‑Pesa PIN to complete payment.'
      mpesaRef.value = response.data.CheckoutRequestID
    } else {
      errorMsg.value = response.data.ResponseDescription || 'STK Push failed'
    }
  } catch (e) {
    errorMsg.value = 'Failed to send STK Push. Check your connection.'
  } finally {
    submitting.value = false
  }
}
</script>
