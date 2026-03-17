<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import { useHologramStore } from "@/stores/hologram.store"
import DevtoolsLayout from "@/components/hologram/DevtoolsLayout.vue"

const store = useHologramStore()

function detectCurrentRoute() {
  chrome.devtools.inspectedWindow.eval(
    "window.location.pathname",
    (result: unknown, error: unknown) => {
      if (!error && typeof result === "string") {
        store.setCurrentRoute(result)
      }
    }
  )
}

let navigationListener: ((url: string) => void) | null = null

onMounted(() => {
  store.initialize()
  detectCurrentRoute()

  // Listen for navigation changes in the inspected window
  navigationListener = (_url: string) => {
    detectCurrentRoute()
  }
  chrome.devtools.network.onNavigated.addListener(navigationListener)
})

onUnmounted(() => {
  if (navigationListener) {
    chrome.devtools.network.onNavigated.removeListener(navigationListener)
  }
})
</script>

<template>
  <UApp>
    <DevtoolsLayout />
  </UApp>
</template>
