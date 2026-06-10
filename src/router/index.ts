import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import TaskListView from "@/views/TaskListView.vue";
import TaskDetailView from "@/views/TaskDetailView.vue";
import ProgressView from "@/views/ProgressView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "TaskList",
    component: TaskListView
  },
  {
    path: "/aufgabe/:id",
    name: "TaskDetail",
    component: TaskDetailView
  },
  {
    path: "/fortschritt",
    name: "Progress",
    component: ProgressView
  }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
