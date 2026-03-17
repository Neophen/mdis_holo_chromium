<script setup lang="ts">
import { ref, computed } from "vue"
import { useHologramStore } from "@/stores/hologram.store"
import ResourceInspector from "../ResourceInspector.vue"

const store = useHologramStore()
const searchQuery = ref("")

const filteredResources = computed(() => {
  if (!searchQuery.value) return store.resourceList
  const query = searchQuery.value.toLowerCase()
  return store.resourceList.filter((r) => r.id.toLowerCase().includes(query))
})

function shortName(id: string): string {
  const parts = id.split(".")
  return parts[parts.length - 1]
}
</script>

<template>
  <div class="flex h-full">
    <!-- Left: List -->
    <div class="w-[45%] min-w-[250px] border-r border-[var(--ui-border)] flex flex-col overflow-hidden">
      <div class="h-9 flex-shrink-0 bg-[var(--ui-bg-elevated)] border-b border-[var(--ui-border)] flex items-center px-2">
        <UInput
          v-model="searchQuery"
          placeholder="Find resources..."
          size="xs"
          class="flex-1"
        />
      </div>

      <div class="flex-1 overflow-auto py-1">
        <div v-if="filteredResources.length === 0" class="flex items-center justify-center h-full text-[var(--ui-text-dimmed)] text-xs">
          No resources found
        </div>
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="flex items-center px-3 py-1.5 cursor-pointer transition-colors"
          :class="store.selectedResourceId === resource.id
            ? 'bg-[var(--ui-primary)]/10'
            : 'hover:bg-[var(--ui-bg-accented)]'"
          @click="store.selectResource(resource.id)"
        >
          <span class="font-mono text-xs text-orange-400">{{ shortName(resource.id) }}</span>
          <span class="ml-auto text-[10px] text-[var(--ui-text-dimmed)]">
            {{ resource.attributes.length }} attrs, {{ resource.relationships.length }} rels
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Inspector -->
    <div class="flex-1 overflow-auto">
      <ResourceInspector
        v-if="store.selectedResource && store.selectedResourceId"
        :resource="store.selectedResource"
        :resource-id="store.selectedResourceId"
      />
      <div v-else class="flex items-center justify-center h-full text-[var(--ui-text-dimmed)] text-sm">
        Select a resource to inspect
      </div>
    </div>
  </div>
</template>
