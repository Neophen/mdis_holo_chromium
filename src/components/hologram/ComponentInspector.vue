<script setup lang="ts">
import { computed } from "vue"
import { useHologramStore } from "@/stores/hologram.store"
import { ExternalLink } from "lucide-vue-next"
import type { HologramComponent, LiveStateResponse, TypedValue, HologramAction, HologramCommand, HologramFunction } from "@/composables/useHologramSocket"
import InspectorSection from "./InspectorSection.vue"
import StateValue from "./StateValue.vue"
import LiveStateValue from "./LiveStateValue.vue"

const props = defineProps<{
  component: HologramComponent | null
  componentId: string
  liveState: LiveStateResponse | null
  bridgeConnected: boolean
}>()

const store = useHologramStore()

function shortName(id: string): string {
  const parts = id.split(".")
  return parts[parts.length - 1]
}

// Use live state's metadata when available, fall back to static component data
const actions = computed((): HologramAction[] => {
  return props.liveState?.actions ?? props.component?.actions ?? []
})

const commands = computed((): HologramCommand[] => {
  return props.liveState?.commands ?? props.component?.commands ?? []
})

const functions = computed((): HologramFunction[] => {
  return props.liveState?.functions ?? props.component?.functions ?? []
})

const file = computed(() => props.liveState?.file ?? props.component?.file)
const line = computed(() => props.liveState?.line ?? props.component?.line)

const hasLiveState = computed(() => {
  return props.liveState?.state && Object.keys(props.liveState.state).length > 0
})

const hasEmittedContext = computed(() => {
  return props.liveState?.emitted_context && Object.keys(props.liveState.emitted_context).length > 0
})

const hasInstanceProps = computed(() => {
  return props.liveState?.instance_props && Object.keys(props.liveState.instance_props).length > 0
})

function handleStateEdit(key: string, value: TypedValue) {
  const cid = props.liveState?.cid ?? store.selectedCid ?? props.componentId
  store.editState(cid, [key], value)
}

function openFile() {
  if (file.value) {
    store.openInEditor(file.value, line.value)
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-[var(--ui-bg-elevated)] border-b border-[var(--ui-border)] px-3 py-2 flex items-center gap-2">
      <span class="font-mono text-sm">
        <span class="text-[var(--ui-text-dimmed)]">&lt;</span>
        <span class="text-[var(--ui-primary)]">{{ shortName(liveState?.module ?? componentId) }}</span>
        <span class="text-[var(--ui-text-dimmed)]">&gt;</span>
      </span>
      <span
        v-if="liveState?.cid"
        class="text-[9px] font-mono text-[var(--ui-text-dimmed)] bg-[var(--ui-bg-accented)] px-1.5 py-0.5 rounded"
      >
        cid: {{ liveState.cid }}
      </span>
    </div>

    <!-- Instance props (for loop-rendered components) -->
    <InspectorSection
      v-if="hasInstanceProps"
      title="props (instance)"
      :default-expanded="true"
    >
      <StateValue
        v-for="[key, val] in Object.entries(liveState!.instance_props!)"
        :key="key"
        :name="key"
        :value="val"
      />
    </InspectorSection>

    <!-- Live state from bridge (typed values with editing) -->
    <InspectorSection
      v-if="hasLiveState"
      title="state (live)"
      :default-expanded="true"
    >
      <LiveStateValue
        v-for="[key, val] in Object.entries(liveState!.state)"
        :key="key"
        :name="key"
        :value="val"
        :editable="bridgeConnected"
        @edit="handleStateEdit(key, $event)"
      />
    </InspectorSection>

    <!-- Emitted context from bridge -->
    <InspectorSection
      v-if="hasEmittedContext"
      title="emitted context"
      :default-expanded="true"
    >
      <LiveStateValue
        v-for="[key, val] in Object.entries(liveState!.emitted_context)"
        :key="key"
        :name="key"
        :value="val"
      />
    </InspectorSection>

    <!-- Static props from component metadata -->
    <InspectorSection
      v-if="component?.liveProps && Object.keys(component.liveProps).length > 0"
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

    <InspectorSection
      v-else-if="(liveState?.props ?? component?.props ?? []).length > 0"
      title="props"
      :default-expanded="true"
    >
      <div
        v-for="prop in (liveState?.props ?? component?.props ?? [])"
        :key="prop.name"
        class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed"
      >
        <span class="text-pink-400 mr-2">{{ prop.name }}</span>
        <span class="text-[var(--ui-text-dimmed)] mr-2">:</span>
        <span class="text-[var(--ui-text-muted)]">{{ prop.type }}</span>
        <span v-if="prop.required" class="text-red-400 text-[9px] ml-1">required</span>
      </div>
    </InspectorSection>

    <!-- Fallback: server-side state (when no bridge) -->
    <InspectorSection
      v-if="!hasLiveState && component?.state && Object.keys(component.state).length > 0"
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

    <!-- State keys fallback -->
    <InspectorSection
      v-else-if="!hasLiveState && component?.stateKeys && component.stateKeys.length > 0"
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
      v-if="actions.length > 0"
      title="actions"
      :default-expanded="true"
    >
      <div
        v-for="action in actions"
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
      v-if="commands.length > 0"
      title="commands"
      :default-expanded="true"
    >
      <div
        v-for="cmd in commands"
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
      v-if="functions.length > 0"
      title="functions"
      :default-expanded="false"
    >
      <div
        v-for="fn in functions"
        :key="fn.name"
        class="flex items-baseline py-0.5 font-mono text-[11px] leading-relaxed"
      >
        <span class="text-[var(--ui-text-muted)] italic mr-2">{{ fn.name }}/{{ fn.arity }}</span>
        <span class="ml-auto text-[9px] text-[var(--ui-text-dimmed)]">L{{ fn.line }}</span>
      </div>
    </InspectorSection>

    <!-- File info (clickable to open in editor) -->
    <div
      v-if="file"
      class="px-3 py-2 border-t border-[var(--ui-border)] text-[10px] text-[var(--ui-text-dimmed)] font-mono flex items-center gap-1.5 cursor-pointer hover:text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-accented)]"
      title="Open in editor"
      @click="openFile"
    >
      <ExternalLink :size="10" />
      {{ file }}{{ line ? `:${line}` : '' }}
    </div>

    <!-- Empty state -->
    <div
      v-if="!hasLiveState && !component"
      class="flex items-center justify-center h-32 text-[var(--ui-text-dimmed)] text-xs"
    >
      {{ bridgeConnected ? 'No live state available' : 'Connect bridge for live state' }}
    </div>
  </div>
</template>
