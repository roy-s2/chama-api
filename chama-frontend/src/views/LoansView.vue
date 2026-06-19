<template>
  <div class="px-4 py-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">My Loans</h1>
      <Button @click="$router.push('/loans/apply')" size="sm">Apply Loan</Button>
    </div>

    <!-- Admin link -->
    <div v-if="authStore.isAdmin" class="bg-muted p-3 rounded-lg flex items-center justify-between">
      <p class="text-sm font-medium">You are an admin</p>
      <Button variant="secondary" size="sm" @click="$router.push('/admin/loans')">
        Approve Pending Loans →
      </Button>
    </div>

    <!-- Loading state -->
    <div v-if="loanStore.loading" class="space-y-3">
      <Skeleton v-for="i in 2" :key="i" class="h-24 w-full rounded-xl" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!myLoans.length" class="text-center py-12">
      <HandCoins class="mx-auto w-12 h-12 text-muted-foreground mb-3" />
      <p class="text-muted-foreground">No loans yet.</p>
      <p class="text-sm text-muted-foreground mt-1">
        Apply for your first loan to get started.
      </p>
    </div>

    <!-- Loan list -->
    <div v-else class="space-y-3">
      <Card
        v-for="loan in myLoans"
        :key="loan.id"
        class="cursor-pointer hover:shadow-md transition-shadow"
        @click="$router.push(`/loans/${loan.id}`)"
      >
        <CardContent class="p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold">KES {{ loan.amount.toLocaleString() }}</p>
              <p class="text-sm text-muted-foreground">{{ loan.purpose }}</p>
            </div>
            <Badge :variant="statusVariant(loan.status)">
              {{ loan.status }}
            </Badge>
          </div>
          <div class="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Term: {{ loan.termMonths }} months</span>
            <span>Guarantor: {{ loan.guarantor?.name || 'N/A' }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLoanStore } from '@/stores/loans'
import { Button, Skeleton, Card, CardContent, Badge } from '@/components/ui'
import { HandCoins } from '@lucide/vue'

const authStore = useAuthStore()
const loanStore = useLoanStore()
const myLoans = computed(() => loanStore.getMyLoans())

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

onMounted(() => {
  loanStore.fetchLoans()
})
</script>
