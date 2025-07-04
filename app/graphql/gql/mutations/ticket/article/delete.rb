# Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

module Gql::Mutations
  class Ticket::Article::Delete < BaseMutation
    description 'Deletes ticket article if eligible'

    argument :article_id, GraphQL::Types::ID, loads: Gql::Types::Ticket::ArticleType, loads_pundit_method: :destroy?, description: 'The article to be updated'
    field :success, Boolean, null: false, description: 'Was the ticket article deletion successful?'

    def resolve(article:)
      article.destroy!

      { success: true }
    end
  end
end
