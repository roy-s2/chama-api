<template>
  <Card class="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
    <CardContent class="p-5">
      <p class="text-sm opacity-80">Total Savings</p>
      <div class="mt-2 flex items-baseline gap-2">
        <Skeleton v-if="loading" class="h-9 w-32" />
        <span v-else class="text-3xl font-bold">{{ formattedAmount }}</span>
      </div>
      <div class="flex items-center mt-1 text-xs opacity-70">
        <TrendingUp class="w-4 h-4 mr-1" />
        <span>+12% from last cycle</span>
      </div>
    </CardContent>
    <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardContent, Skeleton } from '@/components/ui'
import { TrendingUp } from '@lucide/vue'

const props = defineProps({
  amount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
})

const formattedAmount = computed(() => `KES ${Number(props.amount).toLocaleString()}`)
</script>