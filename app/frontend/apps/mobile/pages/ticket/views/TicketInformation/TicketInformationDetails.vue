<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, watch } from 'vue'

import CommonUserAvatar from '#shared/components/CommonUserAvatar/CommonUserAvatar.vue'
import ObjectAttributes from '#shared/components/ObjectAttributes/ObjectAttributes.vue'
import { useConfirmation } from '#shared/composables/useConfirmation.ts'
import { useObjectAttributes } from '#shared/entities/object-attributes/composables/useObjectAttributes.ts'
import { useTicketSubscribe } from '#shared/entities/ticket/composables/useTicketSubscribe.ts'
import { useTicketView } from '#shared/entities/ticket/composables/useTicketView.ts'
import { EnumObjectManagerObjects } from '#shared/graphql/types.ts'
import { useSessionStore } from '#shared/stores/session.ts'

import CommonLoader from '#mobile/components/CommonLoader/CommonLoader.vue'
import CommonSectionMenu from '#mobile/components/CommonSectionMenu/CommonSectionMenu.vue'
import CommonSectionMenuItem from '#mobile/components/CommonSectionMenu/CommonSectionMenuItem.vue'
import CommonShowMoreButton from '#mobile/components/CommonShowMoreButton/CommonShowMoreButton.vue'
import CommonUsersList from '#mobile/components/CommonUsersList/CommonUsersList.vue'

import TicketEscalationTimeMenuItem from '../../components/TicketDetailView/TicketEscalationTimeMenuItem.vue'
import TicketObjectAttributes from '../../components/TicketDetailView/TicketObjectAttributes.vue'
import TicketTags from '../../components/TicketDetailView/TicketTags.vue'
import { useTicketInformation } from '../../composable/useTicketInformation.ts'

const { attributes: objectAttributes } = useObjectAttributes(EnumObjectManagerObjects.Ticket)

const { form, initialFormTicketValue, ticket, updateFormLocation, ticketQuery } =
  useTicketInformation()

const ticketFormGroupNode = computed(() => {
  return form.value?.formNode?.at('ticket')
})

const { waitForConfirmation } = useConfirmation()

const discardTicketEditDialog = async () => {
  if (!ticketFormGroupNode.value) return

  const confirmed = await waitForConfirmation(
    __('Are you sure? You have unsaved changes that will get lost.'),
    {
      buttonLabel: __('Discard changes'),
      buttonVariant: 'danger',
    },
  )

  if (!confirmed) return

  form.value?.resetForm(
    {
      values: initialFormTicketValue.value,
      object: ticket.value,
    },
    {
      resetDirty: true,
      groupNode: ticketFormGroupNode.value,
    },
  )
}

onMounted(() => {
  updateFormLocation('[data-ticket-edit-form]')
})

onUnmounted(() => {
  updateFormLocation('body')
})

const {
  canManageSubscription,
  isSubscribed,
  isSubscriptionLoading,
  subscribersWithoutMe,
  subscribersAccessLookup,
  totalSubscribersWithoutMe,
  toggleSubscribe,
} = useTicketSubscribe(ticket)

const variants = {
  true: __('yes'),
  false: __('no'),
}

let isOutsideUpdate = false
watch(
  () => isSubscribed.value,
  () => {
    isOutsideUpdate = true
    nextTick(() => {
      isOutsideUpdate = false
    })
  },
)

const handleToggleInput = async () => {
  // do not trigger update, if value was changed from the outside,
  // and not by clicking on toggle button, otherwise it goes into infinite loop
  if (isOutsideUpdate) return false
  return toggleSubscribe()
}

const session = useSessionStore()

const loadingTicket = ticketQuery.loading()
const loadMoreMentions = () => {
  ticketQuery.refetch({
    mentionsCount: null,
  })
}

const { isTicketAgent, isTicketEditable } = useTicketView(ticket)

const hasEscalation = computed(() => {
  if (!ticket.value) return false
  const { closeEscalationAt, updateEscalationAt, firstResponseEscalationAt } = ticket.value
  return !!(closeEscalationAt || updateEscalationAt || firstResponseEscalationAt)
})
</script>

<template>
  <CommonLoader :loading="!ticket" />

  <div data-ticket-edit-form />

  <FormKit
    v-if="ticketFormGroupNode?.context?.state.dirty"
    wrapper-class="mt-4 mb-4 flex grow justify-center items-center"
    input-class="py-2 px-4 w-full h-14 text-base text-red-bright! formkit-variant-primary:bg-red-dark rounded-xl select-none"
    type="button"
    name="discardTicketInformation"
    @click="discardTicketEditDialog"
  >
    {{ $t('Discard your unsaved changes') }}
  </FormKit>

  <ObjectAttributes
    v-if="!isTicketEditable && ticket"
    :object="ticket"
    :attributes="objectAttributes"
    :skip-attributes="['title', 'customer_id', 'organization_id']"
  />

  <TicketObjectAttributes v-if="isTicketAgent && ticket" :ticket="ticket" />

  <CommonSectionMenu v-if="ticket && hasEscalation" :header-label="__('Escalation Times')">
    <TicketEscalationTimeMenuItem
      :escalation-at="ticket.firstResponseEscalationAt"
      :label="__('First Response Time')"
    />
    <TicketEscalationTimeMenuItem
      :escalation-at="ticket.updateEscalationAt"
      :label="__('Update Time')"
    />
    <TicketEscalationTimeMenuItem
      :escalation-at="ticket.closeEscalationAt"
      :label="__('Solution Time')"
    />
  </CommonSectionMenu>

  <TicketTags v-if="isTicketAgent && isTicketEditable && ticket" :ticket="ticket" />

  <CommonSectionMenu v-else-if="ticket?.tags?.length">
    <CommonSectionMenuItem :label="__('Tags')">
      {{ ticket.tags.join(', ') }}
    </CommonSectionMenuItem>
  </CommonSectionMenu>

  <CommonSectionMenu v-if="canManageSubscription" class="py-1" :header-label="__('Subscribers')">
    <!-- Currently only modelValue is working: https://github.com/formkit/formkit/issues/629 -->
    <FormKit
      type="toggle"
      :model-value="isSubscribed"
      :label="__('Get notified')"
      :variants="variants"
      :disabled="isSubscriptionLoading"
      :outer-class="{
        'px-3!': true,
        'border-b border-white/10': subscribersWithoutMe.length,
      }"
      wrapper-class="px-0!"
      @input-raw="handleToggleInput"
    >
      <template #label="context">
        <!-- id is available on the toggle element  -->
        <!-- eslint-disable vuejs-accessibility/label-has-for -->
        <label :for="context.id" :class="context.classes.label">
          <CommonUserAvatar v-if="session.user" class="ltr:mr-3 rtl:ml-3" :entity="session.user" />
          {{ context.label }}
        </label>
      </template>
    </FormKit>
    <CommonUsersList :users="subscribersWithoutMe" :access-lookup="subscribersAccessLookup" />
    <CommonShowMoreButton
      :entities="subscribersWithoutMe"
      :total-count="totalSubscribersWithoutMe"
      :disabled="loadingTicket"
      @click="loadMoreMentions"
    />
  </CommonSectionMenu>
</template>
