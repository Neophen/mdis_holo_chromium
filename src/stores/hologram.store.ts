import { defineStore } from "pinia"
import { ref, computed } from "vue"
import {
  useHologramSocket,
  type HologramOverview,
  type HologramTreeNode,
  type HologramComponent,
  type HologramRoute,
  type HologramResource,
} from "@/composables/useHologramSocket"

export const useHologramStore = defineStore("hologram", () => {
  const { send, on, connect, status } = useHologramSocket()

  // State
  const overview = ref<HologramOverview | null>(null)
  const componentTree = ref<HologramTreeNode | null>(null)
  const selectedComponentId = ref<string | null>(null)
  const selectedComponent = ref<HologramComponent | null>(null)
  const routes = ref<HologramRoute[]>([])
  const resources = ref<Record<string, HologramResource>>({})
  const selectedResourceId = ref<string | null>(null)
  const timelineEvents = ref<TimelineEvent[]>([])
  const isRecording = ref(false)

  // Computed
  const selectedResource = computed(() => {
    if (!selectedResourceId.value) return null
    return resources.value[selectedResourceId.value] ?? null
  })

  const resourceList = computed(() => {
    return Object.entries(resources.value).map(([id, resource]) => ({
      id,
      ...resource,
    }))
  })

  // Actions
  function fetchOverview() {
    send("get_overview")
  }

  function fetchComponentTree() {
    send("get_component_tree")
  }

  function selectComponent(id: string) {
    selectedComponentId.value = id
    send("get_component", { id })
  }

  function fetchRoutes() {
    send("get_routes")
  }

  function fetchResources() {
    send("get_resources")
  }

  function selectResource(id: string) {
    selectedResourceId.value = id
  }

  function toggleRecording() {
    isRecording.value = !isRecording.value
  }

  function clearTimeline() {
    timelineEvents.value = []
  }

  function addTimelineEvent(event: TimelineEvent) {
    if (isRecording.value) {
      timelineEvents.value.unshift(event)
    }
  }

  // WebSocket message handlers
  function setupListeners() {
    on("overview", (data) => {
      overview.value = data as HologramOverview
    })

    on("component_tree", (data) => {
      const msg = data as { root: HologramTreeNode }
      componentTree.value = msg.root
    })

    on("component", (data) => {
      selectedComponent.value = data as HologramComponent
    })

    on("routes", (data) => {
      routes.value = data as HologramRoute[]
    })

    on("resources", (data) => {
      resources.value = data as Record<string, HologramResource>
    })

    on("subscribed", () => {
      // Fetch initial data
      fetchOverview()
      fetchComponentTree()
      fetchRoutes()
      fetchResources()
    })

    on("introspection_updated", (data) => {
      // Refresh all data on update
      overview.value = (data as { overview: HologramOverview }).overview ?? overview.value
      fetchComponentTree()
      fetchRoutes()
      fetchResources()

      addTimelineEvent({
        type: "lifecycle",
        name: "introspection_updated",
        source: "system",
        timestamp: Date.now(),
      })
    })
  }

  function initialize() {
    setupListeners()
    connect()
  }

  return {
    // State
    status,
    overview,
    componentTree,
    selectedComponentId,
    selectedComponent,
    routes,
    resources,
    selectedResourceId,
    selectedResource,
    resourceList,
    timelineEvents,
    isRecording,

    // Actions
    initialize,
    fetchOverview,
    fetchComponentTree,
    selectComponent,
    fetchRoutes,
    fetchResources,
    selectResource,
    toggleRecording,
    clearTimeline,
    addTimelineEvent,
  }
})

export interface TimelineEvent {
  type: "action" | "command" | "navigation" | "lifecycle"
  name: string
  source: string
  timestamp: number
  data?: unknown
}
