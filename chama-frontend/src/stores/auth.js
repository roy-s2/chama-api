import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Pre‑loaded known members (optional – can be empty)
const KNOWN_MEMBERS = {
  '0712345678': { firstName: 'Wanjiku', lastName: 'Muthoni' },
  '0723456789': { firstName: 'Kamau', lastName: 'Njoroge' },
  '0112300006': { firstName: 'Amina', lastName: 'Hassan' },
}

// Phone numbers that have admin privileges (clean format)
const ADMIN_PHONES = ['0712345678']

export const useAuthStore = defineStore('auth', () => {
  const token = ref(sessionStorage.getItem('chama_token') || null)
  const member = ref(JSON.parse(sessionStorage.getItem('chama_member') || 'null'))
  const inactivityTimer = ref(null)
  const INACTIVITY_TIMEOUT = 1 * 60 * 1000   // 1 minute

  const isAuthenticated = computed(() => !!token.value)

  // Admin check
  const isAdmin = computed(() => {
    if (!member.value) return false
    const cleanPhone = member.value.phone_number?.replace(/\D/g, '')
    return ADMIN_PHONES.includes(cleanPhone)
  })

  // -------------------------------------------------
  // Helpers – get registered members from localStorage
  // -------------------------------------------------
  function getRegisteredMembers() {
    try {
      return JSON.parse(localStorage.getItem('chama_registered') || '{}')
    } catch {
      return {}
    }
  }

  // Find a member by phone number (searches both hard‑coded and registered lists)
  function findMemberName(phoneRaw) {
    const clean = phoneRaw.replace(/\D/g, '')
    const registered = getRegisteredMembers()
    if (registered[clean]) return registered[clean]

    // Try alternate format (0… ↔ 254…)
    const alt = clean.startsWith('0')
      ? '254' + clean.slice(1)
      : clean.startsWith('254')
      ? '0' + clean.slice(3)
      : null
    if (alt && registered[alt]) return registered[alt]

    if (KNOWN_MEMBERS[clean]) return KNOWN_MEMBERS[clean]
    if (alt && KNOWN_MEMBERS[alt]) return KNOWN_MEMBERS[alt]

    return null
  }

  // Exposed to login page – returns { firstName, lastName } or null
  function getMemberName(phoneRaw) {
    return findMemberName(phoneRaw)
  }

  // -------------------------------------------------
  // Get a list of all members (for guarantor selection, etc.)
  // -------------------------------------------------
  function getMembersList() {
    const list = []
    const registered = getRegisteredMembers()
    for (const [phone, name] of Object.entries(registered)) {
      list.push({ phone, ...name })
    }
    for (const [phone, name] of Object.entries(KNOWN_MEMBERS)) {
      if (!registered[phone]) {
        list.push({ phone, ...name })
      }
    }
    const unique = list.filter(
      (v, i, a) => a.findIndex(t => t.phone === v.phone) === i
    )
    return unique
  }

  // -------------------------------------------------
  // Inactivity timer control
  // -------------------------------------------------
  function startInactivityTimer() {
    stopInactivityTimer()
    inactivityTimer.value = setTimeout(() => {
      logout()
      window.location.href = '/login'
    }, INACTIVITY_TIMEOUT)
  }

  function resetInactivityTimer() {
    if (isAuthenticated.value) {
      stopInactivityTimer()
      startInactivityTimer()
    }
  }

  function stopInactivityTimer() {
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value)
      inactivityTimer.value = null
    }
  }

  // -------------------------------------------------
  // Mock login – returns { needsRegistration: true/false }
  // -------------------------------------------------
  async function mockLogin(cleanPhone) {
    const known = findMemberName(cleanPhone)

    if (known) {
      member.value = {
        phone_number: cleanPhone,
        first_name: known.firstName,
        last_name: known.lastName || '',
      }
      token.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token'
      sessionStorage.setItem('chama_token', token.value)
      sessionStorage.setItem('chama_member', JSON.stringify(member.value))
      startInactivityTimer()
      return { needsRegistration: false }
    } else {
      member.value = {
        phone_number: cleanPhone,
        first_name: '',
        last_name: '',
      }
      token.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token'
      sessionStorage.setItem('chama_token', token.value)
      sessionStorage.setItem('chama_member', JSON.stringify(member.value))
      startInactivityTimer()
      return { needsRegistration: true }
    }
  }

  // -------------------------------------------------
  // Complete first‑time registration
  // -------------------------------------------------
  function completeRegistration(phoneNumber, firstName, lastName) {
    const registered = getRegisteredMembers()
    registered[phoneNumber] = { firstName, lastName }
    localStorage.setItem('chama_registered', JSON.stringify(registered))

    member.value = {
      phone_number: phoneNumber,
      first_name: firstName,
      last_name: lastName,
    }
    token.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token'
    sessionStorage.setItem('chama_token', token.value)
    sessionStorage.setItem('chama_member', JSON.stringify(member.value))

    stopInactivityTimer()
    startInactivityTimer()
  }

  // -------------------------------------------------
  function logout() {
    stopInactivityTimer()
    token.value = null
    member.value = null
    sessionStorage.removeItem('chama_token')
    sessionStorage.removeItem('chama_member')
  }

  return {
    token,
    member,
    isAuthenticated,
    isAdmin,
    getMemberName,
    getMembersList,
    mockLogin,
    completeRegistration,
    logout,
    resetInactivityTimer,
    stopInactivityTimer,
  }
})