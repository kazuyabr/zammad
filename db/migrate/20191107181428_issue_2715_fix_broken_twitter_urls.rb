# Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

class Issue2715FixBrokenTwitterUrls < ActiveRecord::Migration[5.2]
  STATUS_TEMPLATE = 'https://twitter.com/_/status/%{message_id}'.freeze
  DM_TEMPLATE = 'https://twitter.com/messages/%{recipient_id}-%{sender_id}'.freeze

  def up
    return if !Setting.exists?(name: 'system_init_done')

    Ticket::Article.joins(:type)
                   .where(ticket_article_types: { name: ['twitter status', 'twitter direct-message'] })
                   .reorder(created_at: :desc)
                   .limit(10_000)
                   .find_each { |article| fix_broken_links(article) }
  end

  private

  def fix_broken_links(article)
    type = Ticket::Article::Type.lookup(id: article.type_id).name

    article.preferences[:links]&.each do |link|
      link[:url] = case type
                   when 'twitter status'
                     STATUS_TEMPLATE % article.attributes.symbolize_keys
                   when 'twitter direct-message'
                     DM_TEMPLATE % article.preferences[:twitter].symbolize_keys
                   end
    end

    article.save!
  end
end
