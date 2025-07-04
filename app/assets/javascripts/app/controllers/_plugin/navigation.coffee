class Navigation extends App.Controller
  @extend App.PopoverProvidable
  @registerAllPopovers()

  elements:
    '#global-search': 'searchInput'
    '.search': 'searchContainer'
    '.js-global-search-result': 'searchResult'
    '.js-details-link': 'searchDetails'

  events:
    'click .js-toggleNotifications': 'toggleNotifications'
    'click .js-emptySearch': 'emptyAndClose'
    'submit form.search-holder': 'preventDefault'
    'dblclick form.search-holder .icon-magnifier': 'openExtendedSearch'
    'focus #global-search': 'searchFocus'
    'blur #global-search': 'searchBlur'
    'paste #global-search': 'searchPaste'
    'keyup #global-search': 'listNavigate'
    'click .js-global-search-result': 'emptyAndCloseDelayed'
    'click .js-details-link': 'openExtendedSearch'
    'change .js-menu .js-switch input': 'switch'
    'click .js-onclick': 'click'
    'click .js-navigation-toggle-button': 'toggleClicked'

  constructor: ->
    super
    @render()

    @globalSearch = new App.GlobalSearch(
      render: @renderResult
    )

    # rerender view, e. g. on langauge change
    @controllerBind('ui:rerender', =>
      @render()
    )

    # rerender menu
    @controllerBind('menu:render', =>
      @renderMenu()
    )

    # rerender menu
    @controllerBind('personal:render', =>
      @renderPersonal()
    )

    # update selected item
    @controllerBind('navupdate', (params) =>
      @update(params)
    )

    # fetch new recent viewed after collection change
    @controllerBind('RecentView::changed', =>
      @delay(
        => @fetchRecentView()
        1000
        'recent-view-changed'
      )
    )

    # bell on / bell off
    @controllerBind('bell', (data) =>
      if data is 'on'
        @$('.bell').addClass('show')
        App.Audio.play( 'https://www.sounddogs.com/previews/2193/mp3/219024_SOUNDDOGS__be.mp3' )
        @delay(
          -> App.Event.trigger('bell', 'off')
          3000
        )
      else
        @$('.bell').removeClass('show')
    )

  release: =>
    if @notificationWidget
      @notificationWidget.remove()
      @notificationWidget = undefined

  renderMenu: =>
    items = @getItems(navbar: @Config.get('NavBar'))

    # apply counter and switch info from persistent controllers (if exists)
    activeTab = {}
    itemsNew = []
    for item in items
      shown = true
      if item.shown isnt undefined
        shown = item.shown
      if item.key
        worker = App.TaskManager.worker(item.key)
        if worker
          if worker.counter
            item.counter = worker.counter()
          if worker.switch
            item.switch = worker.switch()
          if worker.active && worker.active()
            activeTab[item.target] = true
          if worker.onclick
            item.onclick = worker.onclick()
          if worker.accessoryIcon
            item.accessoryIcon = worker.accessoryIcon()
          if worker.featureActive
            if worker.featureActive()
              shown = true
            else
              shown = false
      if shown
        itemsNew.push item
    items = itemsNew

    # get open tabs to reopen on rerender
    openTab = {}
    @$('.open').children('a').each( (i,d) ->
      href = $(d).attr('href')
      openTab[href] = true
    )

    # render menu
    @$('.js-menu').html App.view('navigation/menu')(
      items:     items
      openTab:   openTab
      activeTab: activeTab
    )

  click: (e) ->
    @preventDefaultAndStopPropagation(e)

    key    = $(e.currentTarget).data('key')
    worker = App.TaskManager.worker(key)
    worker.clicked(e)

  #  on switch changes and execute it on controller
  switch: (e) ->
    val = $(e.target).prop('checked')
    key = $(e.target).closest('.menu-item').data('key')
    return if !key
    worker = App.TaskManager.worker(key)
    return if !worker
    worker.switch(val)

  renderPersonal: =>
    @recentViewNavbarItemsRebuild()
    items = clone(@getItems(navbar: @Config.get('NavBarRight')), true)

    # if only one child exists, use direct access
    for item in items
      if item && item.child && item.child.length is 1
        if item.class != 'user' # allow user menu with a single logout button
          item.target = item.child[0].target
          delete item.child

    # get open tabs to reopen on rerender
    openTab = {}
    @$('.open').children('a').each( (i,d) ->
      href = $(d).attr('href')
      openTab[href] = true
    )

    @$('.navbar-items-personal').html App.view('navigation/personal')(
      items:   items
      openTab: openTab
    )

    new App.DarkMode()

    # only start avatar widget on existing session
    if App.Session.get('id')
      new App.WidgetAvatar(
        el:        @$('.js-avatar')
        object_id: App.Session.get('id')
        type:      'personal'
      )

    @renderDesktopBetaSwitch()
    @controllerBind('ui:beta:saved', @renderDesktopBetaSwitch)

  renderDesktopBetaSwitch: =>
    if not App.DesktopBetaSwitch.isSwitchVisible()
      @$('.navbar-desktop-beta-switch').hide()

      return

    content = @$('.navbar-desktop-beta-switch').html App.view('navigation/desktop-beta-switch')()

    content.find('.dismiss-button')
      .off('click.dismiss_button')
      .on('click.dismiss_button', (e) ->
        e.preventDefault()

        return if not App.DesktopBetaSwitch.dismissSwitch()

        content.hide()

        new App.ControllerConfirm(
          head: __('Help')
          message: __('You can switch between the old and the New BETA UI at any moment in the Profile > New BETA UI section.')
          buttonClass: 'btn--success'
          buttonCancel: false
          buttonSubmit: __('Got it')
        )
      )

    content.find('.js-switchControl').replaceWith App.UiElement.switch.render(
      name: 'desktop_beta_switch'
      display: __('Try New BETA UI')
    )

    content.find('input[name="desktop_beta_switch"]')
      .off('change.desktop_beta_switch')
      .on('change.desktop_beta_switch', (e) =>
        @delay(=>
          @preventDefaultAndStopPropagation(e)
          return if not e.target.checked
          return if not App.DesktopBetaSwitch.activateSwitch()
          App.DesktopBetaSwitch.navigateToDesktop()
        , 250)
      )

    content.show()

  renderResult: (result = {}) =>
    @removePopovers()

    # remove result if not result exists
    if _.isEmpty(result)
      @searchResult.html(App.view('navigation/no_result')())
      return

    # build markup
    html = App.view('navigation/result')(
      result: result
    )
    @searchResult.html(html)

    @renderPopovers()

  render: ->
    user = App.Session.get()
    if _.isEmpty(user)
      @appEl.find('#navigation').remove()
      return

    navigation = $(App.view('navigation')(
      user: user
    ))

    @taskbar?.releaseController()
    @taskbar = new App.TaskbarWidget(el: navigation.find('.tasks'))

    if @appEl.find('#navigation').length < 1
      @appEl.prepend('<div id="navigation"></div>')
      @el = @appEl.find('#navigation')

    @replace(navigation)

    # renderMenu
    @renderMenu()

    # renderPersonal
    @renderPersonal()

    if @notificationWidget
      @notificationWidget.remove()
    @notificationWidget = new App.OnlineNotificationWidget()
    @appEl.append @notificationWidget.el

  searchFocus: (e) =>
    @clearDelay('emptyAndCloseDelayed')
    @query = undefined
    @search(10)
    App.PopoverProvidable.anyPopoversDestroy()
    @searchContainer.addClass('focused')
    @selectAll(e)

    $('#app').removeClass('navigation-collapsed')
    @el.addClass('is-not-collapsed')

  searchPaste: (e) =>
    update = =>
      @clearDelay('emptyAndCloseDelayed')
      @query = undefined
      @search(10)
      App.PopoverProvidable.anyPopoversDestroy()
      @searchContainer.addClass('focused')
    @delay(update, 10, 'searchFocus')

  searchBlur: (e) =>
    # delay to be able to "click/execute" x if query is ''
    update = =>
      if @searchInput.val().trim() is ''
        @emptyAndClose()
    @delay(update, 100, 'removeFocused')

  listNavigate: (e) =>
    if e.keyCode is 27 # close on esc
      @emptyAndClose()
      return
    else if e.keyCode is 38 # up
      @nudge(e, -1)
      return
    else if e.keyCode is 40 # down
      @nudge(e, 1)
      return
    else if e.keyCode is 13 # enter
      @searchInput.trigger('blur')
      href = @$('.global-search-result .nav-tab.is-hover').attr('href')
      if href
        @navigate(href)
        @emptyAndCloseDelayed()
      else
        @openExtendedSearch()
      return

    # on other keys, show result
    @search(0)

  nudge: (e, position) =>

    return if !@searchContainer.hasClass('open')

    # get current
    current = @searchResult.find('.nav-tab.is-hover')
    if !current.get(0)

      # if down, select detail search of first result
      if position is 1
        if !@searchDetails.hasClass('is-hover')
          @searchDetails.addClass('is-hover')
          return

        @searchDetails.removeClass('is-hover')
        @searchResult.find('.nav-tab').first().addClass('is-hover').popover('show')
        return

    if position is 1
      next = current.closest('li').nextAll('li').not('.divider').first().find('.nav-tab')
      if next.get(0)
        current.removeClass('is-hover').popover('hide')
        next.addClass('is-hover').popover('show')
    else
      prev = current.closest('li').prevAll('li').not('.divider').first().find('.nav-tab')
      if prev.get(0)
        current.removeClass('is-hover').popover('hide')
        prev.addClass('is-hover').popover('show')
      else
        current.removeClass('is-hover').popover('hide')
        @searchDetails.addClass('is-hover')

    if next
      @scrollToIfNeeded(next, true)
    if prev
      @scrollToIfNeeded(prev, false)

  emptyAndClose: =>
    @andClose()
    @andEmpty()

  emptyAndCloseDelayed: =>
    @andClose()
    delay = =>
      @andEmpty()
    @delay(delay, 60000, 'emptyAndCloseDelayed')

  andEmpty: =>
    @query = ''
    @searchInput.val('')

  andClose: =>
    @searchContainer.removeClass('focused filled open no-match loading')
    @globalSearch.close()
    @delayedRemoveAnyPopover(true)

  search: (delay) =>
    query = @searchInput.val().trim()
    @searchContainer.toggleClass('filled', !!query)

    return if @query is query
    @query = query

    if delay is 0
      delay = 500
      if query.length > 2
        delay = 350
      else if query.length > 4
        delay = 200

    # if we started a new search and already typed something in
    if query is ''
      @searchContainer.removeClass('open')
      return

    @globalSearch.search(
      delay: delay
      query: @query
      callbackLongerAsExpected: =>
        @searchContainer.removeClass('open')
      callbackNoMatch: =>
        @searchContainer.addClass('no-match')
        @searchContainer.addClass('open')
      callbackMatch: =>
        @searchContainer.removeClass('no-match')
        @searchContainer.addClass('open')
      callbackStop: =>
        @searchContainer.removeClass('loading')
      callbackStart: =>
        @searchContainer.addClass('loading')
    )

  filterNavbar: (values, parent = null) ->
    return _.filter values, (item) =>
      if typeof item.callback is 'function'
        data = item.callback() || {}
        for key, value of data
          item[key] = value

      if !parent? && !item.parent || item.parent is parent
        return @filterNavbarPermissionOk(item) &&
          @filterNavbarSettingOk(item)
      else
        return false

  filterNavbarPermissionOk: (item) ->
    return true unless item.permission
    return item.permission(@) if typeof item.permission is 'function'

    return _.any item.permission, (permissionName) =>
      return @permissionCheck(permissionName)

  filterNavbarSettingOk: (item) ->
    return true unless item.setting

    return _.any item.setting, (settingName) =>
      return @Config.get(settingName)

  getItems: (data) ->
    navbar =  _.values(data.navbar)

    level1 = []
    dropdown = {}

    level1 = @filterNavbar(navbar)

    for item in navbar
      if item.parent && !dropdown[ item.parent ]
        dropdown[ item.parent ] = @filterNavbar(navbar, item.parent)

        for itemLevel1 in level1
          if itemLevel1.target is item.parent
            sub = @getOrder(dropdown[ item.parent ])
            itemLevel1.child = sub

    # clean up, only show navbar items with existing children
    clean_list = []
    for item in level1
      if !item.child || item.child && !_.isEmpty(item.child)
        clean_list.push item
    nav = @getOrder(clean_list)
    return nav

  getOrder: (data) ->
    newlist = {}
    for item in data
      # check if same prio already exists
      @addPrioCount newlist, item

      newlist[ item['prio'] ] = item

    # get keys for sort order
    keys = _.keys(newlist)
    inorder = keys.sort(@sortit)

    # create new array with prio sort order
    inordervalue = []
    for num in inorder
      inordervalue.push newlist[ num ]

    # add differ to after recent viewed item
    found = false
    for value in inordervalue
      if value.type is 'recentViewed'
        found = true
      if found && value.type isnt 'recentViewed'
        value.divider = true
        found = false

    return inordervalue

  sortit: (a,b) ->
    return(a-b)

  addPrioCount: (newlist, item) ->
    if newlist[ item['prio'] ]
      item['prio']++
      if newlist[ item['prio'] ]
        @addPrioCount newlist, item

  update: (params) =>
    url = params
    if _.isObject(params)
      url = params.url
      type = params.type
    if type is 'menu'
      @$('.js-menu .is-active').removeClass('is-active')
    else
      @$('.is-active').removeClass('is-active')
    return if !url || url is '#'
    @$(".js-menu [href=\"#{url}\"], .tasks [href=\"#{url}\"]").addClass('is-active')

  recentViewNavbarItemsRebuild: =>

    # remove old views
    NavBarRight = @Config.get('NavBarRight') || {}
    for key of NavBarRight
      if NavBarRight[key].parent is '#current_user'
        part = key.split '::'
        if part[0] is 'RecendViewed'
          delete NavBarRight[key]

    if !@Session.get()
      @Config.set('NavBarRight', NavBarRight)
      return

    # add new views
    items = App.RecentView.search(sortBy: 'created_at', order: 'DESC')
    items = @prepareForObjectList(items)
    prio = 80
    for item in items
      divider   = false
      navheader = false
      if prio is 80
        divider   = true
        navheader = __('Recently viewed')

      prio++
      NavBarRight['RecendViewed::' + item.o_id + item.object + '-' + prio ] = {
        prio:      prio
        parent:    '#current_user'
        name:      App.i18n.translateInline(item.object) + ' (' + item.title + ')'
        target:    item.link
        divider:   divider
        navheader: navheader
        type:      'recentViewed'
      }

    @Config.set('NavBarRight', NavBarRight)

  fetchRecentView: =>
    load = =>
      @renderPersonal()
    App.RecentView.fetchFull(load, clear: true)

  toggleNotifications: (e) ->
    e.stopPropagation()
    @notificationWidget.toggle()

  openExtendedSearch: (e) ->
    if e
      e.preventDefault()
    query = @searchInput.val()
    @emptyAndClose()
    if query
      @navigate("#search/#{encodeURIComponent(query)}")
      return
    @navigate('#search')

  # detect collapsed by both added class and screen size
  isCollapsed: =>
    @el.width() == 50

  toggleClicked: (e) =>
    @preventDefaultAndStopPropagation(e)

    current = @isCollapsed()

    @el.toggleClass('is-not-collapsed', current)
    $('#app').toggleClass('navigation-collapsed', !current)

App.Config.set('aaa_navigation', Navigation, 'Plugins')
