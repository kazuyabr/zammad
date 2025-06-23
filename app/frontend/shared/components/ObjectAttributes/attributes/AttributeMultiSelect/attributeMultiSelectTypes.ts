// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

import type { ObjectAttribute } from '#shared/entities/object-attributes/types/store.ts'

export interface ObjectAttributeMultiSelect extends ObjectAttribute {
  dataType: 'multiselect' | 'multi_tree_select'
  dataOption: {
    historical_options?: Record<string, string>
    linktemplate: string
    maxlength: number
    null: boolean
    nulloption: boolean
    translate?: boolean
    relation: string
    // array for multi_tree_select
    // irrelevant for displaying
    options: Record<string, string> | Record<string, string>[]
  }
}
