<template>
  <div class="flex items-center justify-between py-3 border-b last:border-0">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-full bg-muted">
        <ArrowDownRight
          v-if="tx.type === 'contribution'"
          class="w-4 h-4 text-green-600"
        />
        <ArrowUpRight v-else class="w-4 h-4 text-red-600" />
      </div>
      <div>
        <p class="font-medium text-sm">{{ tx.description }}</p>
        <p class="text-xs text-muted-foreground">{{ formatDate(tx.timestamp) }}</p>
      </div>
    </div>
    <span
      :class="
        tx.type === 'contribution'
          ? 'text-green-600 font-medium'
          : 'text-red-600 font-medium'
      "
    >
      KES {{ tx.amount.toLocaleString() }}
    </span>
  </div>
</template>

<script setup>
import { ArrowDownRight, ArrowUpRight } from '@lucide/vue'

const props = defineProps({ tx: Object })

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
  })
</script>