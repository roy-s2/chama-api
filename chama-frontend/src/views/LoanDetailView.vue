<template>
  <div class="px-4 py-6 space-y-6" v-if="loan">
    <div>
      <button class="text-sm text-muted-foreground mb-1" @click="$router.back()">← Back</button>
      <h1 class="text-2xl font-bold">Loan Details</h1>
    </div>

    <!-- Status badge -->
    <div class="flex items-center gap-2">
      <Badge :variant="statusVariant(loan.status)">
        {{ loan.status }}
      </Badge>
      <span v-if="loan.status === 'disbursed' && disbursedDate" class="text-sm text-muted-foreground">
        Disbursed on {{ disbursedDate }}
      </span>
    </div>

    <!-- Summary -->
    <Card>
      <CardContent class="p-4 space-y-3">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Amount</span>
          <span class="font-semibold">KES {{ loan.amount.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Purpose</span>
          <span>{{ loan.purpose }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Term</span>
          <span>{{ loan.termMonths }} months</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Guarantor</span>
          <span>{{ loan.guarantor?.name || 'N/A' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Monthly Installment</span>
          <span class="font-medium">KES {{ loan.monthlyInstallment.toLocaleString() }}</span>
        </div>
        <!-- Remaining balance (if disbursed) -->
        <div v-if="loan.status === 'disbursed'" class="flex justify-between border-t pt-2">
          <span class="text-muted-foreground">Outstanding Balance</span>
          <span class="font-medium">KES {{ outstandingBalance.toLocaleString() }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- Repayment Schedule -->
    <div>
      <h2 class="text-lg font-semibold mb-2">Repayment Schedule</h2>
      <div class="space-y-2">
        <div
          v-for="(payment, idx) in loan.schedule"
          :key="idx"
          class="flex justify-between p-3 bg-muted rounded-lg text-sm"
        >
          <span>{{ payment.dueDate }}</span>
          <span class="font-medium">KES {{ payment.amount.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Repayment History (if any) -->
    <div v-if="loan.repayments && loan.repayments.length">
      <h2 class="text-lg font-semibold mb-2">Payment History</h2>
      <div class="space-y-2">
        <div
          v-for="repay in loan.repayments"
          :key="repay.id"
          class="flex justify-between p-3 bg-muted rounded-lg text-sm"
        >
          <div>
            <p class="font-medium">KES {{ repay.amount.toLocaleString() }}</p>
            <p class="text-xs text-muted-foreground">{{ formatDate(repay.date) }}</p>
          </div>
          <span class="text-xs text-muted-foreground">{{ repay.ref }}</span>
        </div>
      </div>
    </div>

    <!-- Repay button (only if disbursed and not repaid) -->
    <div v-if="loan.status === 'disbursed'" class="space-y-3">
      <div class="flex gap-2">
        <Input v-model="repayAmount" type="number" placeholder="Amount (KES)" class="flex-1" />
        <Button @click="makeRepayment" :disabled="!repayAmount || repaying">
          {{ repaying ? 'Processing...' : 'Repay' }}
        </Button>
      </div>
      <p class="text-xs text-muted-foreground">This will simulate an M‑Pesa payment and update your balance.</p>
    </div>
  </div>

  <!-- Loading state -->
  <div v-else class="px-4 py-6">
    <Skeleton class="h-8 w-48 mb-4" />
    <Skeleton class="h-32 w-full rounded-xl" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLoanStore } from '@/stores/loans'
import { Card, CardContent, Badge, Button, Input, Skeleton } from '@/components/ui'
import { Banknote } from '@lucide/vue'

const route = useRoute()
const loanStore = useLoanStore()
const loan = ref(null)
const repayAmount = ref(null)
const repaying = ref(false)

const disbursedDate = computed(() => {
  if (!loan.value?.disbursementDate) return ''
  return new Date(loan.value.disbursementDate).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
})

const outstandingBalance = computed(() => {
  if (!loan.value) return 0
  const totalPaid = loan.value.repayments?.reduce((sum, r) => sum + r.amount, 0) || 0
  return loan.value.totalRepayment - totalPaid
})

function statusVariant(status) {
  switch (status) {
    case 'pending': return 'outline'
    case 'approved': return 'secondary'
    case 'disbursed': return 'default'
    case 'repaid': return 'success'
    case 'rejected': return 'destructive'
    default: return 'outline'
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function makeRepayment() {
  const amount = Number(repayAmount.value)
  if (!amount || amount <= 0) return
  repaying.value = true
  try {
    loanStore.addRepayment(loan.value.id, amount)
    // Refresh loan data
    loan.value = loanStore.getLoanById(route.params.id)
    repayAmount.value = null
  } catch (e) {
    alert('Repayment failed.')
  } finally {
    repaying.value = false
  }
}

onMounted(() => {
  loanStore.fetchLoans()
  loan.value = loanStore.getLoanById(route.params.id)
})
</script>
