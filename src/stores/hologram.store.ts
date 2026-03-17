import { defineStore } from "pinia"
import { ref, computed } from "vue"
import {
  useHologramSocket,
  type HologramOverview,
  type HologramTreeNode,
  type HologramComponent,
  type HologramRoute,
  type HologramResource,
  type LiveTreeResponse,
  type LiveStateResponse,
  type LiveSnapshot,
  type ActionEvent,
  type TypedValue,
} from "@/composables/useHologramSocket"

export const useHologramStore = defineStore("hologram", () => {
  const { send, on, connect, status } = useHologramSocket()

  // State
  const overview = ref<HologramOverview | null>(null)
  const componentTree = ref<HologramTreeNode | null>(null)
  const currentRoute = ref<string | null>(null)
  const selectedNodeId = ref<string | null>(null)
  const selectedComponent = ref<HologramComponent | null>(null)
  const routes = ref<HologramRoute[]>([])
  const resources = ref<Record<string, HologramResource>>({})
  const selectedResourceId = ref<string | null>(null)
  const timelineEvents = ref<TimelineEvent[]>([])
  const isRecording = ref(true)

  // Live state (from bridge)
  const bridgeConnected = ref(false)
  const liveTree = ref<HologramTreeNode | null>(null)
  const activePage = ref<string | null>(null)
  const selectedLiveState = ref<LiveStateResponse | null>(null)
  const actionHistory = ref<ActionEvent[]>([])

  // The CID currently being inspected (resolved from tree node)
  const selectedCid = ref<string | null>(null)

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

  // Use live tree when bridge is connected, fall back to static tree
  const activeTree = computed(() => {
    return liveTree.value ?? componentTree.value ?? null
  })

  // Back-compat alias
  const selectedComponentId = selectedNodeId

  // Actions
  function fetchOverview() {
    send("get_overview")
  }

  function fetchComponentTree() {
    const payload: Record<string, unknown> = {}
    if (currentRoute.value) {
      payload.route = currentRoute.value
    }
    send("get_component_tree", payload)
  }

  function fetchLiveTree() {
    send("get_live_tree")
  }

  function fetchActionHistory(limit?: number) {
    const payload: Record<string, unknown> = {}
    if (limit) payload.limit = limit
    send("get_action_history", payload)
  }

  function editState(cid: string, path: string[], value: TypedValue) {
    send("edit_state", { cid, path, value })
  }

  function dispatchAction(target: string, name: string, params?: Record<string, unknown>) {
    send("dispatch_action", { target, name, params: params ?? {} })
  }

  function openInEditor(file: string, line?: number) {
    send("open_in_editor", { file, line: line ?? 1 })
  }

  function setCurrentRoute(route: string | null) {
    const changed = currentRoute.value !== route
    currentRoute.value = route
    if (changed && status.value === "connected") {
      fetchComponentTree()
      fetchLiveTree()
    }
  }

  /**
   * Select a node from the tree. Resolves the best CID to use for live state
   * lookup, then fetches both static metadata and live state.
   */
  function selectComponent(nodeId: string, node?: HologramTreeNode) {
    selectedNodeId.value = nodeId
    selectedLiveState.value = null

    // Fetch static metadata
    send("get_component", { id: nodeId })

    // Determine the CID to use for live state lookup:
    // 1. If it's a page node, CID is "page"
    // 2. If the tree node has cids attached, use the first one
    // 3. Fall back to the node id (might be a module name — server will resolve)
    let cid = nodeId

    if (node) {
      if (node.type === "page") {
        cid = "page"
      } else if (node.cid) {
        cid = node.cid
      } else if (node.cids && node.cids.length > 0) {
        cid = node.cids[0]
      }
    }

    selectedCid.value = cid
    send("get_live_state", { cid })
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

    on("state_updated", () => {
      if (selectedNodeId.value) {
        send("get_component", { id: selectedNodeId.value })
      }
    })

    on("subscribed", () => {
      fetchOverview()
      fetchComponentTree()
      fetchLiveTree()
      fetchRoutes()
      fetchResources()
      fetchActionHistory()
    })

    on("introspection_updated", (data) => {
      overview.value = (data as { overview: HologramOverview }).overview ?? overview.value
      fetchComponentTree()
      fetchLiveTree()
      fetchRoutes()
      fetchResources()

      addTimelineEvent({
        type: "lifecycle",
        name: "introspection_updated",
        source: "system",
        timestamp: Date.now(),
      })
    })

    // --- Live state handlers (from bridge) ---

    on("live_tree", (data) => {
      const msg = data as LiveTreeResponse
      liveTree.value = msg.root
      bridgeConnected.value = msg.bridge_connected

      // Track page navigation
      if (msg.active_page && msg.active_page !== activePage.value) {
        const previousPage = activePage.value
        activePage.value = msg.active_page

        if (previousPage) {
          addTimelineEvent({
            type: "navigation",
            name: `→ ${shortName(msg.active_page)}`,
            source: msg.active_page,
            timestamp: Date.now(),
          })
        }
      }
    })

    on("live_state", (data) => {
      selectedLiveState.value = data as LiveStateResponse
    })

    on("live_snapshot", (data) => {
      bridgeConnected.value = true

      // Refresh tree (this handles page navigation too — server filters to active page)
      fetchLiveTree()

      // Refresh selected component's live state
      if (selectedCid.value) {
        send("get_live_state", { cid: selectedCid.value })
      }

      addTimelineEvent({
        type: "lifecycle",
        name: "render",
        source: "bridge",
        timestamp: Date.now(),
      })
    })

    on("action_executed", (data) => {
      const action = data as ActionEvent
      actionHistory.value.unshift(action)
      if (actionHistory.value.length > 200) {
        actionHistory.value.pop()
      }

      addTimelineEvent({
        type: "action",
        name: action.name,
        source: action.target,
        timestamp: action.timestamp,
        duration: action.duration,
        data: action.params,
      })
    })

    on("action_history", (data) => {
      actionHistory.value = data as ActionEvent[]
    })

    on("state_edited", () => {
      // Edit confirmed — snapshot will follow from bridge
    })

    on("editor_opened", () => {
      // Confirmation only
    })
  }

  function initialize() {
    setupListeners()
    connect()
  }

  function shortName(name: string): string {
    return name.split(".").pop() ?? name
  }

  return {
    // State
    status,
    overview,
    componentTree,
    currentRoute,
    selectedComponentId,
    selectedNodeId,
    selectedComponent,
    routes,
    resources,
    selectedResourceId,
    selectedResource,
    resourceList,
    timelineEvents,
    isRecording,

    // Live state
    bridgeConnected,
    liveTree,
    activePage,
    selectedLiveState,
    selectedCid,
    actionHistory,
    activeTree,

    // Actions
    initialize,
    fetchOverview,
    fetchComponentTree,
    fetchLiveTree,
    fetchActionHistory,
    editState,
    dispatchAction,
    openInEditor,
    setCurrentRoute,
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
  duration?: number
  data?: unknown
}
