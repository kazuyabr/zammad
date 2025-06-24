// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

import type { AdvancedAvatarClassMap } from '#shared/components/CommonAdvancedAvatar/types.ts'

// Provide your own map with the following keys, the values given here are just examples.
let advancedAvatarClasses: AdvancedAvatarClassMap = {
  base: 'common-advanced-avatar-base',
  inactive: 'common-advanced-avatar-inactive',
}

export const initializeAdvancedAvatarClasses = (classes: AdvancedAvatarClassMap) => {
  advancedAvatarClasses = classes
}

export const getAdvancedAvatarClasses = () => advancedAvatarClasses
