class App.ControllerGenericEdit extends App.ControllerModal
  buttonClose: true
  buttonCancel: true
  buttonSubmit: true
  headPrefix: 'Edit'

  content: =>
    @item = App[ @genericObject ].find( @id )
    @head = @pageData.head || @pageData.object

    @controller = new App.ControllerForm(
      model:     @contentFormModel()
      params:    @contentFormParams()
      screen:    @screen || 'edit'
      autofocus: true
      handlers:  @handlers
    )
    @controller.form

  contentFormModel: =>
    App[ @genericObject ]

  contentFormParams: =>
    @item

  onSubmit: (e) ->
    params = @formParam(e.target)
    @item.load(params)

    # validate form using HTML5 validity check
    element = $(e.target).closest('form').get(0)
    if element && element.reportValidity && !element.reportValidity()
      return false

    # validate
    errors = @item.validate(
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
    @item.save(
      done: ->
        if ui.callback
          item = App[ ui.genericObject ].fullLocal(@id)
          ui.callback(item)
        ui.close()

      fail: (settings, details) =>
        App[ ui.genericObject ].fetch(id: @id)
        ui.log 'errors'
        ui.formEnable(e)

        if details && details.invalid_attribute
          @formValidate( form: e.target, errors: details.invalid_attribute )
        else
          ui.controller.showAlert(details.error_human || details.error || __('The object could not be updated.'))
    )
