<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { computed, watch } from 'vue'

import { useArticleContext } from '#desktop/pages/ticket/composables/useArticleContext.ts'
import { usePersistentStates } from '#desktop/pages/ticket/composables/usePersistentStates.ts'
import {
  type TicketSidebarProps,
  type TicketSidebarEmits,
  TicketSidebarButtonBadgeType,
  type TicketSidebarButtonBadgeDetails,
} from '#desktop/pages/ticket/types/sidebar.ts'

import TicketSidebarWrapper from '../TicketSidebarWrapper.vue'

import TicketSidebarAttachmentContent from './TicketSidebarAttachmentContent.vue'
import { useTicketAttachments } from './useTicketAttachments.ts'

defineProps<TicketSidebarProps>()

const { persistentStates } = usePersistentStates()

const emit = defineEmits<TicketSidebarEmits>()

const { ticketAttachments, ticketAttachmentsQuery, loading } = useTicketAttachments()

const { context: contextArticle } = useArticleContext()

watch(contextArticle.articles, (_, oldValue) => {
  if (oldValue === undefined) {
    return
  }

  ticketAttachmentsQuery.refetch()
})

watch(ticketAttachments, (newValue) => {
  if (newValue.length === 0) {
    emit('hide')
    return
  }
  emit('show')
})

const badge = computed<TicketSidebarButtonBadgeDetails | undefined>(() => {
  const label = __('Attachments')

  return {
    type: TicketSidebarButtonBadgeType.Default,
    value: ticketAttachments.value.length,
    label,
  }
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
    <TicketSidebarAttachmentContent
      v-model="persistentStates"
      :context="context"
      :sidebar-plugin="sidebarPlugin"
      :ticket-attachments="ticketAttachments"
      :loading="loading"
    />
  </TicketSidebarWrapper>
</template>
