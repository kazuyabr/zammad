import * as Types from '#shared/graphql/types.ts';

import * as Mocks from '#tests/graphql/builders/mocks.ts'
import * as Operations from './userCurrentTaskbarItemUpdate.api.ts'
import * as ErrorTypes from '#shared/types/error.ts'

export function mockUserCurrentTaskbarItemUpdateMutation(defaults: Mocks.MockDefaultsValue<Types.UserCurrentTaskbarItemUpdateMutation, Types.UserCurrentTaskbarItemUpdateMutationVariables>) {
  return Mocks.mockGraphQLResult(Operations.UserCurrentTaskbarItemUpdateDocument, defaults)
}

export function waitForUserCurrentTaskbarItemUpdateMutationCalls() {
  return Mocks.waitForGraphQLMockCalls<Types.UserCurrentTaskbarItemUpdateMutation>(Operations.UserCurrentTaskbarItemUpdateDocument)
}

export function mockUserCurrentTaskbarItemUpdateMutationError(message: string, extensions: {type: ErrorTypes.GraphQLErrorTypes }) {
  return Mocks.mockGraphQLResultWithError(Operations.UserCurrentTaskbarItemUpdateDocument, message, extensions);
}
