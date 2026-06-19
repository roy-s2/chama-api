import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMemberStore = defineStore('member', () => {
  const dashboardData = ref(null)
  const loading = ref(false)

  async function fetchDashboard() {
    loading.value = true
    // Simulate a short network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock dashboard data – no API call at all
    dashboardData.value = {
      total_savings: 15750,
      active_loan: {
        balance: 5000,
        next_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      recent_transactions: [
        {
          id: 1,
          description: 'Monthly contribution',
          amount: 2000,
          type: 'contribution',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          description: 'Loan disbursement',
          amount: 5000,
          type: 'loan_disbursement',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          description: 'Contribution – voluntary',
          amount: 500,
          type: 'contribution',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    }

    loading.value = false
  }

  return { dashboardData, loading, fetchDashboard }
})