# Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

module Gql::Mutations
  class Ticket::SharedDraft::Start::Delete < BaseMutation
    description 'Deletes ticket shared draft'

    argument :shared_draft_id, GraphQL::Types::ID, loads: Gql::Types::Ticket::SharedDraftStartType, loads_pundit_method: :destroy?, description: 'The draft to be deleted'

    field :success, Boolean, null: false, description: 'Was the ticket article deletion successful?'

    def resolve(shared_draft:)
      shared_draft.destroy!

      { success: true }
    end
  end
end
