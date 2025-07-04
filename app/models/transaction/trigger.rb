# Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

class Transaction::Trigger

=begin
  {
    object: 'Ticket',
    type: 'update',
    object_id: 123,
    interface_handle: 'application_server', # application_server|websocket|scheduler
    changes: {
      'attribute1' => [before, now],
      'attribute2' => [before, now],
    },
    created_at: Time.zone.now,
    user_id: 123,
  },
=end

  def initialize(item, params = {})
    @item = item
    @params = params
  end

  def perform
    # return if we run import mode
    return if Setting.get('import_mode')

    return if @item[:object] != 'Ticket'

    ticket = Ticket.find_by(id: @item[:object_id])
    return if !ticket

    if @item[:article_id]
      article = Ticket::Article.find_by(id: @item[:article_id])
    end

    original_user_id = UserInfo.current_user_id

    Ticket.perform_triggers(ticket, article, triggers_scope, @item, @params)
    UserInfo.current_user_id = original_user_id
  end

  private

  def triggers_scope
    ::Trigger
      .activated_by(trigger_activator)
      .reorder(Arel.sql('LOWER(name)'))
  end

  def trigger_activator
    :action
  end
end
