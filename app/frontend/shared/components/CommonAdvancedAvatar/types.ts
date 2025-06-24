// Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

export interface AvatarAdvanced {
  name?: Maybe<string>
  active?: Maybe<boolean>
  vip?: Maybe<boolean>
}

export interface AdvancedAvatarClassMap {
  base: string
  inactive: string
}
