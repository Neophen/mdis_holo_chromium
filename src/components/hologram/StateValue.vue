<script setup lang="ts">
import { ref } from "vue"
import { ChevronRight } from "lucide-vue-next"

const props = defineProps<{
  name: string
  value: unknown
  depth?: number
}>()

const expanded = ref(false)
const depth = props.depth ?? 0

function isExpandable(val: unknown): val is Record<string, unknown> | unknown[] {
  return (typeof val === "object" && val !== null)
}

function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}

function entries(val: unknown): [string, unknown][] {
  if (Array.isArray(val)) {
    return val.map((v, i) => [String(i), v])
  }
  return Object.entries(val as Record<string, unknown>)
}

function formatValue(val: unknown): string {
  if (val === null) return "nil"
  if (val === undefined) return "nil"
  if (typeof val === "string") return `"${val}"`
  if (typeof val === "boolean") return val ? "true" : "false"
  return String(val)
}

function typeLabel(val: unknown): string {
  if (val === null || val === undefined) return "nil"
  if (Array.isArray(val)) return `List (${val.length})`
  if (typeof val === "object") {
    const v = val as Record<string, unknown>
    if (v.__struct__) return `%${v.__struct__}{}`
    return `Map (${Object.keys(v).length})`
  }
  return typeof val
}
</script>

<template>
  <div>
    <div
      class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed cursor-pointer hover:bg-[var(--ui-bg-accented)]"
      :style="{ paddingLeft: `${depth * 12 + 4}px` }"
      @click="expanded = !expanded"
    >
      <!-- Expand arrow for objects/arrays -->
      <span
        v-if="isExpandable(value)"
        class="w-3 h-3 flex items-center justify-center flex-shrink-0 mr-0.5 transition-transform"
        :class="{ 'rotate-90': expanded }"
      >
        <ChevronRight :size="10" class="text-[var(--ui-text-dimmed)]" />
      </span>
      <span v-else class="w-3 h-3 flex-shrink-0 mr-0.5" />

      <span class="text-pink-400 mr-1">{{ name }}</span>
      <span class="text-[var(--ui-text-dimmed)] mr-1">:</span>

      <template v-if="isExpandable(value) && !expanded">
        <span class="text-[var(--ui-text-muted)]">{{ typeLabel(value) }}</span>
      </template>
      <template v-else-if="!isExpandable(value)">
        <span
          :class="{
            'text-green-400': typeof value === 'string',
            'text-blue-400': typeof value === 'number',
            'text-orange-400': typeof value === 'boolean',
            'text-[var(--ui-text-dimmed)]': value === null || value === undefined,
          }"
        >{{ formatValue(value) }}</span>
      </template>
    </div>

    <!-- Expanded children -->
    <template v-if="expanded && isExpandable(value)">
      <StateValue
        v-for="[key, val] in entries(value)"
        :key="key"
        :name="isArray(value) ? `[${key}]` : key"
        :value="val"
        :depth="depth + 1"
      />
    </template>
  </div>
</template>
