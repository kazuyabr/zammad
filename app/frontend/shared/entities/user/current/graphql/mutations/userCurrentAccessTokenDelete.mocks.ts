import * as Types from '#shared/graphql/types.ts';

import * as Mocks from '#tests/graphql/builders/mocks.ts'
import * as Operations from './userCurrentAccessTokenDelete.api.ts'
import * as ErrorTypes from '#shared/types/error.ts'

export function mockUserCurrentAccessTokenDeleteMutation(defaults: Mocks.MockDefaultsValue<Types.UserCurrentAccessTokenDeleteMutation, Types.UserCurrentAccessTokenDeleteMutationVariables>) {
  return Mocks.mockGraphQLResult(Operations.UserCurrentAccessTokenDeleteDocument, defaults)
}

export function waitForUserCurrentAccessTokenDeleteMutationCalls() {
  return Mocks.waitForGraphQLMockCalls<Types.UserCurrentAccessTokenDeleteMutation>(Operations.UserCurrentAccessTokenDeleteDocument)
}

export function mockUserCurrentAccessTokenDeleteMutationError(message: string, extensions: {type: ErrorTypes.GraphQLErrorTypes }) {
  return Mocks.mockGraphQLResultWithError(Operations.UserCurrentAccessTokenDeleteDocument, message, extensions);
}
