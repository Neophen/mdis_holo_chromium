<script setup lang="ts">
import { ref, computed } from "vue"
import { useHologramStore } from "@/stores/hologram.store"
import { RefreshCw, Radio } from "lucide-vue-next"
import ComponentTree from "../ComponentTree.vue"
import ComponentInspector from "../ComponentInspector.vue"
import type { HologramTreeNode } from "@/composables/useHologramSocket"

const store = useHologramStore()
const searchQuery = ref("")

function filterTree(node: HologramTreeNode, query: string): HologramTreeNode | null {
  const nameMatches = node.name.toLowerCase().includes(query)
  const filteredChildren = node.children
    .map((child) => filterTree(child, query))
    .filter((child): child is HologramTreeNode => child !== null)

  if (nameMatches || filteredChildren.length > 0) {
    return { ...node, children: nameMatches ? node.children : filteredChildren }
  }
  return null
}

const filteredTree = computed(() => {
  if (!searchQuery.value || !store.activeTree) return store.activeTree
  const query = searchQuery.value.toLowerCase()
  return filterTree(store.activeTree, query)
})

function handleSelect(id: string, node: HologramTreeNode) {
  store.selectComponent(id, node)
}
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
        <!-- Bridge indicator -->
        <span
          v-if="store.bridgeConnected"
          class="flex items-center gap-1 text-[10px] text-green-500 px-1"
          title="Bridge connected - live state active"
        >
          <Radio :size="11" />
          Live
        </span>
        <button
          class="w-6 h-6 flex items-center justify-center rounded text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-accented)]"
          title="Refresh"
          @click="store.bridgeConnected ? store.fetchLiveTree() : store.fetchComponentTree()"
        >
          <RefreshCw :size="13" />
        </button>
      </div>

      <!-- Tree view -->
      <div class="flex-1 overflow-auto py-1">
        <ComponentTree
          v-if="filteredTree"
          :node="filteredTree"
          :selected-id="store.selectedNodeId"
          @select="handleSelect"
        />
        <div v-else class="flex items-center justify-center h-full text-[var(--ui-text-dimmed)] text-xs">
          No components found
        </div>
      </div>
    </div>

    <!-- Right: Inspector -->
    <div class="flex-1 overflow-auto">
      <ComponentInspector
        v-if="store.selectedNodeId"
        :component="store.selectedComponent"
        :component-id="store.selectedNodeId"
        :live-state="store.selectedLiveState"
        :bridge-connected="store.bridgeConnected"
      />
      <div v-else class="flex items-center justify-center h-full text-[var(--ui-text-dimmed)] text-sm">
        Select a component to inspect
      </div>
    </div>
  </div>
</template>
