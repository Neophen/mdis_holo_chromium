import { ref, readonly } from "vue"

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

export interface HologramOverview {
  version: string
  pages: number
  components: number
  resources: number
}

export interface HologramProp {
  name: string
  type: string
  required: boolean
}

export interface HologramAction {
  name: string
  line: number
  usesParams: boolean
  params: string[]
}

export interface HologramCommand {
  name: string
  line: number
  usesParams: boolean
  params: string[]
}

export interface HologramFunction {
  name: string
  line: number
  arity: number
}

export interface HologramComponent {
  file: string
  line: number
  route?: string
  props: HologramProp[]
  actions: HologramAction[]
  commands: HologramCommand[]
  stateKeys?: string[]
  functions: HologramFunction[]
  templateLine?: number
  initLine?: number
}

export interface HologramTreeNode {
  id: string
  name: string
  type: "root" | "page" | "component"
  route?: string
  file?: string
  props?: HologramProp[]
  children: HologramTreeNode[]
}

export interface HologramRoute {
  path: string
  module: string
  file: string
}

export interface HologramAttribute {
  name: string
  type: string
  line: number
  primaryKey: boolean
}

export interface HologramRelationship {
  name: string
  type: string
  destination: string
  line: number
}

export interface HologramResource {
  file: string
  line: number
  attributes: HologramAttribute[]
  relationships: HologramRelationship[]
}

type MessageHandler = (data: unknown) => void

const DEFAULT_PORT = 4008
const RECONNECT_DELAY = 3000
const MAX_RECONNECT_DELAY = 30000

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectDelay = RECONNECT_DELAY
const handlers = new Map<string, Set<MessageHandler>>()

const status = ref<ConnectionStatus>("disconnected")
const port = ref(DEFAULT_PORT)

function getUrl(): string {
  return `ws://localhost:${port.value}/ws`
}

function connect() {
  if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
    return
  }

  status.value = "connecting"

  try {
    socket = new WebSocket(getUrl())
  } catch {
    status.value = "error"
    scheduleReconnect()
    return
  }

  socket.onopen = () => {
    status.value = "connected"
    reconnectDelay = RECONNECT_DELAY
    // Subscribe to real-time updates
    send("subscribe")
  }

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      const type = msg.type as string
      const messageHandlers = handlers.get(type)
      if (messageHandlers) {
        for (const handler of messageHandlers) {
          handler(msg.data)
        }
      }
    } catch (err) {
      console.warn("[HologramDevtools] Failed to parse message:", err)
    }
  }

  socket.onclose = () => {
    status.value = "disconnected"
    socket = null
    scheduleReconnect()
  }

  socket.onerror = () => {
    status.value = "error"
  }
}

function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (socket) {
    socket.close()
    socket = null
  }
  status.value = "disconnected"
}

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connect()
    reconnectDelay = Math.min(reconnectDelay * 1.5, MAX_RECONNECT_DELAY)
  }, reconnectDelay)
}

function send(type: string, payload?: Record<string, unknown>) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, ...payload }))
  }
}

function on(type: string, handler: MessageHandler) {
  if (!handlers.has(type)) {
    handlers.set(type, new Set())
  }
  handlers.get(type)!.add(handler)

  // Return unsubscribe function
  return () => {
    handlers.get(type)?.delete(handler)
  }
}

export function useHologramSocket() {
  return {
    status: readonly(status),
    port,
    connect,
    disconnect,
    send,
    on,
  }
}
