<template>
  <div class="px-4 py-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">
        Jambo, {{ authStore.member?.first_name || 'Member' }} 👋
      </h1>
      <p class="text-sm text-muted-foreground">Here’s your financial snapshot</p>
    </div>

    <BalanceCard
      :amount="contributionStore.getMyTotalSavings()"
      :loading="false"
    />

    <div class="grid grid-cols-2 gap-3">
      <Button variant="secondary" class="h-24 flex flex-col gap-1 transition-all active:scale-95 hover:shadow-lg" @click="$router.push('/contribute')">
        <PlusCircle class="w-6 h-6" />
        <span>M-Pesa</span>
      </Button>
      <Button variant="secondary" class="h-24 flex flex-col gap-1 transition-all active:scale-95 hover:shadow-lg" @click="$router.push('/bank-deposit')">
        <Building2 class="w-6 h-6" />
        <span>Bank Deposit</span>
      </Button>
      <Button variant="secondary" class="h-24 flex flex-col gap-1 transition-all active:scale-95 hover:shadow-lg" @click="$router.push('/loans')">
        <Landmark class="w-6 h-6" />
        <span>Apply Loan</span>
      </Button>
      <Button variant="secondary" class="h-24 flex flex-col gap-1 transition-all active:scale-95 hover:shadow-lg" @click="$router.push('/meetings')">
        <Calendar class="w-6 h-6" />
        <span>Meetings</span>
      </Button>
    </div>

    <!-- Active Loan Alert (kept as before) -->
    <div
      v-if="memberStore.dashboardData?.active_loan"
      class="p-4 rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800"
    >
      <p class="font-medium flex items-center gap-2">
        <AlertCircle class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        Active Loan:
        {{ formatCurrency(memberStore.dashboardData.active_loan.balance) }}
      </p>
      <p class="text-sm mt-1">
        Next repayment:
        {{ formatDate(memberStore.dashboardData.active_loan.next_due) }}
      </p>
    </div>

    <!-- Recent Transactions (combine contributions + mock) -->
    <div>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Recent Activity</h2>
        <Button variant="link" @click="$router.push('/transactions')">View All</Button>
      </div>
      <div v-if="recentTransactions.length" class="mt-3 space-y-2">
        <TransactionItem
          v-for="tx in recentTransactions"
          :key="tx.id"
          :tx="tx"
        />
      </div>
      <p v-else class="text-sm text-muted-foreground mt-3">
        No transactions yet. Start by making a contribution.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/member'
import { useAuthStore } from '@/stores/auth'
import { useContributionStore } from '@/stores/contributions'
import BalanceCard from '@/components/BalanceCard.vue'
import TransactionItem from '@/components/TransactionItem.vue'
import { Button, Skeleton } from '@/components/ui'
import { PlusCircle, Landmark, AlertCircle, Building2, Calendar } from '@lucide/vue'

const router = useRouter()
const authStore = useAuthStore()
const memberStore = useMemberStore()
const contributionStore = useContributionStore()

// Combine real contributions with mock transactions
const recentTransactions = computed(() => {
  const mock = memberStore.dashboardData?.recent_transactions || []
  const real = contributionStore.getMyContributions().map(c => ({
    id: c.id,
    description: c.method === 'bank' ? 'Bank Deposit' : 'M‑Pesa Contribution',
    amount: c.amount,
    type: 'contribution',
    timestamp: c.timestamp,
  }))
  return [...real, ...mock].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
})

const formatCurrency = (val) => {
  if (val == null) return 'KES 0'
  return `KES ${Number(val).toLocaleString()}`
}
const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  memberStore.fetchDashboard()
  contributionStore.fetchContributions()
})
</script>
