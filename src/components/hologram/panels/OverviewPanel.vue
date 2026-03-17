<script setup lang="ts">
import { useHologramStore } from "@/stores/hologram.store"
import { LayoutGrid, Network, Database } from "lucide-vue-next"

const store = useHologramStore()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-10">
    <!-- Hero -->
    <div class="flex flex-col items-center gap-4">
      <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="var(--ui-primary)" stroke-width="4"/>
        <polygon points="50,25 75,37.5 75,62.5 50,75 25,62.5 25,37.5" fill="var(--ui-primary)" opacity="0.3"/>
        <polygon points="50,40 62,46 62,58 50,64 38,58 38,46" fill="var(--ui-primary)"/>
      </svg>
      <h1 class="text-2xl font-light tracking-tight">
        Hologram <span class="font-semibold text-[var(--ui-primary)]">DevTools</span>
      </h1>
    </div>

    <!-- Stats -->
    <div class="flex gap-4 flex-wrap justify-center">
      <div class="border border-[var(--ui-border)] rounded-xl px-7 py-5 text-center bg-[var(--ui-bg-elevated)] min-w-[130px]">
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-2 opacity-80">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="var(--ui-primary)" stroke-width="4"/>
          <polygon points="50,40 62,46 62,58 50,64 38,58 38,46" fill="var(--ui-primary)"/>
        </svg>
        <div class="text-lg font-semibold">{{ store.overview?.version ?? '-' }}</div>
        <div class="text-[11px] text-[var(--ui-text-dimmed)] uppercase tracking-wide">Version</div>
      </div>
      <div class="border border-[var(--ui-border)] rounded-xl px-7 py-5 text-center bg-[var(--ui-bg-elevated)] min-w-[130px]">
        <LayoutGrid :size="28" class="mx-auto mb-2 text-[var(--ui-primary)] opacity-80" />
        <div class="text-lg font-semibold">{{ store.overview?.pages ?? '-' }}</div>
        <div class="text-[11px] text-[var(--ui-text-dimmed)] uppercase tracking-wide">Pages</div>
      </div>
      <div class="border border-[var(--ui-border)] rounded-xl px-7 py-5 text-center bg-[var(--ui-bg-elevated)] min-w-[130px]">
        <Network :size="28" class="mx-auto mb-2 text-[var(--ui-primary)] opacity-80" />
        <div class="text-lg font-semibold">{{ store.overview?.components ?? '-' }}</div>
        <div class="text-[11px] text-[var(--ui-text-dimmed)] uppercase tracking-wide">Components</div>
      </div>
      <div class="border border-[var(--ui-border)] rounded-xl px-7 py-5 text-center bg-[var(--ui-bg-elevated)] min-w-[130px]">
        <Database :size="28" class="mx-auto mb-2 text-[var(--ui-primary)] opacity-80" />
        <div class="text-lg font-semibold">{{ store.overview?.resources ?? '-' }}</div>
        <div class="text-[11px] text-[var(--ui-text-dimmed)] uppercase tracking-wide">Resources</div>
      </div>
    </div>
  </div>
</template>
