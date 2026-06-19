<template>
  <div class="px-4 py-6 space-y-6">
    <div>
      <button class="text-sm text-muted-foreground mb-1" @click="$router.back()">← Back</button>
      <h1 class="text-2xl font-bold">Record Bank Deposit</h1>
      <p class="text-sm text-muted-foreground mt-1">For manual bank transfers</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium">Amount (KES)</label>
        <Input v-model.number="amount" type="number" placeholder="e.g. 5000" class="mt-1" />
      </div>
      <div>
        <label class="text-sm font-medium">Bank Reference Number</label>
        <Input v-model="refNumber" placeholder="e.g. FT123456789" class="mt-1" />
      </div>
      <div>
        <label class="text-sm font-medium">Bank Name</label>
        <Input v-model="bankName" placeholder="e.g. KCB, Equity" class="mt-1" />
      </div>
      <div>
        <label class="text-sm font-medium">Date</label>
        <input
          v-model="depositDate"
          type="date"
          class="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm"
        />
      </div>
      <Button class="w-full" @click="submit" :disabled="!canSubmit || submitting">
        {{ submitting ? 'Submitting...' : 'Submit Deposit' }}
      </Button>
    </div>

    <div v-if="success" class="bg-green-50 border border-green-200 p-4 rounded-xl">
      <p class="font-medium text-green-700">✅ Deposit recorded!</p>
      <p class="text-sm mt-1">KES {{ success.amount.toLocaleString() }} will be verified by admin.</p>
      <Button variant="outline" size="sm" class="mt-2" @click="$router.push('/')">Back to Dashboard</Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useContributionStore } from '@/stores/contributions'
import { Button, Input } from '@/components/ui'

const router = useRouter()
const authStore = useAuthStore()
const contributionStore = useContributionStore()

const amount = ref(null)
const refNumber = ref('')
const bankName = ref('')
const depositDate = ref(new Date().toISOString().slice(0, 10))
const submitting = ref(false)
const success = ref(null)

const canSubmit = computed(() => amount.value && refNumber.value && bankName.value)

async function submit() {
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // simulate
    const contribution = await contributionStore.addContribution(amount.value, 'bank')
    contribution.ref = refNumber.value
    contribution.bank = bankName.value
    contribution.date = depositDate.value
    success.value = contribution
  } catch (e) {
    alert('Failed to record deposit.')
  } finally {
    submitting.value = false
  }
}
</script>
