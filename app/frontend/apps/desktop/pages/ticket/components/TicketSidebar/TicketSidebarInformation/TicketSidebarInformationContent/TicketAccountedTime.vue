<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useTicketAccountedTime } from '#shared/entities/ticket/composables/useTicketAccountedTime.ts'
import type { TicketById } from '#shared/entities/ticket/types.ts'

import CommonButton from '#desktop/components/CommonButton/CommonButton.vue'

export interface Props {
  ticket: TicketById
}

const { ticket } = defineProps<Props>()

const { timeAccountingDisplayUnit, timeAccountingConfig } = useTicketAccountedTime()

const totalTime = computed(() => ticket?.timeUnit)

const showAll = ref(false)
const MIN_SHOWN = 4

const allUnits = computed(() => {
  const units = [{ name: __('Total'), timeUnit: totalTime.value }]

  if (!timeAccountingConfig.value.time_accounting_types) return units

  units.push(...(ticket.timeUnitsPerType || []))

  return units
})

const shownUnits = computed(() => {
  if (showAll.value) return allUnits.value

  return allUnits.value.slice(0, MIN_SHOWN)
})

const shouldDisplayShowButton = computed(
  () => allUnits.value.length > MIN_SHOWN && shownUnits.value !== allUnits.value,
)

const remainingUnitsCount = computed(() => allUnits.value.length - MIN_SHOWN)

const showDivider = computed(() => shownUnits.value.length > 1) // If more than one accounting type is available, show divider
</script>

<template>
  <div v-if="totalTime">
    <ul class="space-y-2">
      <li
        v-for="({ name, timeUnit }, index) in shownUnits"
        :key="name"
        class="flex gap-2 first:font-semibold"
        :class="{
          'border-stone-200 first:border-b first:border-solid first:pb-1 dark:border-neutral-500':
            showDivider,
        }"
      >
        <CommonLabel
          :id="`accounted-time-${name}`"
          size="small"
          class="text-black! dark:text-white!"
          :class="{ uppercase: index === 0 }"
          >{{ $t(name) }}</CommonLabel
        >
        <CommonLabel
          size="small"
          :aria-labelledby="`accounted-time-label-${name}`"
          :aria-describedby="`accounted-time-unit-${name}`"
          class="text-black! ltr:ml-auto rtl:mr-auto dark:text-white!"
          >{{ timeUnit?.toFixed(2) }}</CommonLabel
        >
        <CommonLabel
          :id="`accounted-time-unit-${name}`"
          size="small"
          class="text-stone-200! dark:text-neutral-500!"
          :aria-description="$t('Accounted time unit')"
          >{{ timeAccountingDisplayUnit }}</CommonLabel
        >
      </li>
    </ul>

    <CommonButton
      v-if="shouldDisplayShowButton"
      class="mt-1 hover:outline-transparent! ltr:float-right ltr:-mr-2 ltr:-ml-2 rtl:float-left rtl:-mr-2 rtl:-ml-2"
      variant="secondary"
      @click="showAll = true"
      >{{ $t('Show %s more', remainingUnitsCount) }}&hellip;</CommonButton
    >
  </div>
</template>
