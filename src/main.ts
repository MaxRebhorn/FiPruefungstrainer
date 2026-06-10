import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import initSqlJs from "sql.js";
import "./assets/styles/main.css";
import "./assets/styles/theme.css";

// Initialize sql.js WASM for SQL validation (non-blocking — app mounts immediately)
initSqlJs({
  locateFile: (file: string) => `/sql-wasm.wasm`,
}).then((SQL: any) => {
  window._SQL = SQL;
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount("#app");
