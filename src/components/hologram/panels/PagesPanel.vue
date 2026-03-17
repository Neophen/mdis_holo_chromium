<script setup lang="ts">
import { ref, computed } from "vue"
import { useHologramStore } from "@/stores/hologram.store"
import { LayoutGrid, ChevronDown } from "lucide-vue-next"

const store = useHologramStore()
const searchQuery = ref("")
const routesExpanded = ref(true)

const filteredRoutes = computed(() => {
  if (!searchQuery.value) return store.routes
  const query = searchQuery.value.toLowerCase()
  return store.routes.filter(
    (r) => r.path.toLowerCase().includes(query) || r.module.toLowerCase().includes(query),
  )
})

const hasMatch = computed(() => {
  if (!searchQuery.value) return null
  return filteredRoutes.value.length > 0
})

function shortModule(mod: string): string {
  const parts = mod.split(".")
  return parts[parts.length - 1]
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Current route header -->
    <div class="px-4 pt-3 pb-1 flex-shrink-0">
      <h2 class="text-xs text-[var(--ui-text-dimmed)]">Current route</h2>
    </div>

    <!-- Search -->
    <div class="flex items-center px-4 py-1 gap-2 flex-shrink-0">
      <span class="text-[var(--ui-text-dimmed)] text-sm">&crarr;</span>
      <UInput
        v-model="searchQuery"
        placeholder="Search routes..."
        size="xs"
        class="flex-1 font-mono"
      />
    </div>

    <!-- Match status -->
    <div v-if="searchQuery" class="px-4 pb-2 text-[11px] flex-shrink-0">
      <span v-if="hasMatch" class="text-green-500">
        Press Enter to navigate ({{ filteredRoutes.length }} match{{ filteredRoutes.length !== 1 ? 'es' : '' }})
      </span>
      <span v-else class="text-orange-400">
        Press Enter to navigate <span class="text-orange-400">(no match)</span>
      </span>
    </div>

    <!-- Routes list -->
    <div class="flex-1 overflow-auto">
      <div
        class="flex items-center gap-2 px-4 py-2.5 border-y border-[var(--ui-border)] cursor-pointer select-none hover:bg-[var(--ui-bg-accented)]"
        @click="routesExpanded = !routesExpanded"
      >
        <LayoutGrid :size="18" class="text-[var(--ui-text-dimmed)]" />
        <h3 class="text-sm font-semibold flex-1">All Routes</h3>
        <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--ui-primary)]/10 text-[var(--ui-primary)]">
          {{ filteredRoutes.length }}
        </span>
        <ChevronDown
          :size="14"
          class="text-[var(--ui-text-dimmed)] transition-transform"
          :class="{ '-rotate-90': !routesExpanded }"
        />
      </div>

      <div v-if="routesExpanded" class="py-1">
        <div v-if="filteredRoutes.length === 0" class="px-6 py-3 text-xs text-[var(--ui-text-dimmed)]">
          {{ store.routes.length === 0 ? '0 routes registered in your application' : 'No matching routes' }}
        </div>
        <div
          v-for="route in filteredRoutes"
          :key="route.path"
          class="flex items-center px-6 py-1.5 gap-3 cursor-pointer hover:bg-[var(--ui-bg-accented)] transition-colors"
        >
          <span class="font-mono text-xs text-green-500 min-w-[100px]">{{ route.path }}</span>
          <span class="font-mono text-[11px] text-[var(--ui-text-muted)]">{{ shortModule(route.module) }}</span>
          <span class="ml-auto text-[10px] text-[var(--ui-text-dimmed)]">{{ route.file }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
