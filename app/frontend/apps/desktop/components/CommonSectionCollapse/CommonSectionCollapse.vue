<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { computed, watch } from 'vue'

import CollapseButton from '#desktop/components/CollapseButton/CollapseButton.vue'
import { useCollapseHandler } from '#desktop/components/CollapseButton/useCollapseHandler.ts'
import { useTransitionCollapse } from '#desktop/composables/useTransitionCollapse.ts'

export interface Props {
  id: string
  title?: string
  size?: 'small' | 'large'
  noCollapse?: boolean
  noNegativeMargin?: boolean
  noHeader?: boolean
  scrollable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
})

const modelValue = defineModel<boolean>({
  default: false,
})

const emit = defineEmits<{
  collapse: [boolean]
  expand: [boolean]
}>()

const headerId = computed(() => `${props.id}-header`)

const { toggleCollapse, isCollapsed } = useCollapseHandler(emit)

const { collapseDuration, collapseEnter, collapseAfterEnter, collapseLeave } =
  useTransitionCollapse()

watch(
  modelValue,
  (newValue) => {
    if (isCollapsed.value === newValue) return

    isCollapsed.value = newValue
  },
  {
    immediate: true,
  },
)

watch(
  isCollapsed,
  (newValue) => {
    if (modelValue.value === newValue) return

    modelValue.value = newValue
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <!--  eslint-disable vuejs-accessibility/no-static-element-interactions-->
  <div class="flex flex-col gap-1" :class="{ 'overflow-y-auto outline-none': scrollable }">
    <header
      v-if="!noHeader"
      :id="headerId"
      class="group flex cursor-default items-center justify-between text-stone-200 group-focus-within:focus-visible:outline-1 has-focus-visible:outline-1 has-focus-visible:outline-offset-1 has-focus-visible:outline-blue-800 dark:text-neutral-500"
      :class="{
        'cursor-pointer rounded-md hover:bg-blue-600 hover:text-black dark:hover:bg-blue-900 hover:dark:text-white':
          !noCollapse,
        'px-1 py-0.5': size === 'small',
        '-mx-1': size === 'small' && !noNegativeMargin,
        'px-2 py-2.5': size === 'large',
        '-mx-2': size === 'large' && !noNegativeMargin,
      }"
      @click="!noCollapse && toggleCollapse()"
      @keydown.enter="!noCollapse && toggleCollapse()"
    >
      <slot name="title">
        <CommonLabel class="grow text-current! select-none" :size="size" tag="h3">
          {{ $t(title) }}
        </CommonLabel>
      </slot>

      <CollapseButton
        v-if="!noCollapse"
        :collapsed="isCollapsed"
        :owner-id="id"
        no-padded
        class="group-hover:text-black! group-hover:opacity-100 focus-visible:text-black dark:group-hover:text-white!"
        :class="{ 'opacity-100': isCollapsed }"
        orientation="vertical"
        @keydown.enter="toggleCollapse()"
      />
    </header>
    <Transition
      name="collapse"
      :duration="collapseDuration"
      @enter="collapseEnter"
      @after-enter="collapseAfterEnter"
      @leave="collapseLeave"
    >
      <div
        v-show="!isCollapsed || noHeader"
        :id="id"
        :data-test-id="id"
        :class="{ 'overflow-y-auto outline-none': scrollable }"
      >
        <slot :header-id="headerId" />
      </div>
    </Transition>
  </div>
</template>
