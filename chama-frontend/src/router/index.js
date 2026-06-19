import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ContributeView from '@/views/ContributeView.vue'
import BankDepositView from '@/views/BankDepositView.vue'
import LoansView from '@/views/LoansView.vue'
import LoanApplyView from '@/views/LoanApplyView.vue'
import LoanDetailView from '@/views/LoanDetailView.vue'
import AdminLoansView from '@/views/AdminLoansView.vue'
import MeetingsView from '@/views/MeetingsView.vue'
import MeetingCreateView from '@/views/MeetingCreateView.vue'
import MeetingDetailView from '@/views/MeetingDetailView.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { requiresGuest: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { requiresAuth: true } },
  { path: '/', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/contribute', name: 'contribute', component: ContributeView, meta: { requiresAuth: true } },
  { path: '/bank-deposit', name: 'bank-deposit', component: BankDepositView, meta: { requiresAuth: true } },
  { path: '/loans', name: 'loans', component: LoansView, meta: { requiresAuth: true } },
  { path: '/loans/apply', name: 'loan-apply', component: LoanApplyView, meta: { requiresAuth: true } },
  { path: '/loans/:id', name: 'loan-detail', component: LoanDetailView, meta: { requiresAuth: true } },
  { path: '/admin/loans', name: 'admin-loans', component: AdminLoansView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/meetings', name: 'meetings', component: MeetingsView, meta: { requiresAuth: true } },
  { path: '/meetings/create', name: 'meeting-create', component: MeetingCreateView, meta: { requiresAuth: true } },
  { path: '/meetings/:id', name: 'meeting-detail', component: MeetingDetailView, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.token) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && authStore.token) {
    next({ name: 'dashboard' })
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
