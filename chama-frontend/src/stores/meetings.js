import { defineStore } from 'pinia'
import { ref } from 'vue'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

export const useMeetingStore = defineStore('meetings', () => {
  const meetings = ref([])
  const loading = ref(false)

  function fetchMeetings() {
    loading.value = true
    try {
      const stored = localStorage.getItem('chama_meetings')
      meetings.value = stored ? JSON.parse(stored) : []
    } catch {
      meetings.value = []
    }
    loading.value = false
  }

  function saveMeetings() {
    localStorage.setItem('chama_meetings', JSON.stringify(meetings.value))
  }

  function createMeeting({ title, date, time, type, location, link }) {
    const newMeeting = {
      id: generateId(),
      title,
      date,
      time,
      type,
      location: type === 'physical' ? location : null,
      link: type === 'online' ? link : null,
      createdBy: new Date().toISOString(),
    }
    meetings.value.push(newMeeting)
    saveMeetings()
    return newMeeting
  }

  function getMeetingById(id) {
    return meetings.value.find(m => m.id === id) || null
  }

  fetchMeetings()

  return {
    meetings,
    loading,
    fetchMeetings,
    createMeeting,
    getMeetingById,
  }
})
