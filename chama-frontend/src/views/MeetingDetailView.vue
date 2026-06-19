<template>
  <div class="px-4 py-6 space-y-6" v-if="meeting">
    <div>
      <button class="text-sm text-muted-foreground mb-1" @click="$router.back()">← Back</button>
      <h1 class="text-2xl font-bold">{{ meeting.title }}</h1>
    </div>

    <Card>
      <CardContent class="p-4 space-y-3">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-muted-foreground" />
          <span>{{ formatDate(meeting.date) }} at {{ meeting.time }}</span>
        </div>

        <div class="flex items-center gap-2">
          <Badge :variant="meeting.type === 'online' ? 'secondary' : 'outline'">
            {{ meeting.type === 'online' ? 'Online Meeting' : 'Physical Meeting' }}
          </Badge>
        </div>

        <div v-if="meeting.type === 'physical'" class="bg-muted p-3 rounded-lg">
          <p class="text-sm font-medium">📍 Location</p>
          <p class="text-sm mt-1">{{ meeting.location }}</p>
        </div>

        <div v-if="meeting.type === 'online'" class="bg-muted p-3 rounded-lg">
          <p class="text-sm font-medium">🔗 Meeting Link</p>
          <a
            :href="meeting.link"
            target="_blank"
            class="text-sm mt-1 text-primary underline break-all"
          >{{ meeting.link }}</a>
        </div>
      </CardContent>
    </Card>

    <Button variant="outline" class="w-full" @click="addToCalendar">
      <CalendarPlus class="w-4 h-4 mr-2" /> Add to Calendar
    </Button>
  </div>

  <div v-else class="px-4 py-6">
    <Skeleton class="h-8 w-48 mb-4" />
    <Skeleton class="h-32 w-full rounded-xl" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/meetings'
import { Card, CardContent, Badge, Button, Skeleton } from '@/components/ui'
import { Calendar, CalendarPlus } from '@lucide/vue'

const route = useRoute()
const meetingStore = useMeetingStore()
const meeting = ref(null)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-KE', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

onMounted(() => {
  meetingStore.fetchMeetings()
  meeting.value = meetingStore.getMeetingById(route.params.id)
})

function addToCalendar() {
  if (!meeting.value) return
  const start = new Date(`${meeting.value.date}T${meeting.value.time}`)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start.toISOString().replace(/-|:|\.\d+/g, '')}`,
    `DTEND:${end.toISOString().replace(/-|:|\.\d+/g, '')}`,
    `SUMMARY:${meeting.value.title}`,
    `DESCRIPTION:${meeting.value.type === 'online' ? `Link: ${meeting.value.link}` : `Location: ${meeting.value.location}`}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n')
  const blob = new Blob([icsContent], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `meeting-${meeting.value.id}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
