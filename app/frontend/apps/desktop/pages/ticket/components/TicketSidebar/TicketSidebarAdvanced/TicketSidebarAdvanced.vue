<!-- Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
// --- INÍCIO: Lógica comentada para futura implementação guiada ---
// import { watch, computed } from 'vue'
// import { useUserQuery } from '#shared/entities/user/graphql/queries/user.api.ts'
// import QueryHandler from '#shared/server/apollo/handler/QueryHandler.ts'
// import TicketSidebarAdvancedContent from './TicketSidebarAdvancedContent.vue'
//
// const customerId = computed(() => Number(props.context.formValues.customer_id))
//
// const userQuery = new QueryHandler(
//   useUserQuery(
//     () => ({
//       userInternalId: customerId.value,
//       secondaryAdvancedsCount: 3,
//     }),
//     () => ({ enabled: Boolean(customerId.value), fetchPolicy: 'cache-first' }),
//   ),
// )
//
// const userResult = userQuery.result()
// const customer = computed(() => userResult.value?.user)
//
// watch(
//   customer,
//   (newValue) => {
//     if (!newValue?.advanced) {
//       emit('hide')
//       return
//     }
//     emit('show')
//   },
//   {
//     immediate: true,
//   },
// )
//
// const advancedInternalId = computed(() => {
//   if (props.context.formValues?.advanced_id)
//     return Number(props.context.formValues?.advanced_id)
//   return customer.value?.advanced?.internalId
// })
//
// const { advanced, advancedMembers, objectAttributes, loadAllMembers } =
//   useAdvancedDetail(advancedInternalId)
// --- FIM: Lógica comentada para futura implementação guiada ---

import { usePersistentStates } from '#desktop/pages/ticket/composables/usePersistentStates.ts'
import type { TicketSidebarProps, TicketSidebarEmits } from '#desktop/pages/ticket/types/sidebar.ts'
import TicketSidebarWrapper from '../TicketSidebarWrapper.vue'

const props = defineProps<TicketSidebarProps>()
const { persistentStates } = usePersistentStates()
const emit = defineEmits<TicketSidebarEmits>()

console.log('Componente Sidebar Avançada carregado!');
</script>

<template>
  <TicketSidebarWrapper
    :key="sidebar"
    :sidebar="sidebar"
    :sidebar-plugin="sidebarPlugin"
    :selected="selected"
  >
    <!-- Placeholder visível. Para implementar lógica futura, descomente e adapte o bloco abaixo -->
    <!--
    <TicketSidebarAdvancedContent
      v-if="advanced"
      v-model="persistentStates"
      :context="context"
      :sidebar-plugin="sidebarPlugin"
      :advanced="advanced"
      :advanced-members="advancedMembers"
      :object-attributes="objectAttributes"
      @load-more-members="loadAllMembers"
    />
    -->
    <div style="padding: 16px;">
      <h2>Sidebar Avançada</h2>
      <p>Este é um placeholder para customizações futuras.</p>
    </div>
  </TicketSidebarWrapper>
</template>
