<script setup lang="ts">
import type { ConnectionStatus } from "@/composables/useHologramSocket"

defineProps<{
  status: ConnectionStatus
}>()

const statusConfig = {
  connected: { label: "Connected", color: "text-green-500" },
  connecting: { label: "Connecting...", color: "text-yellow-500" },
  disconnected: { label: "Disconnected", color: "text-[var(--ui-text-dimmed)]" },
  error: { label: "Connection error", color: "text-red-500" },
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <span class="relative flex h-2 w-2">
      <span
        v-if="status === 'connected'"
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
      />
      <span
        class="relative inline-flex rounded-full h-2 w-2"
        :class="{
          'bg-green-500': status === 'connected',
          'bg-yellow-500': status === 'connecting',
          'bg-[var(--ui-text-dimmed)]': status === 'disconnected',
          'bg-red-500': status === 'error',
        }"
      />
    </span>
    <span class="text-[11px]" :class="statusConfig[status].color">
      {{ statusConfig[status].label }}
    </span>
  </div>
</template>
