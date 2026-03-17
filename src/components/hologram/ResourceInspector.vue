<script setup lang="ts">
import type { HologramResource } from "@/composables/useHologramSocket"
import InspectorSection from "./InspectorSection.vue"

const props = defineProps<{
  resource: HologramResource
  resourceId: string
}>()

function shortName(id: string): string {
  const parts = id.split(".")
  return parts[parts.length - 1]
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-[var(--ui-bg-elevated)] border-b border-[var(--ui-border)] px-3 py-2 flex items-center gap-2">
      <span class="font-mono text-sm text-orange-400">{{ shortName(resourceId) }}</span>
    </div>

    <!-- Attributes -->
    <InspectorSection
      v-if="resource.attributes && resource.attributes.length > 0"
      title="attributes"
      :default-expanded="true"
    >
      <div
        v-for="attr in resource.attributes"
        :key="attr.name"
        class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed"
      >
        <span class="text-pink-400 mr-2">{{ attr.name }}</span>
        <span class="text-[var(--ui-text-dimmed)] mr-2">:</span>
        <span class="text-yellow-400">{{ attr.type }}</span>
        <span v-if="attr.primaryKey" class="text-[9px] text-blue-400 ml-1.5 font-sans font-medium">PK</span>
        <span class="ml-auto text-[9px] text-[var(--ui-text-dimmed)]">L{{ attr.line }}</span>
      </div>
    </InspectorSection>

    <!-- Relationships -->
    <InspectorSection
      v-if="resource.relationships && resource.relationships.length > 0"
      title="relationships"
      :default-expanded="true"
    >
      <div
        v-for="rel in resource.relationships"
        :key="rel.name"
        class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed"
      >
        <span class="text-pink-400 mr-2">{{ rel.name }}</span>
        <span class="text-[var(--ui-text-dimmed)] mr-2">:</span>
        <span class="text-green-400 mr-1.5">{{ rel.type }}</span>
        <span class="text-[var(--ui-text-muted)]">{{ rel.destination }}</span>
        <span class="ml-auto text-[9px] text-[var(--ui-text-dimmed)]">L{{ rel.line }}</span>
      </div>
    </InspectorSection>

    <!-- File info -->
    <div class="px-3 py-2 border-t border-[var(--ui-border)] text-[10px] text-[var(--ui-text-dimmed)] font-mono">
      {{ resource.file }}:{{ resource.line }}
    </div>
  </div>
</template>
