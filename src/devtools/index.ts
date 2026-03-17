self.onerror = function (message, source, lineno, colno, error) {
  console.info("[HologramDevtools] Error: " + message, { source, lineno, colno, error })
}

chrome.devtools.panels.create(
  "Hologram",
  chrome.runtime.getURL("src/assets/logo.png"),
  chrome.runtime.getURL("src/ui/devtools-panel/index.html"),
  function (panel) {
    console.info("[HologramDevtools] Panel created", panel)
  }
)
