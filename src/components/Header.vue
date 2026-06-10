<template>
  <header class="app-header">
    <div class="header-left">
      <button @click="$emit('toggle-sidebar')" class="menu-btn" title="Menü">☰</button>
      <router-link to="/" class="logo">IHK Aufgabenplattform</router-link>
    </div>
    <nav class="header-nav">
      <router-link to="/" class="nav-link">Aufgaben</router-link>
      <router-link to="/fortschritt" class="nav-link">Fortschritt</router-link>
    </nav>
    <div class="header-right">
      <button @click="toggleTheme" class="theme-btn" title="Theme umschalten">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineEmits<{
  "toggle-sidebar": [];
}>();

const isDark = ref(document.documentElement.getAttribute("data-theme") !== "light");

function toggleTheme() {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute("data-theme", isDark.value ? "dark" : "light");
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  display: none;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-text);
  line-height: 1;
}

.menu-btn:hover {
  background: var(--color-border);
}

.logo {
  font-weight: 700;
  font-size: 18px;
  color: var(--color-primary);
  text-decoration: none;
}

.header-nav {
  display: flex;
  gap: 16px;
}

.nav-link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text);
  background: var(--color-border);
}

.theme-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 16px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
  }

  .menu-btn {
    display: block;
  }

  .header-nav {
    gap: 8px;
  }

  .nav-link {
    font-size: 13px;
    padding: 6px 8px;
  }
}
</style>
