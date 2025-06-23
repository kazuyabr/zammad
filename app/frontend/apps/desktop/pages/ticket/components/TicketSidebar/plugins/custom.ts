// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

import CustomSidebarTab from '../CustomSidebarTab.vue'
import { TicketSidebarScreenType } from '#desktop/pages/ticket/types/sidebar.ts'
import type { TicketSidebarPlugin } from './types.ts'

export default <TicketSidebarPlugin>{
  title: __('Ticket'), // Mesmo título da aba principal
  component: CustomSidebarTab,
  permissions: ['ticket.agent'],
  screens: [TicketSidebarScreenType.TicketDetailView],
  icon: 'ticket', // Mesmo ícone da aba principal
  order: 9999, // Coloca a aba no final
  available: () => true, // Sempre disponível
} 