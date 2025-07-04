// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

import { storeToRefs } from 'pinia'
import { computed, type ComputedRef, ref, type Ref } from 'vue'

import { useUserQuery } from '#shared/entities/user/graphql/queries/user.api.ts'
import { useUserObjectAttributesStore } from '#shared/entities/user/stores/objectAttributes.ts'
import { UserUpdatesDocument } from '#shared/graphql/subscriptions/userUpdates.api.ts'
import type {
  UserUpdatesSubscriptionVariables,
  UserUpdatesSubscription,
} from '#shared/graphql/types.ts'
import { QueryHandler } from '#shared/server/apollo/handler/index.ts'
import type { GraphQLHandlerError } from '#shared/types/error.ts'
import { normalizeEdges } from '#shared/utils/helpers.ts'

import type { WatchQueryFetchPolicy } from '@apollo/client/core'

export const useUserDetail = (
  userId: Ref<string | undefined> | ComputedRef<string | undefined>,
  errorCallback?: (error: GraphQLHandlerError) => boolean,
  fetchPolicy?: WatchQueryFetchPolicy,
) => {
  const fetchSecondaryOrganizationsCount = ref<Maybe<number>>(3)

  const userQuery = new QueryHandler(
    useUserQuery(
      () => ({
        userId: userId.value,
        secondaryOrganizationsCount: 3,
      }),
      () => ({ enabled: Boolean(userId.value), fetchPolicy }),
    ),
    {
      errorCallback,
    },
  )

  userQuery.subscribeToMore<UserUpdatesSubscriptionVariables, UserUpdatesSubscription>(() => ({
    document: UserUpdatesDocument,
    variables: {
      userId: userId.value!,
      secondaryOrganizationsCount: fetchSecondaryOrganizationsCount.value,
    },
  }))

  const loadAllSecondaryOrganizations = () => {
    userQuery
      .refetch({
        userId: userId.value,
        secondaryOrganizationsCount: null,
      })
      .then(() => {
        fetchSecondaryOrganizationsCount.value = null
      })
  }

  const userResult = userQuery.result()
  const loading = userQuery.loading()

  const user = computed(() => userResult.value?.user)

  const { viewScreenAttributes } = storeToRefs(useUserObjectAttributesStore())

  const secondaryOrganizations = computed(() => normalizeEdges(user.value?.secondaryOrganizations))

  return {
    loading,
    user,
    userQuery,
    objectAttributes: viewScreenAttributes,
    secondaryOrganizations,
    loadAllSecondaryOrganizations,
  }
}
