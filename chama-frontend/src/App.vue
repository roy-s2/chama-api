<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BottomNav from '@/components/BottomNav.vue'

const authStore = useAuthStore()

function onUserActivity() {
  // Always reset the timer if the user is logged in
  if (authStore && authStore.isAuthenticated && authStore.resetInactivityTimer) {
    authStore.resetInactivityTimer()
  }
}

onMounted(() => {
  window.addEventListener('mousemove', onUserActivity)
  window.addEventListener('keydown', onUserActivity)
  window.addEventListener('click', onUserActivity)
  window.addEventListener('scroll', onUserActivity)
  window.addEventListener('touchstart', onUserActivity)
  // Also reset timer on initial load in case they just logged in
  onUserActivity()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onUserActivity)
  window.removeEventListener('keydown', onUserActivity)
  window.removeEventListener('click', onUserActivity)
  window.removeEventListener('scroll', onUserActivity)
  window.removeEventListener('touchstart', onUserActivity)
})
</script>

<template>
  <div class="relative min-h-screen bg-background font-sans text-foreground antialiased">
    <main class="pb-20">
      <RouterView v-slot="{ Component }">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <BottomNav />
  </div>
</template>

<style>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>