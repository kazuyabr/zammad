import * as Types from '#shared/graphql/types.ts';

import * as Mocks from '#tests/graphql/builders/mocks.ts'
import * as Operations from './userCurrentDevicesUpdates.api.ts'
import * as ErrorTypes from '#shared/types/error.ts'

export function getUserCurrentDevicesUpdatesSubscriptionHandler() {
  return Mocks.getGraphQLSubscriptionHandler<Types.UserCurrentDevicesUpdatesSubscription>(Operations.UserCurrentDevicesUpdatesDocument)
}
