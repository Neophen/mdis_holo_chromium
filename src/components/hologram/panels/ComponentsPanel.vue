<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useHologramStore } from "@/stores/hologram.store"
import { RefreshCw } from "lucide-vue-next"
import ComponentTree from "../ComponentTree.vue"
import ComponentInspector from "../ComponentInspector.vue"
import type { HologramTreeNode } from "@/composables/useHologramSocket"

const store = useHologramStore()
const searchQuery = ref("")

function flattenTree(node: HologramTreeNode | null): HologramTreeNode[] {
  if (!node) return []
  const result: HologramTreeNode[] = []
  if (node.type !== "root") result.push(node)
  for (const child of node.children) {
    result.push(...flattenTree(child))
  }
  return result
}

const filteredTree = computed(() => {
  if (!searchQuery.value || !store.componentTree) return store.componentTree
  const query = searchQuery.value.toLowerCase()
  const allNodes = flattenTree(store.componentTree)
  const matching = allNodes.filter((n) => n.name.toLowerCase().includes(query))
  if (matching.length === 0) return store.componentTree
  return {
    ...store.componentTree,
    children: matching,
  } as HologramTreeNode
})
</script>

<template>
  <div class="flex h-full">
    <!-- Left: Tree -->
    <div class="w-[45%] min-w-[250px] border-r border-[var(--ui-border)] flex flex-col overflow-hidden">
      <!-- Toolbar -->
      <div class="h-9 flex-shrink-0 bg-[var(--ui-bg-elevated)] border-b border-[var(--ui-border)] flex items-center px-2 gap-1.5">
        <UInput
          v-model="searchQuery"
          placeholder="Find components..."
          size="xs"
          class="flex-1"
          :ui="{ base: 'h-6' }"
        />
        <button
          class="w-6 h-6 flex items-center justify-center rounded text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-accented)]"
          title="Refresh"
          @click="store.fetchComponentTree()"
        >
          <RefreshCw :size="13" />
        </button>
      </div>

      <!-- Tree view -->
      <div class="flex-1 overflow-auto py-1">
        <ComponentTree
          v-if="filteredTree"
          :node="filteredTree"
          :selected-id="store.selectedComponentId"
          @select="store.selectComponent($event)"
        />
        <div v-else class="flex items-center justify-center h-full text-[var(--ui-text-dimmed)] text-xs">
          No components found
        </div>
      </div>
    </div>

    <!-- Right: Inspector -->
    <div class="flex-1 overflow-auto">
      <ComponentInspector
        v-if="store.selectedComponent && store.selectedComponentId"
        :component="store.selectedComponent"
        :component-id="store.selectedComponentId"
      />
      <div v-else class="flex items-center justify-center h-full text-[var(--ui-text-dimmed)] text-sm">
        Select a component to inspect
      </div>
    </div>
  </div>
</template>
