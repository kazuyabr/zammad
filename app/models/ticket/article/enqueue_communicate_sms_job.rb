# Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

# Schedules a backgrond communication job for new SMS articles.
module Ticket::Article::EnqueueCommunicateSmsJob
  extend ActiveSupport::Concern

  included do
    after_create_commit :ticket_article_enqueue_communicate_sms_job
  end

  private

  def ticket_article_enqueue_communicate_sms_job

    # return if we run import mode
    return true if Setting.get('import_mode')

    # if sender is customer, do not communicate
    return true if !sender_id

    sender = Ticket::Article::Sender.lookup(id: sender_id)
    return true if sender.nil?
    return true if sender.name == 'Customer'

    # only apply on sms
    return true if !type_id

    type = Ticket::Article::Type.lookup(id: type_id)
    return true if type.nil?
    return true if type.name != 'sms'

    CommunicateSmsJob.perform_later(id)
  end
end
