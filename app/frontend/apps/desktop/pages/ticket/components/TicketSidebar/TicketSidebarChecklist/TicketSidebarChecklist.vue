<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { usePersistentStates } from '#desktop/pages/ticket/composables/usePersistentStates.ts'
import { useTicketInformation } from '#desktop/pages/ticket/composables/useTicketInformation.ts'
import {
  type TicketSidebarProps,
  type TicketSidebarEmits,
  TicketSidebarButtonBadgeType,
  type TicketSidebarButtonBadgeDetails,
} from '#desktop/pages/ticket/types/sidebar.ts'

import TicketSidebarWrapper from '../TicketSidebarWrapper.vue'

import TicketSidebarChecklistContent from './TicketSidebarChecklistContent.vue'

defineProps<TicketSidebarProps>()

const { persistentStates } = usePersistentStates()

const emit = defineEmits<TicketSidebarEmits>()

const { ticket } = useTicketInformation()

const incompleteChecklistItemsCount = computed(() => ticket.value?.checklist?.incomplete)

const badge = computed<TicketSidebarButtonBadgeDetails | undefined>(() => {
  const label = __('Incomplete checklist items')

  if (!incompleteChecklistItemsCount.value) return

  return {
    type: TicketSidebarButtonBadgeType.Alarming,
    value: incompleteChecklistItemsCount.value,
    label,
  }
})

onMounted(() => {
  emit('show')
})
</script>

<template>
  <TicketSidebarWrapper
    :key="sidebar"
    :sidebar="sidebar"
    :sidebar-plugin="sidebarPlugin"
    :selected="selected"
    :badge="badge"
  >
    <TicketSidebarChecklistContent
      v-model="persistentStates"
      :context="context"
      :sidebar-plugin="sidebarPlugin"
    />
  </TicketSidebarWrapper>
</template>
