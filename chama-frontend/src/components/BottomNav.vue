<template>
  <nav class="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-50">
    <div class="flex justify-around py-2">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs transition-colors"
        active-class="text-primary"
        exact-active-class="text-primary"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { LayoutDashboard, Landmark, Calendar, User } from '@lucide/vue'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/loans', icon: Landmark, label: 'Loans' },
  { to: '/meetings', icon: Calendar, label: 'Meetings' },
  { to: '/profile', icon: User, label: 'Profile' },
]
</script>