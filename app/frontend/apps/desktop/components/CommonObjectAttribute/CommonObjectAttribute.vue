<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
interface Props {
  label?: string
  body?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <CommonLabel size="small" class="text-stone-200! dark:text-neutral-500!">
      {{ $t(label) }}
    </CommonLabel>

    <CommonLabel tag="div" size="medium" class="break-word text-gray-100! dark:text-neutral-400!">
      <slot>{{ body }}</slot>
    </CommonLabel>
  </div>
</template>
