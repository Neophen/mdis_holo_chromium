import { env } from "node:process"
import type { ManifestV3Export } from "@crxjs/vite-plugin"
import packageJson from "./package.json" with { type: "json" }

const { version, name, description, displayName } = packageJson
const [major, minor, patch, label = "0"] = version
  .replace(/[^\d.-]+/g, "")
  .split(/[.-]/)

export default {
  author: {
    email: "hello@themykolas.com",
  },
  name: env.mode === "staging" ? `[INTERNAL] ${name}` : displayName || name,
  description,
  version: `${major}.${minor}.${patch}.${label}`,
  version_name: version,
  manifest_version: 3,
  action: {
    default_popup: "src/ui/action-popup/index.html",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      all_frames: false,
      js: ["src/content-script/index.ts"],
      matches: ["*://*/*"],
      run_at: "document_end",
    },
  ],
  devtools_page: "src/devtools/index.html",
  offline_enabled: true,
  host_permissions: ["<all_urls>"],
  permissions: ["storage", "tabs"],
  web_accessible_resources: [
    {
      resources: [
        "src/ui/devtools-panel/index.html",
      ],
      matches: ["<all_urls>"],
      use_dynamic_url: false,
    },
  ],
  icons: {
    16: "src/assets/icons/icon-16.png",
    24: "src/assets/icons/icon-24.png",
    32: "src/assets/icons/icon-32.png",
    48: "src/assets/icons/icon-48.png",
    128: "src/assets/icons/icon-128.png",
  },
} as ManifestV3Export
