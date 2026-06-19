<template>
  <div class="px-4 py-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Meetings</h1>
      <Button v-if="authStore.isAdmin" @click="$router.push('/meetings/create')" size="sm">
        New Meeting
      </Button>
    </div>

    <div v-if="meetingStore.loading" class="space-y-3">
      <Skeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-xl" />
    </div>

    <div v-else-if="!meetingStore.meetings.length" class="text-center py-12">
      <Calendar class="mx-auto w-12 h-12 text-muted-foreground mb-3" />
      <p class="text-muted-foreground">No meetings scheduled yet.</p>
      <p v-if="!authStore.isAdmin" class="text-sm text-muted-foreground mt-1">
        Wait for the admin to schedule one.
      </p>
    </div>

    <div v-else class="space-y-3">
      <Card
        v-for="meeting in meetingStore.meetings"
        :key="meeting.id"
        class="cursor-pointer hover:shadow-md transition-shadow"
        @click="$router.push(`/meetings/${meeting.id}`)"
      >
        <CardContent class="p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold">{{ meeting.title }}</p>
              <p class="text-sm text-muted-foreground">
                {{ formatDate(meeting.date) }} at {{ meeting.time }}
              </p>
            </div>
            <Badge :variant="meeting.type === 'online' ? 'secondary' : 'outline'">
              {{ meeting.type === 'online' ? 'Online' : 'Physical' }}
            </Badge>
          </div>
          <p class="mt-1 text-xs text-muted-foreground truncate">
            {{ meeting.type === 'physical' ? meeting.location : meeting.link }}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMeetingStore } from '@/stores/meetings'
import { Button, Skeleton, Card, CardContent, Badge } from '@/components/ui'
import { Calendar } from '@lucide/vue'

const authStore = useAuthStore()
const meetingStore = useMeetingStore()

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-KE', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

onMounted(() => {
  meetingStore.fetchMeetings()
})
</script>
