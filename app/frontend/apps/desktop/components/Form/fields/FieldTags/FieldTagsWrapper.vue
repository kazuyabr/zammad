<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import type { FieldTagsContext } from '#shared/components/Form/fields/FieldTags/types.ts'
import { AutocompleteSearchTagDocument } from '#shared/entities/tags/graphql/queries/autocompleteTags.api.ts'
import stopEvent from '#shared/utils/events.ts'

import FieldAutoCompleteInput from '../FieldAutoComplete/FieldAutoCompleteInput.vue'
import { useAddUnknownValueAction } from '../FieldAutoComplete/useAddUnknownValueAction.ts'

import type {
  AutoCompleteOptionValueDictionary,
  ClearFilterInputFunction,
  SelectOptionFunction,
} from '../FieldAutoComplete/types.ts'

const props = defineProps<{
  context: FieldTagsContext
}>()

const actionLabel = ref(__('add new tag'))

const allowNewTags = () => props.context.canCreate

const filterValueValidator = (filter: string) => {
  if (!allowNewTags()) return false
  if (!filter.length) return false
  return true
}

const { actions, isValidFilterValue, addUnknownValue, onSearchInteractionUpdate } =
  useAddUnknownValueAction(actionLabel, filterValueValidator)

const emptyInitialLabelText = computed(() => {
  if (!allowNewTags()) return __('Start typing to search…')

  return __('Start typing to search or enter a new tag…')
})

const onKeydownFilterInput = (
  event: KeyboardEvent,
  filter: string,
  optionValues: AutoCompleteOptionValueDictionary,
  selectOption: SelectOptionFunction,
  clearFilter: ClearFilterInputFunction,
) => {
  const { key } = event

  // Do not allow comma in the tag name.
  //   This is a historical limitation, which may be re-evaluated in the future.
  if (key === ',') stopEvent(event)

  filter = filter.replace(/,$/, '')

  if (!filter) return

  if (['Enter', 'Tab', ','].includes(key)) {
    stopEvent(event)

    if (!allowNewTags() || !isValidFilterValue(filter)) return

    addUnknownValue(filter, selectOption, clearFilter, true)
    clearFilter()
  }
}

const autocompleteInputInstance = useTemplateRef('autocomplete-input')

const activate = () => {
  autocompleteInputInstance.value?.openSelectDropdown()
}

const onCloseSelectDropdown = async () => {
  await props.context.node.settled

  const onDeactivate = props.context?.onDeactivate
  if (typeof onDeactivate !== 'function') return

  onDeactivate()
}

Object.assign(props.context, {
  actions,
  defaultFilter: '*', // show tag recommendations on initial opening
  emptyInitialLabelText,
  multiple: props.context.multiple ?? true,
  gqlQuery: AutocompleteSearchTagDocument,
  additionalQueryParams: {
    exceptTags: props.context.exclude,
  },
  activate,
})
</script>

<template>
  <FieldAutoCompleteInput
    ref="autocomplete-input"
    :context="context"
    v-bind="$attrs"
    @search-interaction-update="onSearchInteractionUpdate"
    @keydown-filter-input="onKeydownFilterInput"
    @close-select-dropdown="onCloseSelectDropdown"
  />
</template>
