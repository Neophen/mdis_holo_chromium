<script setup lang="ts"></script>

<template>
  <UApp>
    <div class="w-72 p-4">
      <div class="flex items-center gap-3 mb-3">
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="var(--ui-primary)" stroke-width="6"/>
          <polygon points="50,25 75,37.5 75,62.5 50,75 25,62.5 25,37.5" fill="var(--ui-primary)" opacity="0.3"/>
          <polygon points="50,40 62,46 62,58 50,64 38,58 38,46" fill="var(--ui-primary)"/>
        </svg>
        <div>
          <div class="font-semibold text-sm">Hologram DevTools</div>
          <div class="text-xs text-[var(--ui-text-dimmed)]">v0.1.0</div>
        </div>
      </div>
      <p class="text-xs text-[var(--ui-text-muted)] mb-3">
        Open Chrome DevTools (F12) and navigate to the "Hologram" tab to inspect your application.
      </p>
      <div class="text-[10px] text-[var(--ui-text-dimmed)]">
        Connects to localhost:4008
      </div>
    </div>
  </UApp>
</template>
