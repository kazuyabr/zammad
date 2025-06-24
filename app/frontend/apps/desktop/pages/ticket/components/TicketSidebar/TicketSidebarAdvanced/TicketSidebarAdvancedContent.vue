<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script lang="ts" setup>
import type { AvatarAdvanced } from '#shared/components/CommonAdvancedAvatar'
import CommonAdvancedAvatar from '#shared/components/CommonAdvancedAvatar/CommonAdvancedAvatar.vue'
import ObjectAttributes from '#shared/components/ObjectAttributes/ObjectAttributes.vue'
import type { ObjectAttribute } from '#shared/entities/object-attributes/types/store.ts'
// import type { AdvancedQuery, User } from '#shared/graphql/types.ts'
import type { ObjectLike } from '#shared/types/utils.ts'
import { normalizeEdges } from '#shared/utils/helpers.ts'

import type { MenuItem } from '#desktop/components/CommonPopoverMenu/types.ts'
import CommonSimpleEntityList from '#desktop/components/CommonSimpleEntityList/CommonSimpleEntityList.vue'
import { EntityType } from '#desktop/components/CommonSimpleEntityList/types.ts'
import type { TicketSidebarContentProps } from '#desktop/pages/ticket/types/sidebar.ts'

import TicketSidebarContent from '../TicketSidebarContent.vue'

interface Props extends TicketSidebarContentProps {
  // advanced: AdvancedQuery['advanced']
  advanced: any
  advancedMembers: ReturnType<typeof normalizeEdges<Partial<User>>>
  objectAttributes: ObjectAttribute[]
}

defineProps<Props>()

const persistentStates = defineModel<ObjectLike>({ required: true })

defineEmits<{
  'load-more-members': []
}>()

const actions: MenuItem[] = [
  {
    key: 'edit-advanced',
    label: __('Edit Advanced'),
    icon: 'advanced-edit',
    show: (entity) => entity?.policy.update,
    onClick: (id) => {
      console.log(id, 'Edit advanced')
    },
  },
]
</script>

<template>
  <!-- <TicketSidebarContent
    v-model="persistentStates.scrollPosition"
    :title="sidebarPlugin.title"
    :icon="sidebarPlugin.icon"
    :entity="advanced"
    :actions="actions"
  >
    <CommonLink :link="`/advanceds/${advanced.internalId}`" class="flex gap-2">
      <CommonAdvancedAvatar
        class="p-3.5"
        :entity="advanced as AvatarAdvanced"
        size="normal"
      />
      <CommonLabel size="large" class="dark:text-white!">{{ advanced.name }} </CommonLabel>
    </CommonLink>

    <ObjectAttributes
      :object="advanced"
      :attributes="objectAttributes"
      :skip-attributes="['name', 'vip', 'active']"
    />

    <CommonSimpleEntityList
      id="advanced-members"
      v-model="persistentStates.collapseMembers"
      :type="EntityType.User"
      :label="__('Members')"
      :entity="advancedMembers"
      @load-more="$emit('load-more-members')"
    />
  </TicketSidebarContent> -->
  <TicketSidebarContent>
    <h1>Olá Mundo!</h1>
  </TicketSidebarContent>
</template>
