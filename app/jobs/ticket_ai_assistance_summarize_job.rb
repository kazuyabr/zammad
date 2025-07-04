# Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

class TicketAIAssistanceSummarizeJob < AIJob
  include HasActiveJobLock

  def lock_key
    "#{self.class.name}/#{arguments[0].id}/#{arguments[0].articles.last&.created_at}/#{arguments[1]}"
  end

  def perform(ticket, locale)
    summarize = Service::Ticket::AIAssistance::Summarize.new(
      locale:,
      ticket:
    )

    content = summarize.execute&.content

    if content.nil?
      # Trigger the update for the new desktop view.
      trigger_subscription(ticket:, locale:, data: {
                             summary: {
                               problem:              '',
                               conversation_summary: '',
                               open_questions:       [],
                               suggestions:          [],
                             },
                             reason:  '',
                           },)

      # Trigger the update for the old stack
      Sessions.broadcast({
                           event: 'ticket::summary::update',
                           data:  { ticket_id: ticket.id, locale: }
                         })

      return
    end

    # Trigger the update for the new desktop view.
    trigger_subscription(ticket:, locale:, data: {
                           summary:         {
                             problem:              content['problem'],
                             conversation_summary: content['summary'],
                             open_questions:       content['open_questions'],
                             suggestions:          content['suggestions']
                           },
                           reason:          content['reason'],
                           fingerprint_md5: Digest::MD5.hexdigest(content.slice('problem', 'summary', 'open_questions', 'suggestions').to_s),
                         },)

    # Trigger the update for the old stack
    Sessions.broadcast({
                         event: 'ticket::summary::update',
                         data:  { ticket_id: ticket.id, locale: }
                       })
  rescue => e
    trigger_subscription(ticket:, locale:, data: {
                           error: {
                             message:   e.message,
                             exception: e.class.name
                           }
                         })

    # Trigger the update for the old stack without real date (it will be refetched on frontend decision).
    Sessions.broadcast({
                         event: 'ticket::summary::update',
                         data:  { ticket_id: ticket.id, locale:, error: true }
                       })
  end

  private

  def trigger_subscription(ticket:, locale:, data:)
    Gql::Subscriptions::Ticket::AIAssistance::SummaryUpdates.trigger(
      data,
      arguments: { ticket_id: Gql::ZammadSchema.id_from_object(ticket), locale: }
    )
  end
end
