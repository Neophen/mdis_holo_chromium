self.onerror = function (message, source, lineno, colno, error) {
  console.info("[HologramDevtools] Error: " + message, { source, lineno, colno, error })
}

// Detect Hologram framework presence on the page
function detectHologram(): boolean {
  const hasHologramMeta = !!document.querySelector('meta[name="hologram"]')
  const hasHologramRoot = !!document.querySelector("[data-hologram]")
  const hasHologramScript = !!document.querySelector("script[data-hologram]")

  return hasHologramMeta || hasHologramRoot || hasHologramScript
}

function check() {
  const detected = detectHologram()
  if (detected) {
    console.info("[HologramDevtools] Hologram framework detected")
  }
  chrome.runtime.sendMessage({
    type: "hologram-detected",
    detected,
  })
}

if (document.readyState === "complete") {
  check()
} else {
  window.addEventListener("load", check)
}
