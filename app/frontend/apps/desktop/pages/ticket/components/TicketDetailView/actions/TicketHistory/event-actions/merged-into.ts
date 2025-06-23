// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

import type { Ticket } from '#shared/graphql/types.ts'

import HistoryEventDetailsMerge from '../HistoryEventDetails/HistoryEventDetailsMerge.vue'

import type { EventActionModule } from '../types.ts'

export default <EventActionModule>{
  name: 'merged-into',
  actionName: 'merged-into',
  component: HistoryEventDetailsMerge,
  content: (event) => {
    const ticket = event.object as Ticket

    const details = `#${ticket.number}`

    return {
      details,
      link: `/tickets/${ticket.internalId}`,
    }
  },
}
