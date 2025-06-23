<script setup lang="ts">
import { computed } from 'vue'
import type { TicketSidebarContentProps } from '#desktop/pages/ticket/types/sidebar.ts'

const props = defineProps<TicketSidebarContentProps>()

// O título será o mesmo da aba principal do ticket
const title = computed(() => props.sidebarPlugin.title)
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h2 class="text-lg font-semibold mb-2">{{ title }}</h2>
    <!-- Conteúdo customizado virá aqui futuramente -->
  </div>
</template>
