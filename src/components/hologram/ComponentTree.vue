<script setup lang="ts">
import { ref } from "vue"
import { ChevronRight } from "lucide-vue-next"
import type { HologramTreeNode } from "@/composables/useHologramSocket"

const props = defineProps<{
  node: HologramTreeNode
  selectedId: string | null
  depth?: number
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const expanded = ref(true)
const depth = props.depth ?? 0

function toggle() {
  if (props.node.children.length > 0) {
    expanded.value = !expanded.value
  }
}

function shortName(name: string): string {
  const parts = name.split(".")
  return parts[parts.length - 1]
}

const badgeClass: Record<string, string> = {
  page: "bg-green-500/15 text-green-500",
  component: "bg-blue-500/15 text-blue-500",
}
</script>

<template>
  <!-- Root node: just render children -->
  <template v-if="node.type === 'root'">
    <ComponentTree
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :selected-id="selectedId"
      :depth="0"
      @select="emit('select', $event)"
    />
  </template>

  <!-- Regular node -->
  <template v-else>
    <div
      class="flex items-center py-1 pr-2 cursor-pointer transition-colors whitespace-nowrap"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      :class="selectedId === node.id ? 'bg-[var(--ui-primary)]/10' : 'hover:bg-[var(--ui-bg-accented)]'"
      @click="emit('select', node.id)"
    >
      <!-- Toggle arrow -->
      <span
        class="w-4 h-4 flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform"
        :class="{ 'rotate-90': expanded, invisible: node.children.length === 0 }"
        @click.stop="toggle"
      >
        <ChevronRight :size="12" class="text-[var(--ui-text-dimmed)]" />
      </span>

      <!-- Name -->
      <span class="font-mono text-xs">
        <span class="text-[var(--ui-text-dimmed)]">&lt;</span>
        <span class="text-[var(--ui-primary)]">{{ shortName(node.name) }}</span>
        <span class="text-[var(--ui-text-dimmed)]">&gt;</span>
      </span>

      <!-- Badge -->
      <span
        v-if="node.type"
        class="text-[9px] font-medium px-1.5 py-0.5 rounded ml-1.5"
        :class="badgeClass[node.type] ?? ''"
      >
        {{ node.type }}
      </span>
    </div>

    <!-- Children -->
    <div v-if="expanded && node.children.length > 0">
      <ComponentTree
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :depth="depth + 1"
        @select="emit('select', $event)"
      />
    </div>
  </template>
</template>
