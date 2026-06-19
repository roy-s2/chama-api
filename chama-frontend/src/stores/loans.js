import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const DEFAULT_INTEREST_RATE = 5   // 5% per month flat

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

export const useLoanStore = defineStore('loans', () => {
  const loans = ref([])
  const loading = ref(false)

  function fetchLoans() {
    loading.value = true
    try {
      const stored = localStorage.getItem('chama_loans')
      loans.value = stored ? JSON.parse(stored) : []
    } catch {
      loans.value = []
    }
    loading.value = false
  }

  function saveLoans() {
    localStorage.setItem('chama_loans', JSON.stringify(loans.value))
  }

  // Get loans for the current member
  function getMyLoans() {
    const auth = useAuthStore()
    if (!auth.member) return []
    const phone = auth.member.phone_number?.replace(/\D/g, '')
    return loans.value.filter(l => l.memberPhone === phone)
  }

  // Get all pending loans (for admin)
  function getPendingLoans() {
    return loans.value.filter(l => l.status === 'pending')
  }

  // Get all approved but not yet disbursed loans (for admin)
  function getApprovedUndisbursedLoans() {
    return loans.value.filter(l => l.status === 'approved')
  }

  // Repayment schedule
  function getRepaymentSchedule(amount, interestRate, termMonths) {
    const totalInterest = (amount * interestRate / 100) * termMonths
    const totalRepayment = amount + totalInterest
    const monthlyInstallment = totalRepayment / termMonths
    const schedule = []
    const startDate = new Date()
    for (let i = 1; i <= termMonths; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(startDate.getMonth() + i)
      schedule.push({
        month: i,
        dueDate: dueDate.toISOString().slice(0, 10),
        amount: Math.round(monthlyInstallment * 100) / 100,
      })
    }
    return {
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalRepayment: Math.round(totalRepayment * 100) / 100,
      monthlyInstallment: Math.round(monthlyInstallment * 100) / 100,
      schedule,
    }
  }

  // Apply for a loan (member)
  async function applyLoan(amount, purpose, guarantorPhone, termMonths, interestRate = DEFAULT_INTEREST_RATE) {
    const auth = useAuthStore()
    const member = auth.member
    if (!member) throw new Error('Not authenticated')

    const allMembers = auth.getMembersList()
    const guarantor = allMembers.find(m => m.phone === guarantorPhone)

    const scheduleData = getRepaymentSchedule(amount, interestRate, termMonths)

    const newLoan = {
      id: generateId(),
      memberPhone: member.phone_number?.replace(/\D/g, ''),
      memberName: `${member.first_name} ${member.last_name}`,
      amount: amount,
      purpose: purpose,
      guarantor: {
        phone: guarantorPhone,
        name: guarantor ? `${guarantor.firstName} ${guarantor.lastName}` : 'Unknown',
      },
      interestRate: interestRate,
      termMonths: termMonths,
      status: 'pending',               // pending | approved | disbursed | repaid
      applicationDate: new Date().toISOString(),
      approvalDate: null,
      disbursementDate: null,           // new: when admin releases funds
      schedule: scheduleData.schedule,
      totalRepayment: scheduleData.totalRepayment,
      monthlyInstallment: scheduleData.monthlyInstallment,
      repayments: [],                   // array of { id, amount, date, ref }
    }

    loans.value.push(newLoan)
    saveLoans()
    return newLoan
  }

  // Admin: approve a loan
  function approveLoan(loanId) {
    const loan = loans.value.find(l => l.id === loanId)
    if (loan && loan.status === 'pending') {
      loan.status = 'approved'
      loan.approvalDate = new Date().toISOString()
      saveLoans()
    }
  }

  // Admin: reject a loan
  function rejectLoan(loanId) {
    const loan = loans.value.find(l => l.id === loanId)
    if (loan && loan.status === 'pending') {
      loan.status = 'rejected'
      loan.approvalDate = new Date().toISOString()
      saveLoans()
    }
  }

  // Admin: disburse an approved loan (mark as disbursed)
  function disburseLoan(loanId) {
    const loan = loans.value.find(l => l.id === loanId)
    if (loan && loan.status === 'approved') {
      loan.status = 'disbursed'
      loan.disbursementDate = new Date().toISOString()
      saveLoans()
    }
  }

  // Member: make a repayment (mock M‑Pesa transaction)
  function addRepayment(loanId, amount) {
    const loan = loans.value.find(l => l.id === loanId)
    if (!loan || loan.status !== 'disbursed') return false

    const repayment = {
      id: generateId(),
      amount: amount,
      date: new Date().toISOString(),
      ref: 'MOCK' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    }
    loan.repayments.push(repayment)

    // Check if loan is fully repaid (total repayments >= total repayment amount)
    const totalPaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0)
    if (totalPaid >= loan.totalRepayment) {
      loan.status = 'repaid'
    }
    saveLoans()
    return repayment
  }

  // Get a single loan by id
  function getLoanById(loanId) {
    return loans.value.find(l => l.id === loanId) || null
  }

  // Initial load
  fetchLoans()

  return {
    loans,
    loading,
    fetchLoans,
    getMyLoans,
    getPendingLoans,
    getApprovedUndisbursedLoans,
    applyLoan,
    approveLoan,
    rejectLoan,
    disburseLoan,
    addRepayment,
    getRepaymentSchedule,
    getLoanById,
  }
})
