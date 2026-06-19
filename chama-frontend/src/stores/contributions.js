import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

export const useContributionStore = defineStore('contributions', () => {
  const contributions = ref([])
  const loading = ref(false)

  // Load all contributions from global localStorage
  function fetchContributions() {
    loading.value = true
    try {
      const stored = localStorage.getItem('chama_contributions')
      contributions.value = stored ? JSON.parse(stored) : []
    } catch {
      contributions.value = []
    }
    loading.value = false
  }

  function saveContributions() {
    localStorage.setItem('chama_contributions', JSON.stringify(contributions.value))
  }

  // Get contributions for the current member
  function getMyContributions() {
    const auth = useAuthStore()
    if (!auth.member) return []
    const phone = auth.member.phone_number?.replace(/\D/g, '')
    return contributions.value.filter(c => c.memberPhone === phone)
  }

  // Get total savings for current member
  function getMyTotalSavings() {
    return getMyContributions().reduce((sum, c) => sum + c.amount, 0)
  }

  // Make a contribution
  async function addContribution(amount, method = 'mpesa') {
    const auth = useAuthStore()
    const member = auth.member
    if (!member) throw new Error('Not authenticated')

    const newContribution = {
      id: generateId(),
      memberPhone: member.phone_number?.replace(/\D/g, ''),
      memberName: `${member.first_name} ${member.last_name}`,
      amount: amount,
      method: method,
      ref: 'MOCK' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      timestamp: new Date().toISOString(),
      type: 'contribution',
    }

    contributions.value.push(newContribution)
    saveContributions()
    return newContribution
  }

  // Initial load
  fetchContributions()

  return {
    contributions,
    loading,
    fetchContributions,
    getMyContributions,
    getMyTotalSavings,
    addContribution,
  }
})
