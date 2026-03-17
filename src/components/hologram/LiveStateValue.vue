<script setup lang="ts">
import { ref, computed } from "vue"
import { ChevronRight, Pencil, Check, X } from "lucide-vue-next"
import type { TypedValue } from "@/composables/useHologramSocket"

const props = defineProps<{
  name: string
  value: TypedValue
  depth?: number
  editable?: boolean
}>()

const emit = defineEmits<{
  edit: [value: TypedValue]
}>()

const expanded = ref(false)
const editing = ref(false)
const editInput = ref("")
const depth = props.depth ?? 0

const isExpandable = computed(() => {
  const t = props.value?._t
  return t === "map" || t === "list" || t === "tuple" || t === "struct"
})

const childEntries = computed((): [string, TypedValue][] => {
  const val = props.value
  if (!val) return []

  if (val._t === "list" || val._t === "tuple") {
    return (val.v as TypedValue[]).map((v, i) => [String(i), v])
  }
  if (val._t === "map" || val._t === "struct") {
    return Object.entries(val.v as Record<string, TypedValue>)
  }
  return []
})

function formatValue(val: TypedValue): string {
  if (!val) return "nil"
  switch (val._t) {
    case "nil": return "nil"
    case "boolean": return val.v ? "true" : "false"
    case "atom": return `:${val.v}`
    case "integer": return String(val.v)
    case "float": return String(val.v)
    case "string": return `"${val.v}"`
    case "pid": return `#PID<${val.v}>`
    case "function": return String(val.v)
    case "list": return `List (${(val.v as unknown[]).length})`
    case "tuple": return `Tuple (${(val.v as unknown[]).length})`
    case "map": return `Map (${Object.keys(val.v as object).length})`
    case "struct": return `%${val.module ?? "Struct"}{}`
    default: return String(val.v)
  }
}

function typeColor(val: TypedValue): string {
  if (!val) return "text-[var(--ui-text-dimmed)]"
  switch (val._t) {
    case "string": return "text-green-400"
    case "integer":
    case "float": return "text-blue-400"
    case "boolean": return "text-orange-400"
    case "atom": return "text-cyan-400"
    case "nil": return "text-[var(--ui-text-dimmed)]"
    default: return "text-[var(--ui-text-muted)]"
  }
}

function startEdit() {
  const val = props.value
  if (val._t === "string") editInput.value = String(val.v)
  else if (val._t === "integer" || val._t === "float") editInput.value = String(val.v)
  else if (val._t === "boolean") editInput.value = val.v ? "true" : "false"
  else if (val._t === "atom") editInput.value = String(val.v)
  else editInput.value = String(val.v)
  editing.value = true
}

function confirmEdit() {
  const original = props.value
  let newValue: TypedValue

  switch (original._t) {
    case "integer":
      newValue = { _t: "integer", v: parseInt(editInput.value, 10) }
      break
    case "float":
      newValue = { _t: "float", v: parseFloat(editInput.value) }
      break
    case "boolean":
      newValue = { _t: "boolean", v: editInput.value === "true" }
      break
    case "atom":
      newValue = { _t: "atom", v: editInput.value }
      break
    case "string":
      newValue = { _t: "string", v: editInput.value }
      break
    default:
      newValue = { _t: original._t, v: editInput.value }
  }

  emit("edit", newValue)
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}

const isScalar = computed(() => {
  const t = props.value?._t
  return t === "string" || t === "integer" || t === "float" || t === "boolean" || t === "atom" || t === "nil"
})
</script>

<template>
  <div>
    <div
      class="flex items-center py-0.5 font-mono text-[11px] leading-relaxed group"
      :class="isExpandable ? 'cursor-pointer hover:bg-[var(--ui-bg-accented)]' : ''"
      :style="{ paddingLeft: `${depth * 12 + 4}px` }"
      @click="isExpandable && (expanded = !expanded)"
    >
      <!-- Expand arrow -->
      <span
        v-if="isExpandable"
        class="w-3 h-3 flex items-center justify-center flex-shrink-0 mr-0.5 transition-transform"
        :class="{ 'rotate-90': expanded }"
      >
        <ChevronRight :size="10" class="text-[var(--ui-text-dimmed)]" />
      </span>
      <span v-else class="w-3 h-3 flex-shrink-0 mr-0.5" />

      <!-- Key name -->
      <span class="text-pink-400 mr-1">{{ name }}</span>
      <span class="text-[var(--ui-text-dimmed)] mr-1">:</span>

      <!-- Editing mode -->
      <template v-if="editing">
        <input
          v-model="editInput"
          class="bg-[var(--ui-bg-accented)] border border-[var(--ui-border)] rounded px-1 text-[11px] font-mono text-[var(--ui-text)] w-32 outline-none focus:border-[var(--ui-primary)]"
          @keydown.enter="confirmEdit"
          @keydown.escape="cancelEdit"
          @click.stop
        />
        <button
          class="ml-1 text-green-500 hover:text-green-400"
          title="Confirm"
          @click.stop="confirmEdit"
        >
          <Check :size="10" />
        </button>
        <button
          class="ml-0.5 text-red-500 hover:text-red-400"
          title="Cancel"
          @click.stop="cancelEdit"
        >
          <X :size="10" />
        </button>
      </template>

      <!-- Display mode -->
      <template v-else>
        <!-- Type badge -->
        <span class="text-[9px] text-[var(--ui-text-dimmed)] mr-1.5 opacity-60">
          {{ value?._t }}
        </span>

        <!-- Value -->
        <span :class="typeColor(value)">
          {{ formatValue(value) }}
        </span>

        <!-- Edit button for scalar values -->
        <button
          v-if="editable && isScalar && value?._t !== 'nil'"
          class="ml-1.5 opacity-0 group-hover:opacity-100 text-[var(--ui-text-dimmed)] hover:text-[var(--ui-primary)]"
          title="Edit value"
          @click.stop="startEdit"
        >
          <Pencil :size="9" />
        </button>
      </template>
    </div>

    <!-- Expanded children -->
    <template v-if="expanded && isExpandable">
      <LiveStateValue
        v-for="[key, val] in childEntries"
        :key="key"
        :name="value._t === 'list' || value._t === 'tuple' ? `[${key}]` : key"
        :value="val"
        :depth="depth + 1"
        :editable="editable"
        @edit="emit('edit', $event)"
      />
    </template>
  </div>
</template>
