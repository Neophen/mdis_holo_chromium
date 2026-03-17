import { pinia } from "src/utils/pinia"
import { createApp } from "vue"
import App from "./app.vue"
import ui from "@nuxt/ui/vue-plugin"
import "./index.css"

const app = createApp(App).use(ui).use(pinia)

app.mount("#app")

export default app

self.onerror = function (message, source, lineno, colno, error) {
  console.info("[HologramDevtools] Error: " + message, { source, lineno, colno, error })
}
