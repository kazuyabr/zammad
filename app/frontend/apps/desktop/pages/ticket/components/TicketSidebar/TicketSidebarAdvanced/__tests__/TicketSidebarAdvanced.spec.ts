// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

import { renderComponent } from '#tests/support/components/index.ts'
import { mockRouterHooks } from '#tests/support/mock-vue-router.ts'
import { waitForNextTick } from '#tests/support/utils.ts'

import {
  mockUserQuery,
  waitForUserQueryCalls,
} from '#shared/entities/user/graphql/queries/user.mocks.ts'

import { TicketSidebarScreenType } from '../../../../types/sidebar.ts'
import advancedSidebarPlugin from '../../plugins/advanced.ts'
import TicketSidebarAdvanced from '../TicketSidebarAdvanced.vue'

mockRouterHooks()
const renderTicketSidebarAdvanced = async (
  context: {
    formValues: Record<string, unknown>
  },
  options: any = {},
) => {
  const result = renderComponent(TicketSidebarAdvanced, {
    props: {
      sidebar: 'advanced',
      sidebarPlugin: advancedSidebarPlugin,
      selected: true,
      context: {
        screenType: TicketSidebarScreenType.TicketCreate,
        ...context,
      },
    },
    router: true,
    global: {
      stubs: {
        teleport: true,
      },
    },
    ...options,
  })

  if (context.formValues.customer_id) await waitForUserQueryCalls()

  return result
}

describe('TicketSidebarAdvanced.vue', () => {
  it('shows sidebar when customer ID is present', async () => {
    const wrapper = await renderTicketSidebarAdvanced({
      formValues: {
        customer_id: 2,
      },
    })

    await waitForNextTick()

    expect(wrapper.emitted('show')).toHaveLength(1)
  })

  it('does not show sidebar when customer ID is absent', async () => {
    const wrapper = await renderTicketSidebarAdvanced({
      formValues: {
        customer_id: null,
      },
    })

    await waitForNextTick()

    expect(wrapper.emitted('show')).toBeUndefined()
  })

  it('hides sidebar when customer was not found', async () => {
    mockUserQuery({
      user: null,
    })

    const wrapper = await renderTicketSidebarAdvanced({
      formValues: {
        customer_id: 999,
      },
    })

    expect(wrapper.emitted('hide')).toHaveLength(1) // immediate: true
  })

  it('hides sidebar when customer has no advanced', async () => {
    mockUserQuery({
      user: {
        firstname: 'Nicole',
        lastname: 'Braun',
        fullname: 'Nicole Braun',
        image: null,
        email: 'nicole.braun@zammad.org',
        advanced: null,
        vip: false,
        ticketsCount: {
          open: 42,
          closed: 10,
        },
      },
    })

    const wrapper = await renderTicketSidebarAdvanced({
      formValues: {
        customer_id: 2,
      },
    })

    expect(wrapper.emitted('hide')).toHaveLength(1) // immediate: true
  })
})
