# Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

class Report::TicketBacklog < Report::Base

=begin

  result = Report::TicketBacklog.aggs(
    range_start: Time.zone.parse('2015-01-01T00:00:00Z'),
    range_end:   Time.zone.parse('2015-12-31T23:59:59Z'),
    interval:    'month', # quarter, month, week, day, hour, minute, second
    selector:    selector, # ticket selector to get only a collection of tickets
    timezone:    'Europe/Berlin',
  )

returns

  [4,5,1,5,0,51,5,56,7,4]

=end

  def self.aggs(params_origin)
    params = duplicate_preserving_current_user(params_origin)

    params[:params] = {}

    params[:params][:field] = 'created_at'
    created = Report::TicketGenericTime.aggs(params)

    params[:params][:field] = 'close_at'
    closed = Report::TicketGenericTime.aggs(params)

    result = []
    (0..(created.length - 1)).each do |position|
      count = created[position] - closed[position]
      result.push count
    end
    result
  end

=begin

  result = Report::TicketBacklog.items(
    range_start: Time.zone.parse('2015-01-01T00:00:00Z'),
    range_end:   Time.zone.parse('2015-12-31T23:59:59Z'),
    selector:    selector, # ticket selector to get only a collection of tickets
  )

returns

  {}

=end

  def self.items(_params)
    {}
  end

end
