<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { onKeyUp, usePointerSwipe } from '@vueuse/core'
import { nextTick, onMounted, ref, type Events, useTemplateRef } from 'vue'

import { useTrapTab } from '#shared/composables/useTrapTab.ts'
import type { EventHandlers } from '#shared/types/utils.ts'
import stopEvent from '#shared/utils/events.ts'
import { getFirstFocusableElement } from '#shared/utils/getFocusableElements.ts'

import CommonButton from '#mobile/components/CommonButton/CommonButton.vue'
import { closeDialog } from '#mobile/composables/useDialog.ts'

const props = defineProps<{
  name: string
  label?: string
  content?: string
  // don't focus the first element inside a Dialog after being mounted
  // if nothing is focusable, will focus "Done" button
  noAutofocus?: boolean
  listeners?: {
    done?: EventHandlers<Events>
  }
}>()

const emit = defineEmits<{
  close: []
}>()

const PX_SWIPE_CLOSE = -150

const top = ref('0')
const dialogElement = useTemplateRef('dialog')
const contentElement = useTemplateRef('content')

const close = async () => {
  emit('close')
  await closeDialog(props.name)
}

const canCloseDialog = () => {
  const currentDialog = dialogElement.value
  if (!currentDialog) {
    return false
  }
  // close dialog only if this is the last one opened
  const dialogs = document.querySelectorAll('[data-common-dialog]')
  return dialogs[dialogs.length - 1] === currentDialog
}

onKeyUp('Escape', (e) => {
  if (canCloseDialog()) {
    stopEvent(e)
    close()
  }
})

const { distanceY, isSwiping } = usePointerSwipe(dialogElement, {
  onSwipe() {
    if (distanceY.value < 0) {
      const distance = Math.abs(distanceY.value)
      top.value = `${distance}px`
    } else {
      top.value = '0'
    }
  },
  onSwipeEnd() {
    if (distanceY.value <= PX_SWIPE_CLOSE) {
      close()
    } else {
      top.value = '0'
    }
  },
  pointerTypes: ['touch', 'pen'],
})

useTrapTab(dialogElement)

onMounted(() => {
  if (props.noAutofocus) return

  // will try to find focusable element inside dialog
  // if it won't find it, will try to find inside the header
  // most likely will find "Done" button
  const firstFocusable =
    getFirstFocusableElement(contentElement.value) || getFirstFocusableElement(dialogElement.value)

  nextTick(() => {
    firstFocusable?.focus()
    firstFocusable?.scrollIntoView({ block: 'nearest' })
  })
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="`dialog-${name}`"
    class="fixed inset-0 z-10 flex overflow-y-auto"
    :aria-label="$t(label || name)"
    role="dialog"
  >
    <div
      ref="dialog"
      data-common-dialog
      class="flex h-full grow flex-col overflow-x-hidden bg-black"
      :class="{ 'transition-all duration-200 ease-linear': !isSwiping }"
      :style="{ transform: `translateY(${top})` }"
    >
      <div class="bg-gray-150/40 mx-4 h-2.5 shrink-0 rounded-t-xl" />
      <div
        class="relative flex h-16 shrink-0 items-center justify-center rounded-t-xl bg-gray-600/80 select-none"
      >
        <div
          class="absolute top-0 bottom-0 flex items-center ltr:left-0 ltr:pl-4 rtl:right-0 rtl:pr-4"
        >
          <slot name="before-label" />
        </div>
        <div
          class="line-clamp-2 max-w-[65%] text-center text-base leading-[19px] font-semibold text-white"
        >
          <slot name="label">
            {{ $t(label) }}
          </slot>
        </div>
        <div
          class="absolute top-0 bottom-0 flex items-center ltr:right-0 ltr:pr-4 rtl:left-0 rtl:pl-4"
        >
          <slot name="after-label">
            <CommonButton
              class="grow"
              variant="primary"
              transparent-background
              v-bind="listeners?.done"
              @pointerdown.stop
              @click="close()"
              @keypress.space.prevent="close()"
            >
              {{ $t('Done') }}
            </CommonButton>
          </slot>
        </div>
      </div>
      <div
        ref="content"
        v-bind="$attrs"
        class="flex grow flex-col items-start overflow-y-auto bg-black text-white"
      >
        <slot>{{ content }}</slot>
      </div>
    </div>
  </div>
</template>
