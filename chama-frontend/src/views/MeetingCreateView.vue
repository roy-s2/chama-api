<template>
  <div class="px-4 py-6 space-y-6">
    <div>
      <button class="text-sm text-muted-foreground mb-1" @click="$router.back()">← Back</button>
      <h1 class="text-2xl font-bold">Schedule a Meeting</h1>
    </div>

    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium">Title</label>
        <Input v-model="title" placeholder="e.g. Monthly review" class="mt-1" :disabled="submitting" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-sm font-medium">Date</label>
          <input
            v-model="date"
            type="date"
            class="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm"
            :disabled="submitting"
          />
        </div>
        <div>
          <label class="text-sm font-medium">Time</label>
          <input
            v-model="time"
            type="time"
            class="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm"
            :disabled="submitting"
          />
        </div>
      </div>

      <div>
        <label class="text-sm font-medium">Meeting Type</label>
        <div class="flex gap-4 mt-2">
          <label class="flex items-center gap-2">
            <input type="radio" v-model="type" value="physical" :disabled="submitting" />
            <span>Physical</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" v-model="type" value="online" :disabled="submitting" />
            <span>Online</span>
          </label>
        </div>
      </div>

      <div v-if="type === 'physical'">
        <label class="text-sm font-medium">Location / Venue</label>
        <Input v-model="location" placeholder="e.g. Muthoni's house, Kimathi St" class="mt-1" :disabled="submitting" />
      </div>
      <div v-if="type === 'online'">
        <label class="text-sm font-medium">Meeting Link</label>
        <Input v-model="link" placeholder="e.g. https://meet.google.com/abc" class="mt-1" :disabled="submitting" />
      </div>

      <Button class="w-full" @click="submit" :disabled="!canSubmit || submitting">
        {{ submitting ? 'Creating...' : 'Create Meeting' }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMeetingStore } from '@/stores/meetings'
import { Button, Input } from '@/components/ui'

const router = useRouter()
const meetingStore = useMeetingStore()

const title = ref('')
const date = ref('')
const time = ref('')
const type = ref('physical')
const location = ref('')
const link = ref('')
const submitting = ref(false)

const canSubmit = computed(() => {
  if (!title.value.trim()) return false
  if (!date.value || !time.value) return false
  if (type.value === 'physical' && !location.value.trim()) return false
  if (type.value === 'online' && !link.value.trim()) return false
  return true
})

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    meetingStore.createMeeting({
      title: title.value.trim(),
      date: date.value,
      time: time.value,
      type: type.value,
      location: location.value.trim(),
      link: link.value.trim(),
    })
    router.push('/meetings')
  } catch (e) {
    alert('Failed to create meeting.')
  } finally {
    submitting.value = false
  }
}
</script>
