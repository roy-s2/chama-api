<template>
  <div class="px-4 py-6 space-y-6">
    <!-- Header -->
    <div>
      <button class="text-sm text-muted-foreground mb-1" @click="$router.back()">← Back</button>
      <h1 class="text-2xl font-bold">Apply for a Loan</h1>
    </div>

    <!-- Form -->
    <div class="space-y-4">
      <!-- Amount -->
      <div>
        <label class="text-sm font-medium">Loan Amount (KES)</label>
        <Input
          v-model.number="amount"
          type="number"
          placeholder="e.g. 5000"
          class="mt-1"
          :disabled="submitting"
        />
        <p class="text-xs text-muted-foreground mt-1">Minimum: 1,000 KES</p>
      </div>

      <!-- Purpose -->
      <div>
        <label class="text-sm font-medium">Purpose</label>
        <Input
          v-model="purpose"
          placeholder="e.g. Business stock, school fees"
          class="mt-1"
          :disabled="submitting"
        />
      </div>

      <!-- Term -->
      <div>
        <label class="text-sm font-medium">Repayment Term (months)</label>
        <select
          v-model.number="termMonths"
          class="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm"
          :disabled="submitting"
        >
          <option :value="1">1 month</option>
          <option :value="2">2 months</option>
          <option :value="3">3 months</option>
          <option :value="4">4 months</option>
          <option :value="6">6 months</option>
        </select>
      </div>

      <!-- Guarantor (text input with live validation) -->
      <div>
        <label class="text-sm font-medium">Guarantor Phone Number</label>
        <Input
          v-model="guarantor"
          placeholder="e.g. 0712 345 678"
          class="mt-1"
          :disabled="submitting"
        />
        <!-- Live feedback -->
        <p v-if="guarantorName" class="text-sm text-green-600 mt-1">
          ✔️ {{ guarantorName.firstName }} {{ guarantorName.lastName }}
        </p>
        <p v-else-if="guarantor.length >= 10 && !guarantorName" class="text-sm text-red-500 mt-1">
          ⚠️ This number does not belong to any member.
        </p>
        <p class="text-xs text-muted-foreground mt-1">
          Enter the phone number of a fellow member who will guarantee your loan.
        </p>
      </div>

      <!-- Repayment Preview (if amount and term are valid) -->
      <div v-if="schedulePreview" class="bg-muted p-4 rounded-xl space-y-2">
        <h3 class="font-semibold text-sm">Repayment Preview</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <span class="text-muted-foreground">Monthly Installment</span>
          <span class="font-medium">
            KES {{ schedulePreview.monthlyInstallment.toLocaleString() }}
          </span>
          <span class="text-muted-foreground">Total Interest</span>
          <span>KES {{ schedulePreview.totalInterest.toLocaleString() }}</span>
          <span class="text-muted-foreground">Total Repayment</span>
          <span class="font-medium">
            KES {{ schedulePreview.totalRepayment.toLocaleString() }}
          </span>
        </div>
        <div class="mt-2 text-xs text-muted-foreground">
          First payment due: {{ schedulePreview.schedule[0]?.dueDate }}
        </div>
      </div>

      <Button class="w-full" @click="submit" :disabled="!canSubmit || submitting">
        {{ submitting ? 'Submitting...' : 'Submit Application' }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLoanStore } from '@/stores/loans'
import { Button, Input } from '@/components/ui'

const router = useRouter()
const authStore = useAuthStore()
const loanStore = useLoanStore()

const amount = ref(null)
const purpose = ref('')
const termMonths = ref(1)
const guarantor = ref('')
const submitting = ref(false)

// Validate the guarantor input against known members
const guarantorName = computed(() => {
  const raw = guarantor.value.trim()
  if (raw.length < 10) return null
  const name = authStore.getMemberName(raw)
  if (!name) return null
  // Prevent self‑guarantor
  const cleanSelf = authStore.member?.phone_number?.replace(/\D/g, '')
  const cleanGuarantor = raw.replace(/\D/g, '')
  if (cleanSelf === cleanGuarantor) return null
  return name
})

// Preview schedule whenever amount or term changes
const schedulePreview = computed(() => {
  if (!amount.value || amount.value < 1000) return null
  return loanStore.getRepaymentSchedule(amount.value, 5, termMonths.value)
})

// Enable submit only if all fields are valid and guarantor is a recognised member
const canSubmit = computed(() => {
  return (
    amount.value >= 1000 &&
    purpose.value.trim() &&
    guarantorName.value !== null
  )
})

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await loanStore.applyLoan(
      amount.value,
      purpose.value.trim(),
      guarantor.value.replace(/\D/g, ''),   // pass clean phone
      termMonths.value
    )
    router.push('/loans')
  } catch (e) {
    alert('Failed to apply. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>