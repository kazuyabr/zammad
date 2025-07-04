// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

import { ApolloLink, createHttpLink, from } from '@apollo/client/core'
import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { removeTypenameFromVariables } from '@apollo/client/link/remove-typename'
import { getMainDefinition } from '@apollo/client/utilities'
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink'

import { consumer } from '#shared/server/action_cable/consumer.ts'

import connectedStateLink from './link/connectedState.ts'
import csrfLink from './link/csrf.ts'
import debugLink from './link/debug.ts'
import errorLink from './link/error.ts'
import setAuthorizationLink from './link/setAuthorization.ts'
import testFlagsLink from './link/testFlags.ts'
import getBatchContext from './utils/getBatchContext.ts'
import getWebsocketContext from './utils/getWebsocketContext.ts'

import type { Operation } from '@apollo/client/core'
import type { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql'

// Should subsequent HTTP calls be batched together?
const enableBatchLink = true

// Should queries and mutations be sent over ActionCable?
const enableQueriesOverWebsocket = false

const connectionSettings = {
  uri: '/graphql',
  credentials: 'same-origin', // Must have for CSRF validation via Rails.
}

const noBatchLink = createHttpLink(connectionSettings)

const batchLink = new BatchHttpLink({
  ...connectionSettings,
  batchMax: 5,
  batchInterval: 20,
})

const operationIsLoginLogout = (definition: OperationDefinitionNode | FragmentDefinitionNode) => {
  return !!(
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'mutation' &&
    definition.name?.value &&
    ['login', 'logout'].includes(definition.name?.value)
  )
}

const requiresBatchLink = (op: Operation) => {
  if (!enableBatchLink) return false

  const definition = getMainDefinition(op.query)

  if (definition.kind === 'OperationDefinition' && definition.operation === 'mutation') {
    return false
  }

  const batchContext = getBatchContext(op)

  return batchContext.active
}

const httpLink = ApolloLink.split(requiresBatchLink, batchLink, noBatchLink)

const requiresHttpLink = (op: Operation) => {
  const definition = getMainDefinition(op.query)

  const websocketContext = getWebsocketContext(op)

  if (!enableQueriesOverWebsocket) {
    // Only subscriptions over websocket.
    return (
      !(definition.kind === 'OperationDefinition' && definition.operation === 'subscription') &&
      !websocketContext.active
    )
  }

  // Everything over websocket except login/logout as that changes cookies.
  return operationIsLoginLogout(definition)
}

const actionCableLink = new ActionCableLink({ cable: consumer })

const splitLink = ApolloLink.split(requiresHttpLink, httpLink, actionCableLink)

const link = from([
  ...(VITE_TEST_MODE ? [testFlagsLink] : []),
  csrfLink,
  errorLink,
  setAuthorizationLink,
  debugLink,
  connectedStateLink,
  removeTypenameFromVariables(),
  splitLink,
])

export default link
