import { createRouter, createWebHashHistory } from "vue-router"

export const appRouter = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/:catchAll(.*)*",
      redirect: "/",
    },
  ],
})
