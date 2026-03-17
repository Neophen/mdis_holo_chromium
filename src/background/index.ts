self.onerror = function (message, source, lineno, colno, error) {
  console.info("[HologramDevtools] Error: " + message, { source, lineno, colno, error })
}

console.info("[HologramDevtools] Background service worker loaded")

export {}
