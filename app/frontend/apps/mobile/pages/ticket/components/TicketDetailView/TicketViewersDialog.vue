<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { toRef } from 'vue'

import { useTicketLiveUsersDisplay } from '#shared/entities/ticket/composables/useTicketLiveUsersDisplay.ts'
import type { TicketLiveAppUser } from '#shared/entities/ticket/types.ts'

import CommonDialog from '#mobile/components/CommonDialog/CommonDialog.vue'
import CommonSectionMenu from '#mobile/components/CommonSectionMenu/CommonSectionMenu.vue'

import TicketViewerItem from './TicketViewerItem.vue'

interface Props {
  name: string
  liveUsers: TicketLiveAppUser[]
}

const props = defineProps<Props>()

const { viewingUsers, idleUsers } = useTicketLiveUsersDisplay(toRef(() => props.liveUsers))
</script>

<template>
  <CommonDialog :name="name" :label="__('Ticket viewers')" class="w-full p-4 text-sm">
    <CommonSectionMenu
      v-if="viewingUsers.length > 0"
      class="shrink-0 gap-3 py-2"
      :header-label="__('Viewing ticket')"
    >
      <TicketViewerItem
        v-for="(viewingUser, index) in viewingUsers"
        :key="`${index}-${viewingUser.user.id}`"
        :user="viewingUser.user"
        :editing="viewingUser.editing"
        :app="viewingUser.app"
      />
    </CommonSectionMenu>
    <CommonSectionMenu
      v-if="idleUsers.length > 0"
      class="shrink-0 gap-3 py-2"
      :header-label="__('Opened in tabs')"
      :help="__('Has ticket open in tabs, but is not actively looking at the ticket.')"
    >
      <TicketViewerItem
        v-for="(idleUser, index) in idleUsers"
        :key="`${index}-${idleUser.user.id}`"
        :user="idleUser.user"
        :editing="idleUser.editing"
        :app="idleUser.app"
        idle
      />
    </CommonSectionMenu>
  </CommonDialog>
</template>
