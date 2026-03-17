<script setup lang="ts">
import { ref } from "vue"
import { ChevronDown } from "lucide-vue-next"
import type { HologramComponent } from "@/composables/useHologramSocket"
import InspectorSection from "./InspectorSection.vue"
import StateValue from "./StateValue.vue"

const props = defineProps<{
  component: HologramComponent
  componentId: string
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
      <span class="font-mono text-sm">
        <span class="text-[var(--ui-text-dimmed)]">&lt;</span>
        <span class="text-[var(--ui-primary)]">{{ shortName(componentId) }}</span>
        <span class="text-[var(--ui-text-dimmed)]">&gt;</span>
      </span>
    </div>

    <!-- Live props (actual values) -->
    <InspectorSection
      v-if="component.liveProps && Object.keys(component.liveProps).length > 0"
      title="props"
      :default-expanded="true"
    >
      <StateValue
        v-for="[key, val] in Object.entries(component.liveProps)"
        :key="key"
        :name="key"
        :value="val"
      />
    </InspectorSection>

    <!-- Static props (type declarations, fallback) -->
    <InspectorSection
      v-else-if="component.props && component.props.length > 0"
      title="props"
      :default-expanded="true"
    >
      <div
        v-for="prop in component.props"
        :key="prop.name"
        class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed"
      >
        <span class="text-pink-400 mr-2">{{ prop.name }}</span>
        <span class="text-[var(--ui-text-dimmed)] mr-2">:</span>
        <span class="text-[var(--ui-text-muted)]">{{ prop.type }}</span>
        <span v-if="prop.required" class="text-red-400 text-[9px] ml-1">required</span>
      </div>
    </InspectorSection>

    <!-- Live state -->
    <InspectorSection
      v-if="component.state && Object.keys(component.state).length > 0"
      title="state"
      :default-expanded="true"
    >
      <StateValue
        v-for="[key, val] in Object.entries(component.state)"
        :key="key"
        :name="key"
        :value="val"
      />
    </InspectorSection>

    <!-- State keys (fallback when no live state) -->
    <InspectorSection
      v-else-if="component.stateKeys && component.stateKeys.length > 0"
      title="state"
      :default-expanded="true"
    >
      <div
        v-for="key in component.stateKeys"
        :key="key"
        class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed"
      >
        <span class="text-pink-400 mr-2">{{ key }}</span>
        <span class="text-[var(--ui-text-dimmed)] mr-2">:</span>
        <span class="text-[var(--ui-text-muted)]">unknown</span>
      </div>
    </InspectorSection>

    <!-- Actions -->
    <InspectorSection
      v-if="component.actions && component.actions.length > 0"
      title="actions"
      :default-expanded="true"
    >
      <div
        v-for="action in component.actions"
        :key="action.name"
        class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed"
      >
        <span class="text-green-400 mr-2">{{ action.name }}</span>
        <span v-if="action.params.length > 0" class="text-[var(--ui-text-dimmed)]">
          ({{ action.params.join(', ') }})
        </span>
        <span class="ml-auto text-[9px] text-[var(--ui-text-dimmed)]">L{{ action.line }}</span>
      </div>
    </InspectorSection>

    <!-- Commands -->
    <InspectorSection
      v-if="component.commands && component.commands.length > 0"
      title="commands"
      :default-expanded="true"
    >
      <div
        v-for="cmd in component.commands"
        :key="cmd.name"
        class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed"
      >
        <span class="text-blue-400 mr-2">{{ cmd.name }}</span>
        <span v-if="cmd.params.length > 0" class="text-[var(--ui-text-dimmed)]">
          ({{ cmd.params.join(', ') }})
        </span>
        <span class="ml-auto text-[9px] text-[var(--ui-text-dimmed)]">L{{ cmd.line }}</span>
      </div>
    </InspectorSection>

    <!-- Functions -->
    <InspectorSection
      v-if="component.functions && component.functions.length > 0"
      title="functions"
      :default-expanded="false"
    >
      <div
        v-for="fn in component.functions"
        :key="fn.name"
        class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed"
      >
        <span class="text-[var(--ui-text-muted)] italic mr-2">{{ fn.name }}/{{ fn.arity }}</span>
        <span class="ml-auto text-[9px] text-[var(--ui-text-dimmed)]">L{{ fn.line }}</span>
      </div>
    </InspectorSection>

    <!-- File info -->
    <div class="px-3 py-2 border-t border-[var(--ui-border)] text-[10px] text-[var(--ui-text-dimmed)] font-mono">
      {{ component.file }}:{{ component.line }}
    </div>
  </div>
</template>
