<script setup lang="ts">
import { ref } from "vue"
import { ChevronDown } from "lucide-vue-next"

const props = defineProps<{
  title: string
  defaultExpanded?: boolean
}>()

const expanded = ref(props.defaultExpanded ?? true)
</script>

<template>
  <div class="border-b border-[var(--ui-border)]">
    <div
      class="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer select-none text-[11px] font-semibold text-[var(--ui-text-muted)] lowercase hover:bg-[var(--ui-bg-accented)]"
      @click="expanded = !expanded"
    >
      <ChevronDown
        :size="12"
        class="text-[var(--ui-text-dimmed)] transition-transform"
        :class="{ '-rotate-90': !expanded }"
      />
      {{ title }}
    </div>
    <div v-if="expanded" class="px-3 pb-2 pl-6">
      <slot />
    </div>
  </div>
</template>
