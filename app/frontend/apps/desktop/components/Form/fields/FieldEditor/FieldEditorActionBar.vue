<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { nextTick, shallowRef, toRef, ref, defineAsyncComponent, watch } from 'vue'

import CommonPopover from '#shared/components/CommonPopover/CommonPopover.vue'
import { usePopover } from '#shared/components/CommonPopover/usePopover.ts'
import useEditorActionHelper from '#shared/components/Form/fields/FieldEditor/composables/useEditorActionHelper.ts'
import type {
  EditorButton,
  EditorContentType,
  EditorCustomPlugins,
} from '#shared/components/Form/fields/FieldEditor/types.ts'
import type { FormFieldContext } from '#shared/components/Form/types/field.ts'
import type { FieldEditorProps } from '#shared/components/Form/types.ts'
import { useApplicationStore } from '#shared/stores/application.ts'

import useEditorActions from '#desktop//components/Form/fields/FieldEditor/useEditorActions.ts'

import ActionToolbar from './FieldEditorActionBar/ActionToolbar.vue'

import type { Selection } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/vue-3'
import type { Except } from 'type-fest'
import type { Component } from 'vue'

const props = defineProps<{
  editor?: Editor
  contentType: EditorContentType
  visible: boolean
  disabledPlugins: EditorCustomPlugins[]
  formContext?: FormFieldContext<FieldEditorProps>
}>()

defineEmits<{
  hide: [boolean?]
  blur: []
}>()

const AiAssistantTextToolsLoadingBanner = defineAsyncComponent(
  () =>
    import(
      '#shared/components/Form/fields/FieldEditor/features/ai-assistant-text-tools/AiAssistantLoadingBanner/AiAssistantLoadingBanner.vue'
    ),
)

const editor = toRef(props, 'editor')

const hideActionBarLocally = ref(false)

const { isActive } = useEditorActionHelper(editor)

const { actions } = useEditorActions(editor, props.contentType, props.disabledPlugins)

const { popover, popoverTarget, isOpen, open, close } = usePopover()

const subMenuPopoverContent = shallowRef<Component | Except<EditorButton, 'subMenu'>[]>()

let currentSelection: Selection | undefined

watch(isOpen, (isOpen) => {
  if (!popoverTarget.value) return

  const classes = ['bg-blue-800!', 'text-white']

  if (isOpen) {
    popoverTarget.value.classList.add(...classes)
    return
  }
  popoverTarget.value.classList.remove(...classes)
})

const handleButtonClick = (action: EditorButton, event: MouseEvent) => {
  if (!action.subMenu) return

  // Save selection before opening the popover
  if (editor.value && !editor.value.state.selection.empty) {
    currentSelection = editor.value?.state.selection
  }

  subMenuPopoverContent.value = action.subMenu
  popoverTarget.value = event.currentTarget as HTMLDivElement
  popoverTarget.value.id = action.id

  nextTick(() => {
    open()
  })
}

const handleSubMenuClick = () => {
  close()
  editor.value?.commands.focus()

  // Restore selection after closing the popover
  if (editor.value && currentSelection) {
    editor.value.commands.setTextSelection(currentSelection)
    currentSelection = undefined
  }
}

const showAiAssistantTextToolsLoadingBanner = ref(false)

const { config } = storeToRefs(useApplicationStore())

watch(
  () => editor.value?.storage?.showAiTextLoader,
  (showLoader) => {
    showAiAssistantTextToolsLoadingBanner.value = !!showLoader
    hideActionBarLocally.value = !!showLoader
  },
)
</script>

<template>
  <div
    class="sticky top-(--top-header-height) z-30 -order-1 border border-blue-200 bg-neutral-50 ltr:left-0 rtl:right-0 dark:border-gray-700 dark:bg-gray-500"
  >
    <ActionToolbar
      v-show="!hideActionBarLocally"
      :editor="editor"
      :visible="visible"
      :is-active="isActive"
      :actions="actions"
      @click-action="handleButtonClick"
      @blur="$emit('blur')"
      @hide="$emit('hide')"
    />

    <AiAssistantTextToolsLoadingBanner
      v-if="showAiAssistantTextToolsLoadingBanner && config.ai_assistance_text_tools"
      :editor="editor"
    />

    <CommonPopover
      ref="popover"
      :owner="popoverTarget"
      orientation="autoVertical"
      placement="arrowStart"
      hide-arrow
      no-auto-focus
    >
      <template v-if="Array.isArray(subMenuPopoverContent)">
        <ActionToolbar
          :id="popoverTarget?.id"
          data-test-id="sub-menu-action-bar"
          :actions="subMenuPopoverContent"
          :editor="editor"
          :is-active="isActive"
          no-gradient
          @click-action="handleButtonClick"
        />
      </template>
      <component
        :is="subMenuPopoverContent"
        v-else
        :id="popoverTarget?.id"
        ref="sub-menu-popover-content"
        :editor="editor"
        :content-type="contentType"
        :form-context="formContext"
        @action="handleSubMenuClick"
        @close="close"
      />
    </CommonPopover>
  </div>
</template>
