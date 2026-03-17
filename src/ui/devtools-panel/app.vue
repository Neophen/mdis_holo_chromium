<script setup lang="ts">
import { onMounted } from "vue"
import { useHologramStore } from "@/stores/hologram.store"
import DevtoolsLayout from "@/components/hologram/DevtoolsLayout.vue"

const store = useHologramStore()

onMounted(() => {
  store.initialize()
})
</script>

<template>
  <UApp>
    <DevtoolsLayout />
  </UApp>
</template>
