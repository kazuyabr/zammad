<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { computed } from 'vue'

import { useSessionStore } from '#shared/stores/session.ts'

import { useTicketSummaryBanner } from '#desktop/entities/user/current/composables/useTicketSummaryBanner.ts'

const { hideBannerFromUserPreference, toggleSummaryBanner, isTicketSummaryFeatureEnabled } =
  useTicketSummaryBanner()

const { hasPermission } = useSessionStore()

const isAgent = computed(() => hasPermission('ticket.agent'))
</script>

<template>
  <div v-if="isTicketSummaryFeatureEnabled && isAgent">
    <CommonLabel tag="h3">
      {{ $t('Ticket Summary') }}
    </CommonLabel>
    <FormKit
      :model-value="hideBannerFromUserPreference"
      label="Show an info banner in the article list indicating that a summary has been created by %s."
      :label-placeholder="['Zammad Smart Assist']"
      name="toggle-dismiss-ticket-summary-banner"
      type="checkbox"
      :aria-label="
        hideBannerFromUserPreference
          ? $t('Disable the banner for the ticket summary smart assist')
          : $t('Enable the banner for the ticket summary smart assist')
      "
      @update:model-value="toggleSummaryBanner"
    />
  </div>
</template>
