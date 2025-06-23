import * as Types from '#shared/graphql/types.ts';

import * as Mocks from '#tests/graphql/builders/mocks.ts'
import * as Operations from './linkUpdates.api.ts'
import * as ErrorTypes from '#shared/types/error.ts'

export function getLinkUpdatesSubscriptionHandler() {
  return Mocks.getGraphQLSubscriptionHandler<Types.LinkUpdatesSubscription>(Operations.LinkUpdatesDocument)
}
