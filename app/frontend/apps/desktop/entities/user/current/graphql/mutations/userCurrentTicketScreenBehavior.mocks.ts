import * as Types from '#shared/graphql/types.ts';

import * as Mocks from '#tests/graphql/builders/mocks.ts'
import * as Operations from './userCurrentTicketScreenBehavior.api.ts'
import * as ErrorTypes from '#shared/types/error.ts'

export function mockUserCurrentTicketScreenBehaviorMutation(defaults: Mocks.MockDefaultsValue<Types.UserCurrentTicketScreenBehaviorMutation, Types.UserCurrentTicketScreenBehaviorMutationVariables>) {
  return Mocks.mockGraphQLResult(Operations.UserCurrentTicketScreenBehaviorDocument, defaults)
}

export function waitForUserCurrentTicketScreenBehaviorMutationCalls() {
  return Mocks.waitForGraphQLMockCalls<Types.UserCurrentTicketScreenBehaviorMutation>(Operations.UserCurrentTicketScreenBehaviorDocument)
}

export function mockUserCurrentTicketScreenBehaviorMutationError(message: string, extensions: {type: ErrorTypes.GraphQLErrorTypes }) {
  return Mocks.mockGraphQLResultWithError(Operations.UserCurrentTicketScreenBehaviorDocument, message, extensions);
}
