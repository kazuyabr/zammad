<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, effectScope, watch, type EffectScope, computed } from 'vue'

import { useTicketArticleUpdatesSubscription } from '#shared/entities/ticket/graphql/subscriptions/ticketArticlesUpdates.api.ts'
import type {
  AsyncExecutionError,
  TicketAiAssistanceSummarizePayload,
  TicketAiAssistanceSummary,
} from '#shared/graphql/types.ts'
import { MutationHandler, SubscriptionHandler } from '#shared/server/apollo/handler/index.ts'
import { useApplicationStore } from '#shared/stores/application.ts'
import { useSessionStore } from '#shared/stores/session.ts'

import { useReactivate } from '#desktop/composables/useReactivate.ts'
import TicketSidebarSummaryContent from '#desktop/pages/ticket/components/TicketSidebar/TicketSidebarSummary/TicketSidebarSummaryContent.vue'
import {
  type SummaryConfig,
  type SummaryItem,
  TicketSummaryFeature,
} from '#desktop/pages/ticket/components/TicketSidebar/TicketSidebarSummary/types.ts'
import { useTicketSummaryGenerating } from '#desktop/pages/ticket/components/TicketSidebar/TicketSidebarSummary/useTicketSummaryGenerating.ts'
import { usePersistentStates } from '#desktop/pages/ticket/composables/usePersistentStates.ts'
import { useTicketInformation } from '#desktop/pages/ticket/composables/useTicketInformation.ts'
import { useTicketSummarySeen } from '#desktop/pages/ticket/composables/useTicketSummarySeen.ts'
import { useTicketAiAssistanceSummarizeMutation } from '#desktop/pages/ticket/graphql/mutations/ticketAIAssistanceSummarize.api.ts'
import { useTicketAiAssistanceSummaryUpdatesSubscription } from '#desktop/pages/ticket/graphql/subscriptions/ticketAIAssistanceSummaryUpdates.api.ts'
import type { TicketSidebarEmits, TicketSidebarProps } from '#desktop/pages/ticket/types/sidebar.ts'

import TicketSidebarWrapper from '../TicketSidebarWrapper.vue'

const props = defineProps<TicketSidebarProps>()

const { user, hasPermission } = useSessionStore()

const { config } = storeToRefs(useApplicationStore())

const { persistentStates } = usePersistentStates()

const emit = defineEmits<TicketSidebarEmits>()

const { ticketId } = useTicketInformation()

const summaryConfig = computed(
  () => config.value.ai_assistance_ticket_summary_config as SummaryConfig,
)

const isProviderConfigured = computed(() => !!config.value.ai_provider)

const { ticket } = useTicketInformation()

const isEnabled = computed(
  () =>
    !!(
      ticket.value &&
      ticket.value?.state.name !== 'merged' &&
      config.value.ai_assistance_ticket_summary
    ),
)

const headings = computed<SummaryItem[]>(() => [
  {
    key: 'problem',
    label: __('Customer Intent'),
    active: true,
  },
  {
    key: 'conversationSummary',
    label: __('Conversation Summary'),
    active: true,
  },
  {
    key: 'openQuestions',
    label: __('Open Questions'),
    active: summaryConfig.value.open_questions,
  },
  {
    key: 'suggestions',
    label: __('Suggested Next Steps'),
    active: summaryConfig.value.suggestions,
    feature: config.value.checklist ? TicketSummaryFeature.Checklist : undefined,
  },
])

const summaryHeadings = computed(() => headings.value.filter((heading) => heading.active))

const { setFingerprint, storeFingerprint, isCurrentTicketSummaryRead, isTicketStateMerged } =
  useTicketSummarySeen()

const summary = ref<TicketAiAssistanceSummary | null>(null)

const generationError = ref<AsyncExecutionError | null>(null)

const { updateSummaryGenerating, isSummaryGenerating } = useTicketSummaryGenerating()

const showErrorDetails = computed(() => hasPermission('admin'))

let activeDetachedChildScope: EffectScope

const ticketSummaryHandler = new MutationHandler(useTicketAiAssistanceSummarizeMutation())

const showUpdateIndicator = computed(
  () =>
    !isCurrentTicketSummaryRead.value && !isTicketStateMerged.value && !isSummaryGenerating.value,
)

const updateLocalSummary = (
  summaryData?: TicketAiAssistanceSummary | null,
  fingerprint?: TicketAiAssistanceSummarizePayload['fingerprintMd5'],
) => {
  summary.value = summaryData ?? null

  setFingerprint(fingerprint)

  // Reset error if the summary is returned.
  if (summaryData) generationError.value = null
}

const getAIAssistanceSummary = () => {
  if (!isProviderConfigured.value) return

  summary.value = null
  updateSummaryGenerating(true)

  ticketSummaryHandler.send({ ticketId: ticketId.value }).then((data) => {
    if (data?.ticketAIAssistanceSummarize?.summary) updateSummaryGenerating(false)

    updateLocalSummary(
      data?.ticketAIAssistanceSummarize?.summary,
      data?.ticketAIAssistanceSummarize?.fingerprintMd5,
    )
  })
}

const retrySummaryGeneration = () => {
  summary.value = null
  generationError.value = null
  getAIAssistanceSummary()
}

const activateSubscription = () => {
  const articleSubscription = new SubscriptionHandler(
    useTicketArticleUpdatesSubscription(
      () => ({
        ticketId: ticketId.value,
      }),
      () => ({
        enabled: isProviderConfigured.value,
      }),
    ),
  )

  articleSubscription.onSubscribed().then(() => {
    articleSubscription.onResult(({ data }) => {
      const isNewArticle = data?.ticketArticleUpdates.addArticle

      if (!isNewArticle || isNewArticle?.sender?.name === 'System') return

      getAIAssistanceSummary()
    })
  })

  const ticketSummarySubscription = new SubscriptionHandler(
    useTicketAiAssistanceSummaryUpdatesSubscription(
      {
        ticketId: ticketId.value,
        locale: user?.preferences?.locale || config.value.locale_default,
      },
      () => ({
        enabled: isProviderConfigured.value,
      }),
    ),
  )

  ticketSummarySubscription.onSubscribed().then(() => {
    ticketSummarySubscription.onResult(({ data }) => {
      updateSummaryGenerating(false)

      if (!data?.ticketAIAssistanceSummaryUpdates) return

      const {
        summary: summaryData,
        fingerprintMd5,
        error: errorData,
      } = data.ticketAIAssistanceSummaryUpdates

      if (errorData) {
        generationError.value = errorData
        summary.value = null
        return
      }

      if (summaryData) updateLocalSummary(summaryData, fingerprintMd5)
      if (props.selected) storeFingerprint(fingerprintMd5)
    })
  })
}

const handleDeactivate = () => {
  activeDetachedChildScope?.stop()
}

const handleActivation = () => {
  activeDetachedChildScope = effectScope(true)
  activeDetachedChildScope.run(activateSubscription)
  getAIAssistanceSummary()
}

useReactivate(handleActivation, handleDeactivate)

watch(
  isEnabled,
  (showSidebar) => {
    if (showSidebar) {
      activeDetachedChildScope = effectScope(true)
      activeDetachedChildScope.run(activateSubscription)

      getAIAssistanceSummary()

      emit('show')
    } else {
      emit('hide')
      activeDetachedChildScope?.stop()
    }
  },
  { immediate: true },
)
</script>

<template>
  <TicketSidebarWrapper
    :key="sidebar"
    :sidebar="sidebar"
    :sidebar-plugin="sidebarPlugin"
    :update-indicator="showUpdateIndicator"
    :selected="selected"
  >
    <TicketSidebarSummaryContent
      v-model="persistentStates"
      :context="context"
      :sidebar-plugin="sidebarPlugin"
      :summary="summary"
      :summary-headings="summaryHeadings"
      :is-provider-configured="isProviderConfigured"
      :error="generationError"
      :show-error-details="showErrorDetails"
      @retry-get-summary="retrySummaryGeneration"
    />
  </TicketSidebarWrapper>
</template>
