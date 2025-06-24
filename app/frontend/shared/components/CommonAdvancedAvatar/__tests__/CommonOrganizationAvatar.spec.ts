// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

import { renderComponent } from '#tests/support/components/index.ts'

import CommonAdvancedAvatar from '../CommonAdvancedAvatar.vue'

describe('CommonAdvancedAvatar', () => {
  it('renders avatar', async () => {
    const view = renderComponent(CommonAdvancedAvatar, {
      props: {
        entity: {
          name: 'Zammad Foundation',
          active: true,
        },
      },
    })

    expect(view.getByIconName('advanced')).toBeInTheDocument()

    await view.rerender({
      entity: {
        name: 'Zammad Foundation',
        active: false,
      },
    })

    expect(view.getByIconName('inactive-advanced')).toBeInTheDocument()
  })
})
