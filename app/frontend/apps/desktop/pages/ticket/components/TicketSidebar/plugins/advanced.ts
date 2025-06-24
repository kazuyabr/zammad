import {
  TicketSidebarScreenType,
  type TicketSidebarContext,
} from '#desktop/pages/ticket/types/sidebar.ts'

import TicketSidebarAdvanced from '../TicketSidebarAdvanced/TicketSidebarAdvanced.vue'
import type { TicketSidebarPlugin } from './types.ts'

console.log('Plugin Advanced carregado!');

export default <TicketSidebarPlugin>{
  title: __('Advanced'),
  component: TicketSidebarAdvanced,
  permissions: [],
  screens: [TicketSidebarScreenType.TicketDetailView],
  icon: 'ticket',
  order: 1200,
  available: (context: TicketSidebarContext) => true,
} 