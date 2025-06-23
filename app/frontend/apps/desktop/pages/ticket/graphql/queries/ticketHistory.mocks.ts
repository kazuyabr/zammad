import * as Types from '#shared/graphql/types.ts';

import * as Mocks from '#tests/graphql/builders/mocks.ts'
import * as Operations from './ticketHistory.api.ts'
import * as ErrorTypes from '#shared/types/error.ts'

export function mockTicketHistoryQuery(defaults: Mocks.MockDefaultsValue<Types.TicketHistoryQuery, Types.TicketHistoryQueryVariables>) {
  return Mocks.mockGraphQLResult(Operations.TicketHistoryDocument, defaults)
}

export function waitForTicketHistoryQueryCalls() {
  return Mocks.waitForGraphQLMockCalls<Types.TicketHistoryQuery>(Operations.TicketHistoryDocument)
}

export function mockTicketHistoryQueryError(message: string, extensions: {type: ErrorTypes.GraphQLErrorTypes }) {
  return Mocks.mockGraphQLResultWithError(Operations.TicketHistoryDocument, message, extensions);
}
