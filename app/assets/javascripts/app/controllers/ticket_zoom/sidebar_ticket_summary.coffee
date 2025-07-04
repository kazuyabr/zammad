class App.SidebarTicketSummary extends App.Controller
  DISPLAY_STRUCTURE: [
    { key: 'problem', name: __('Customer Intent'), value: 'problem' },
    { key: 'conversation_summary', name: __('Conversation Summary'), value: 'conversation_summary' },
    { key: 'open_questions', name: __('Open Questions'), value: 'open_questions', type: 'list' },
    { key: 'suggestions', name: __('Suggested Next Steps'), value: 'suggestions', feature: 'checklist', type: 'list' },
  ]

  constructor: ->
    super

    @controllerBind('config_update', @configHasChanged)

    return if !@sidebarIsEnabled()

    @loadSummarization()

    # load new summary if it has changed
    @controllerBind('ticket::summary::update', (data) =>
      return if data.ticket_id.toString() isnt @ticket.id.toString()
      return if data.locale isnt App.i18n.get()

      if data.error
        @renderSummarization(error: true)
        return

      @loadSummarization()
    )

    # check if new summary need ot get requested
    @controllerBind('ui::ticket::load', (data) =>
      return if data.ticket_id.toString() isnt @ticket.id.toString()
      return if !@summaryReloadNeeded()

      @loadSummarization()
    )

  sidebarItem: =>
    return if !@sidebarIsEnabled()

    {
      name:           'summary'
      badgeIcon:      'smart-assist'
      badgeCallback:  @badgeRender
      sidebarHead:     __('Summary')
      sidebarCallback: @sidebarCallback
      sidebarActions:  []
    }

  badgeDetails: =>
    {
      name:       'summary'
      icon:       'smart-assist'
      dotVisible: !@isPreparingData && @fingerprintMD5 && !@constructor.isSummarySeen(@ticket, @fingerprintMD5)
    }

  badgeRender: (el) =>
    @badgeEl = el
    @badgeRenderLocal()

  badgeRenderLocal: =>
    return if !@badgeEl
    @badgeEl.html(App.view('generic/sidebar_tabs_item')(@badgeDetails()))

  shown: =>
    if !@isPreparingData && @fingerprintMD5
      @constructor.markSummaryAsSeen(@ticket, @fingerprintMD5)

    @badgeRenderLocal()

    # trigger shown sidebar to hide ai banner
    App.Event.trigger('ui::ticket::summarySidebar::shown', { ticket_id: @ticket.id })

  sidebarIsEnabled: =>
    return false if !App.Config.get('ai_provider')
    return false if !App.Config.get('ai_assistance_ticket_summary')
    return false if !(@ticket and @ticket.currentView() is 'agent')
    return false if @ticket.state.state_type.name is 'merged'

    true

  sidebarCallback: (el) =>
    @elSidebar = el

  configHasChanged: (config) =>
    switch config.name
      when 'ai_assistance_ticket_summary'
        App.Event.trigger('ui::ticket::sidebarRerender', { taskKey: @taskKey })
      when 'ai_assistance_ticket_summary_config'
        @loadSummarization()
      when 'checklist'
        @renderSummarization({})

  getAvailableDisplayStructure: ->
    config = App.Config.get('ai_assistance_ticket_summary_config')
    @DISPLAY_STRUCTURE.filter((item) -> !(item.key of config) or config[item.key] is true)

  renderSummarization: (data) =>
    if data
      @summaryData = data

    @updateSummarySeenState(@summaryData)

    return if !@elSidebar

    noSummaryPossible = @summaryData.result && _.every(_.values(@summaryData.result), (item) -> item is null)

    summarization = $(App.view('ticket_zoom/sidebar_ticket_summary')(
      data:              @summaryData
      noSummaryPossible: noSummaryPossible
      checklist:         App.Config.get('checklist')
      structure:         @getAvailableDisplayStructure()
    ))

    summarization
      .on('click', '.js-retry', @retrySummarization)
      .on('click', '.js-addChecklistItem', @convertFollowUpToChecklistItem)
      .on('click', '.js-addAllToChecklist', @convertAllFollowUpsToChecklistItems)

    @elSidebar.html(summarization)

  retrySummarization: (e) =>
    @preventDefaultAndStopPropagation(e)
    @renderSummarization({})
    @loadSummarization()

  updateSummarySeenState: (data) =>
    @isPreparingData = (_.isNull(data?.result) or data?.error)
    @fingerprintMD5  = data?.result?.fingerprint_md5

    App.Event.trigger(
      'ui::ticket::summaryUpdate',
      { ticket_id: @ticket.id, isPreparingData: @isPreparingData, fingerprintMD5: @fingerprintMD5 }
    )

    if @sidebarItem()?.name == @parentSidebar.currentTab && @fingerprintMD5 && !@isPreparingData
      @constructor.markSummaryAsSeen(@ticket, @fingerprintMD5)

    @badgeRenderLocal()

  summaryReloadNeeded: =>
    ticket = App.Ticket.find(@ticket.id)
    ticketSummarizableArticleIds = @ticketSumarizableArticleIds(ticket.article_ids)

    if @ticketSummarizableArticleIds && _.isEqual(@ticketSummarizableArticleIds, ticketSummarizableArticleIds)
      return false

    @ticketSummarizableArticleIds = ticketSummarizableArticleIds
    true

  ticketSumarizableArticleIds: (allArticleIds) ->
    allArticleIds.filter (elem) ->
      article = App.TicketArticle.find(elem)
      sender  = App.TicketArticleSender.find(article.sender_id)

      sender.name != 'System' && article.body?.length > 0

  loadSummarization: =>
    @ajax(
      id:    "ticket-intelligence-enqueue-#{@taskKey}"
      type:  'POST'
      url:   "#{@apiPath}/tickets/#{@ticket.id}/enqueue_summarize"
      success: (data, status, xhr) =>
        @renderSummarization(data)

      error: (xhr, status, error) ->
        # show error toaster
    )

  convertFollowUpToChecklistItem: (e) =>
    target = $(e.target).closest('.js-addChecklistItem')
    return if !target

    text = $(target).data('content')
    checklistId = @ticket.checklist_id

    if checklistId
      @checklistItemCreate(checklistId, text)
    else
      @checklistItemCreate(null, text, @ticket.id)

  checklistItemCreate: (checklistId, text, ticketId) =>
    item = new App.ChecklistItem
    item.checklist_id = checklistId
    item.ticket_id = ticketId
    item.text = text

    item.save(
      done: =>
        App.Event.trigger('ui::ticket::checklistSidebar::showLoader')
        @notify(
          type: 'success'
          msg: App.i18n.translateInline('Checklist item successfully added.')
        )
      fail: =>
        @notify(
          type: 'error'
          msg: App.i18n.translateInline('The checklist item could not be added.')
        )
    )

  convertAllFollowUpsToChecklistItems: =>
    checklistId = @ticket.checklist_id

    itemData = _.map(@summaryData.result.suggestions, (text) ->
      text: text
      checked: false
    )

    if checklistId
      @checklistItemsBulkCreate(checklistId, itemData)
    else
      @checklistItemsBulkCreate(null, itemData, @ticket.id)

  checklistOpen: =>
    @elSidebar
      .closest('.content')
      .find(".tabsSidebar-tab[data-tab='checklist']:not(.active)")
      .click()

  checklistItemsBulkCreate: (checklistId, items, ticketId) =>
    @ajax(
      id:   'checklist_ticket_create_bulk'
      type: 'POST'
      url:  "#{@apiPath}/checklist_items/create_bulk"
      processData: true
      data: JSON.stringify(
        checklist_id: checklistId
        ticket_id:    ticketId
        items:        items
      )
      success:  =>
        App.Event.trigger('ui::ticket::checklistSidebar::showLoader')
        @checklistOpen()
      error: =>
        @notify(
          type: 'error'
          msg: App.i18n.translateInline('Not all checklist items could be added.')
        )
    )

  @summarySeenLocalStorageKey: (ticket) ->
    "ticket-summary-seen-#{ticket.id}"

  @markSummaryAsSeen: (ticket, fingerprint) =>
    key = @summarySeenLocalStorageKey(ticket)
    App.LocalStorage.set(key, fingerprint)

  @isSummarySeen: (ticket, fingerprint) =>
    key = @summarySeenLocalStorageKey(ticket)

    App.LocalStorage.get(key) is fingerprint


App.Config.set('350-TicketSummary', App.SidebarTicketSummary, 'TicketZoomSidebar')
