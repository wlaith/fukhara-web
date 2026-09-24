<script setup lang="ts">
import AppHeader from './components/ui/AppHeader.vue'
import { useLocalizedNavigation } from './composables/useLocalizedNavigation'

const { push } = useLocalizedNavigation()
</script>

<template>
  <AppHeader @analyze="push({ name: 'home' })" />
  <router-view />
</template>
