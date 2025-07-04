class App.ControllerGenericNew extends App.ControllerModal
  buttonClose: true
  buttonCancel: true
  buttonSubmit: true
  headPrefix: 'New'
  showTrySupport: true

  content: =>
    @head = @pageData.head || @pageData.object
    @controller = new App.ControllerForm(
      model:     @contentFormModel()
      params:    @contentFormParams()
      screen:    @screen || 'create'
      autofocus: true
      handlers: @handlers
    )
    @controller.form

  contentFormModel: =>
    App[ @genericObject ]

  contentFormParams: =>
    @item

  onSubmit: (e) ->
    params = @formParam(e.target)

    object = new App[ @genericObject ]
    object.load(params)

    # validate form using HTML5 validity check
    element = $(e.target).closest('form').get(0)
    if element && element.reportValidity && !element.reportValidity()
      return false

    # validate
    errors = object.validate(
      controllerForm: @controller
    )

    if @validateOnSubmit
      errors = _.extend({}, errors, @validateOnSubmit(params))

    if !_.isEmpty(errors)
      @log 'error', errors
      @formValidate( form: e.target, errors: errors )
      return false

    # disable form
    @formDisable(e)

    # save object
    ui = @
    object.save(
      done: ->
        if ui.callback
          item = App[ ui.genericObject ].fullLocal(@id)
          ui.callback(item)
        ui.close()

      fail: (settings, details) =>
        ui.log 'errors', details
        ui.formEnable(e)

        if details && details.invalid_attribute
          @formValidate( form: e.target, errors: details.invalid_attribute )
        else
          ui.controller.showAlert(details.error_human || details.error || __('The object could not be created.'))
    )
