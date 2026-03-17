<script setup lang="ts">
import { ref } from "vue"
import { useHologramStore } from "@/stores/hologram.store"
import {
  Info,
  Network,
  LayoutGrid,
  Database,
  Activity,
} from "lucide-vue-next"
import OverviewPanel from "./panels/OverviewPanel.vue"
import ComponentsPanel from "./panels/ComponentsPanel.vue"
import PagesPanel from "./panels/PagesPanel.vue"
import ResourcesPanel from "./panels/ResourcesPanel.vue"
import TimelinePanel from "./panels/TimelinePanel.vue"
import ConnectionBadge from "./ConnectionBadge.vue"

type PanelName = "overview" | "components" | "pages" | "resources" | "timeline"

const activePanel = ref<PanelName>("overview")
const store = useHologramStore()

const navItems = [
  { name: "overview" as const, icon: Info, label: "Overview" },
  { name: "components" as const, icon: Network, label: "Components" },
  { name: "pages" as const, icon: LayoutGrid, label: "Pages & Routes" },
  { name: "resources" as const, icon: Database, label: "Resources" },
  { name: "timeline" as const, icon: Activity, label: "Timeline" },
]
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[var(--ui-bg)]">
    <!-- Sidebar -->
    <nav class="w-12 flex-shrink-0 border-r border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] flex flex-col items-center py-2 gap-1">
      <!-- Logo -->
      <div class="pb-2 mb-1 border-b border-[var(--ui-border)] w-full flex justify-center">
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="var(--ui-primary)" stroke-width="6"/>
          <polygon points="50,25 75,37.5 75,62.5 50,75 25,62.5 25,37.5" fill="var(--ui-primary)" opacity="0.3"/>
          <polygon points="50,40 62,46 62,58 50,64 38,58 38,46" fill="var(--ui-primary)"/>
        </svg>
      </div>

      <!-- Nav buttons -->
      <UTooltip
        v-for="item in navItems"
        :key="item.name"
        :text="item.label"
        :popper="{ placement: 'right' }"
      >
        <button
          class="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
          :class="activePanel === item.name
            ? 'text-[var(--ui-primary)] bg-[var(--ui-primary)]/10'
            : 'text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-accented)]'"
          @click="activePanel = item.name"
        >
          <component :is="item.icon" :size="18" />
        </button>
      </UTooltip>
    </nav>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Connection bar -->
      <div class="h-7 flex-shrink-0 bg-[var(--ui-bg-elevated)] border-b border-[var(--ui-border)] flex items-center px-3">
        <ConnectionBadge :status="store.status" />
      </div>

      <!-- Active panel -->
      <div class="flex-1 overflow-hidden">
        <OverviewPanel v-if="activePanel === 'overview'" />
        <ComponentsPanel v-else-if="activePanel === 'components'" />
        <PagesPanel v-else-if="activePanel === 'pages'" />
        <ResourcesPanel v-else-if="activePanel === 'resources'" />
        <TimelinePanel v-else-if="activePanel === 'timeline'" />
      </div>
    </div>
  </div>
</template>
