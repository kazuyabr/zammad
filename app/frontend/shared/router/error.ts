// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

import { ref } from 'vue'

import { ErrorStatusCodes } from '#shared/types/error.ts'

import type { NavigationHookAfter, Router } from 'vue-router'

export enum ErrorRouteType {
  PublicError = 'Error',
  AuthenticatedError = 'ErrorTab',
}

export interface ErrorOptions {
  type?: ErrorRouteType
  title: string
  message: string
  statusCode: ErrorStatusCodes
  messagePlaceholder?: string[]
  route?: string
}

const defaultOptions: ErrorOptions = {
  title: __('Not Found'),
  message: __("This page doesn't exist."),
  messagePlaceholder: [],
  statusCode: ErrorStatusCodes.NotFound,
}

export const errorOptions = ref<ErrorOptions>({ ...defaultOptions })

export const errorAfterGuard: NavigationHookAfter = (to) => {
  // we don't want to reset the error in case it was changed inside router hook
  // that way this hook will still fire, but we will keep changed options
  if (!to.query.redirect) {
    errorOptions.value = { ...defaultOptions }
  }
}

export const redirectErrorRoute = (options: Partial<ErrorOptions> = {}) => {
  errorOptions.value = {
    ...defaultOptions,
    ...options,
  }

  return {
    name: options.type ?? ErrorRouteType.PublicError,
    query: {
      redirect: '1',
    },
  }
}

export const redirectToError = (router: Router, options: Partial<ErrorOptions> = {}) =>
  router.replace(redirectErrorRoute(options))
