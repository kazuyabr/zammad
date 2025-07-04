// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/
import Link from '@tiptap/extension-link'
import Mention, { type MentionOptions } from '@tiptap/extension-mention'

import {
  NotificationTypes,
  useNotifications,
} from '#shared/components/CommonNotifications/index.ts'
import buildMentionSuggestion from '#shared/components/Form/fields/FieldEditor/features/suggestions/suggestions.ts'
import type { FormFieldContext } from '#shared/components/Form/types/field.ts'
import { getNodeByName } from '#shared/components/Form/utils.ts'
import { ensureGraphqlId } from '#shared/graphql/utils.ts'
import { QueryHandler } from '#shared/server/apollo/handler/index.ts'
import { useApplicationStore } from '#shared/stores/application.ts'
import { debouncedQuery } from '#shared/utils/helpers.ts'

import { useMentionSuggestionsLazyQuery } from '../graphql/queries/mention/mentionSuggestions.api.ts'

import type { FieldEditorProps, MentionUserItem } from '../types.ts'
import type { CommandProps, MarkConfig, ParentConfig } from '@tiptap/core'
import type { Ref } from 'vue'

export const PLUGIN_NAME = 'mentionUser'
export const PLUGIN_LINK_NAME = 'mentionUserLink'
const ACTIVATOR = '@@'

export default (context: Ref<FormFieldContext<FieldEditorProps>>) => {
  const app = useApplicationStore()
  const queryMentionsHandler = new QueryHandler(
    useMentionSuggestionsLazyQuery({
      query: '',
      groupId: '',
    }),
  )

  const getUserMentions = async (query: string, group: string) => {
    const { data } = await queryMentionsHandler.query({
      variables: {
        query,
        groupId: ensureGraphqlId('Group', group),
      },
    })
    return data?.mentionSuggestions || []
  }

  return Mention.extend({
    name: PLUGIN_NAME,
    addCommands: () => ({
      openUserMention:
        () =>
        // TODO: Check if this explicit typing is needed after the stable release of next TipTap version.
        ({ chain }: CommandProps) =>
          chain().insertContent(` ${ACTIVATOR}`).run(),
    }),
    addOptions() {
      return {
        ...(this as unknown as { parent: () => MentionOptions }).parent?.(),
        permission: 'ticket.agent',
      }
    },
  }).configure({
    suggestion: buildMentionSuggestion({
      activator: ACTIVATOR,
      type: 'user',
      insert(props: MentionUserItem) {
        const { fqdn, http_type: httpType } = app.config
        // app/assets/javascripts/app/lib/base/jquery.textmodule.js:705
        const origin = `${httpType}://${fqdn}`
        const href = `${origin}/#user/profile/${props.internalId}`
        const text = props.fullname || props.email || ''
        return [
          {
            type: 'text',
            text,
            marks: [
              {
                type: PLUGIN_LINK_NAME,
                attrs: {
                  href,
                  target: null,
                  'data-mention-user-id': props.internalId,
                },
              },
            ],
          },
        ]
      },
      items: debouncedQuery(
        async ({ query }) => {
          if (!query) return []
          let { groupId: group } = context.value
          if (!group) {
            const { meta, formId } = context.value
            const groupNodeName = meta?.[PLUGIN_NAME]?.groupNodeName
            if (groupNodeName) {
              const groupNode = getNodeByName(formId, groupNodeName)
              group = groupNode?.value as string
            }
          }
          if (!group) {
            const notifications = useNotifications()
            notifications.notify({
              id: 'mention-user-required-group',
              message: __('Before you mention a user, please select a group.'),
              type: NotificationTypes.Warn,
            })
            return []
          }
          return getUserMentions(query, group)
        },
        [],
        200,
      ),
    }),
  })
}

export const UserLink = Link.extend({
  name: PLUGIN_LINK_NAME,
  addAttributes() {
    return {
      // TODO: Check if this explicit typing is still needed after the stable release of next TipTap version.
      ...(
        this as {
          parent: ParentConfig<MarkConfig<unknown, Storage>>['addAttributes']
        }
      ).parent?.(),
      href: {
        default: null,
      },
      'data-mention-user-id': {
        default: null,
        // TODO: Check if this explicit typing is still needed after the stable release of next TipTap version.
        parseHTML: (element: HTMLElement) => element.dataset.mentionUserId,
        // TODO: Check if this explicit typing is still needed after the stable release of next TipTap version.
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-mention-user-id': attributes['data-mention-user-id'],
        }),
      },
    }
  },
}).configure({
  openOnClick: false,
  autolink: false,
})
