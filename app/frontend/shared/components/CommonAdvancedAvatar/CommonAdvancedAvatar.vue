<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { computed } from 'vue'

import { getAdvancedAvatarClasses } from '#shared/initializer/initializeAdvancedAvatarClasses.ts'

import CommonAvatar from '../CommonAvatar/CommonAvatar.vue'

import type { AvatarAdvanced } from './types.ts'
import type { AvatarSize } from '../CommonAvatar/index.ts'

export interface Props {
  entity: AvatarAdvanced
  size?: AvatarSize
}

const props = defineProps<Props>()

const icon = computed(() => {
  return props.entity.active ? 'advanced' : 'inactive-advanced'
})

const { base, inactive } = getAdvancedAvatarClasses()
</script>

<template>
  <CommonAvatar
    :class="[
      base,
      {
        [inactive]: !entity.active,
      },
    ]"
    :size="size"
    :icon="icon"
    :aria-label="`Avatar (${entity.name})`"
    :vip-icon="entity.vip ? 'vip-advanced' : undefined"
  />
</template>
