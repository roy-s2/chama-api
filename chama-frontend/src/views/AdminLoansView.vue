<template>
  <div class="px-4 py-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Loan Approvals</h1>
      <Button variant="outline" size="sm" @click="$router.push('/loans')">
        My Loans
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loanStore.loading" class="space-y-3">
      <Skeleton v-for="i in 3" :key="i" class="h-28 w-full rounded-xl" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!pendingLoans.length && !approvedLoans.length" class="text-center py-12">
      <CheckCircle class="mx-auto w-12 h-12 text-green-500 mb-3" />
      <p class="text-muted-foreground">No pending or approved loans to process.</p>
    </div>

    <!-- Pending loan cards (approve/reject) -->
    <div v-if="pendingLoans.length">
      <h2 class="font-semibold text-lg mb-2">Pending Approval</h2>
      <div class="space-y-3">
        <Card v-for="loan in pendingLoans" :key="loan.id" class="p-0">
          <CardContent class="p-4">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="font-semibold">{{ loan.memberName }}</p>
                <p class="text-sm text-muted-foreground">{{ loan.memberPhone }}</p>
              </div>
              <Badge>Pending</Badge>
            </div>

            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-muted-foreground">Amount:</span>
                <span class="ml-1 font-medium">KES {{ loan.amount.toLocaleString() }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">Term:</span>
                <span class="ml-1">{{ loan.termMonths }} months</span>
              </div>
              <div>
                <span class="text-muted-foreground">Monthly:</span>
                <span class="ml-1 font-medium">KES {{ loan.monthlyInstallment.toLocaleString() }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">Guarantor:</span>
                <span class="ml-1">{{ loan.guarantor?.name || 'N/A' }}</span>
              </div>
            </div>
            <p class="text-sm mt-2"><span class="text-muted-foreground">Purpose:</span> {{ loan.purpose }}</p>

            <div class="flex gap-3 mt-4">
              <Button class="flex-1" variant="default" @click="handleApprove(loan.id)">
                <Check class="w-4 h-4 mr-1" /> Approve
              </Button>
              <Button class="flex-1" variant="destructive" @click="handleReject(loan.id)">
                <X class="w-4 h-4 mr-1" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Approved but not yet disbursed -->
    <div v-if="approvedLoans.length">
      <h2 class="font-semibold text-lg mb-2">Approved – Awaiting Disbursement</h2>
      <div class="space-y-3">
        <Card v-for="loan in approvedLoans" :key="loan.id" class="p-0">
          <CardContent class="p-4">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="font-semibold">{{ loan.memberName }}</p>
                <p class="text-sm text-muted-foreground">{{ loan.memberPhone }}</p>
              </div>
              <Badge variant="secondary">Approved</Badge>
            </div>

            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-muted-foreground">Amount:</span>
                <span class="ml-1 font-medium">KES {{ loan.amount.toLocaleString() }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">Monthly:</span>
                <span class="ml-1 font-medium">KES {{ loan.monthlyInstallment.toLocaleString() }}</span>
              </div>
            </div>

            <Button class="w-full mt-3" variant="default" @click="handleDisburse(loan.id)">
              <Banknote class="w-4 h-4 mr-1" /> Disburse Funds
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useLoanStore } from '@/stores/loans'
import { Button, Skeleton, Card, CardContent, Badge } from '@/components/ui'
import { CheckCircle, Check, X, Banknote } from '@lucide/vue'

const loanStore = useLoanStore()
const pendingLoans = computed(() => loanStore.getPendingLoans())
const approvedLoans = computed(() => loanStore.getApprovedUndisbursedLoans())

async function handleApprove(loanId) {
  loanStore.approveLoan(loanId)
}
async function handleReject(loanId) {
  loanStore.rejectLoan(loanId)
}
async function handleDisburse(loanId) {
  loanStore.disburseLoan(loanId)
}

onMounted(() => {
  loanStore.fetchLoans()
})
</script>
