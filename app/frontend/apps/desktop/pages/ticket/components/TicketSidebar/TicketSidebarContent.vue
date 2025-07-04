<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, computed } from 'vue'

import type { ObjectLike } from '#shared/types/utils.ts'

import CommonActionMenu from '#desktop/components/CommonActionMenu/CommonActionMenu.vue'
import type { MenuItem } from '#desktop/components/CommonPopoverMenu/types.ts'
import { useScrollPosition } from '#desktop/composables/useScrollPosition.ts'

interface Props {
  title: string
  icon: string
  entity?: ObjectLike
  actions?: MenuItem[]
  variant?: 'ai'
}

const props = defineProps<Props>()

const scrollPosition = defineModel<number>({
  required: true,
  default: 0,
})

const scrollContainer = useTemplateRef('scroll-container')

const variantClass = computed(() =>
  props.variant === 'ai'
    ? 'ai-stripe before:-bottom-3 before:absolute relative before:left:0 before:right-0'
    : '',
)

const iconClass = computed(() =>
  props.variant === 'ai' ? 'text-blue-800' : 'text-stone-200 dark:text-neutral-500',
)
// Handle scroll position (re)storing of the active sidebar, when navigating between taskbar tabs.
useScrollPosition(scrollContainer)

// Handle scroll position (re)storing, when switching between different sidebars.
onMounted(() => {
  if (!scrollContainer?.value) return
  scrollContainer.value.scrollTop = scrollPosition.value
})

onBeforeUnmount(() => {
  if (!scrollContainer?.value) return
  scrollPosition.value = scrollContainer.value.scrollTop
})
</script>

<template>
  <div class="flex w-full gap-2 p-3">
    <CommonLabel
      tag="h2"
      class="min-h-7 grow gap-1.5"
      :class="variantClass"
      size="large"
      :prefix-icon="icon"
      :icon-color="iconClass"
    >
      {{ $t(title) }}
    </CommonLabel>

    <CommonActionMenu
      v-if="actions"
      class="text-gray-100 dark:text-neutral-400"
      no-single-action-mode
      placement="arrowEnd"
      :entity="entity"
      :actions="actions"
    />
  </div>

  <div ref="scroll-container" class="flex h-full flex-col gap-3 overflow-y-auto p-3">
    <slot />
  </div>
</template>
