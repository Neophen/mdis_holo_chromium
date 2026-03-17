<script setup lang="ts">
import { ref, computed } from "vue"
import { useHologramStore, type TimelineEvent } from "@/stores/hologram.store"
import { Circle, Trash2 } from "lucide-vue-next"

const store = useHologramStore()
const activeCategory = ref("all")

const categories = [
  { id: "all", label: "All Events" },
  { id: "action", label: "Actions" },
  { id: "command", label: "Commands" },
  { id: "navigation", label: "Navigation" },
  { id: "lifecycle", label: "Lifecycle" },
]

const filteredEvents = computed(() => {
  if (activeCategory.value === "all") return store.timelineEvents
  return store.timelineEvents.filter((e) => e.type === activeCategory.value)
})

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
    + "." + String(d.getMilliseconds()).padStart(3, "0")
}

const typeColors: Record<string, string> = {
  action: "bg-green-500/15 text-green-500",
  command: "bg-blue-500/15 text-blue-500",
  navigation: "bg-orange-500/15 text-orange-500",
  lifecycle: "bg-[var(--ui-primary)]/15 text-[var(--ui-primary)]",
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Toolbar -->
    <div class="h-9 flex-shrink-0 bg-[var(--ui-bg-elevated)] border-b border-[var(--ui-border)] flex items-center px-2 gap-2">
      <button
        class="w-6 h-6 flex items-center justify-center rounded transition-colors"
        :class="store.isRecording ? 'text-red-500 animate-pulse' : 'text-[var(--ui-text-dimmed)]'"
        title="Toggle recording"
        @click="store.toggleRecording()"
      >
        <Circle :size="13" fill="currentColor" />
      </button>
      <span class="text-[11px]" :class="store.isRecording ? 'text-red-500' : 'text-[var(--ui-text-dimmed)]'">
        {{ store.isRecording ? 'Recording' : 'Not recording' }}
      </span>
      <button
        class="w-6 h-6 flex items-center justify-center rounded text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-accented)]"
        title="Clear"
        @click="store.clearTimeline()"
      >
        <Trash2 :size="13" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Categories -->
      <div class="w-[180px] flex-shrink-0 border-r border-[var(--ui-border)] py-1">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="px-4 py-2 text-xs cursor-pointer transition-colors"
          :class="activeCategory === cat.id
            ? 'bg-[var(--ui-primary)]/10 text-[var(--ui-primary)] font-medium'
            : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-accented)]'"
          @click="activeCategory = cat.id"
        >
          {{ cat.label }}
        </div>
      </div>

      <!-- Events -->
      <div class="flex-1 overflow-auto">
        <div v-if="filteredEvents.length === 0" class="flex flex-col items-center justify-center h-full gap-2 text-[var(--ui-text-dimmed)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
          </svg>
          <span class="text-sm">No events</span>
        </div>
        <div v-else class="py-1">
          <div
            v-for="(event, i) in filteredEvents"
            :key="i"
            class="flex items-center px-3 py-1.5 gap-2.5 border-b border-[var(--ui-border)] text-[11px]"
          >
            <span class="font-mono text-[10px] text-[var(--ui-text-dimmed)] min-w-[70px]">
              {{ formatTime(event.timestamp) }}
            </span>
            <span
              class="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded min-w-[60px] text-center"
              :class="typeColors[event.type] ?? 'bg-gray-500/15 text-gray-500'"
            >
              {{ event.type }}
            </span>
            <span class="font-mono">{{ event.name }}</span>
            <span class="ml-auto font-mono text-[10px] text-[var(--ui-text-dimmed)]">{{ event.source }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
