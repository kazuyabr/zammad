(function ($) {

/*
*
*  provides feedback form for zammad
*

<button id="zammad-feedback-form">Feedback</button>

<script id="zammad_form_script" src="http://localhost:3000/assets/form/form.js"></script>
<script>
$(function() {
  $('#zammad-feedback-form').ZammadForm({
    messageTitle: 'Feedback Form', // optional
    messageSubmit: 'Submit', // optional
    messageThankYou: 'Thank you for your inquiry (#%s)! We\'ll contact you as soon as possible.', // optional
    messageNoConfig: 'Unable to load form config from server. Maybe feature is disabled.', // optional
    showTitle: true,
    lang: 'de', // optional, <html lang="xx"> will be used per default
    modal: true,
    attachmentSupport: false,
    attributes: [
      {
        display: 'Name',
        name: 'name',
        tag: 'input',
        type: 'text',
        placeholder: 'Your Name',
        defaultValue: '',
      },
      {
        display: 'Email',
        name: 'email',
        tag: 'input',
        type: 'email',
        required: true,
        placeholder: 'Your Email',
        defaultValue: function () {return User.email;},
      },
      {
        display: 'Message',
        name: 'body',
        tag: 'textarea',
        required: true,
        placeholder: 'Your Message…',
        defaultValue: '',
        rows: 7,
      },
      {
        display: 'Attachments',
        name: 'file[]',
        tag: 'input',
        type: 'file',
        repeat: 3,
      },
    ]
  });
});
</script>

*/

  var pluginName = 'ZammadForm',
  defaults = {
    lang: undefined,
    debug: false,
    noCSS: false,
    prefixCSS: 'zammad-form-',
    showTitle: false,
    messageTitle: 'Zammad Form',
    messageSubmit: 'Submit',
    messageThankYou: 'Thank you for your inquiry! We\'ll contact you as soon as possible.',
    messageNoConfig: 'Unable to load form config from server. Maybe feature is disabled.',
    attachmentSupport: false,
    attributes: [
      {
        display: 'Name',
        name: 'name',
        tag: 'input',
        type: 'text',
        id: 'zammad-form-name',
        required: true,
        placeholder: 'Your Name',
        defaultValue: '',
      },
      {
        display: 'Email',
        name: 'email',
        tag: 'input',
        type: 'email',
        id: 'zammad-form-email',
        required: true,
        placeholder: 'Your Email',
        defaultValue: '',
      },
      {
        display: 'Message',
        name: 'body',
        tag: 'textarea',
        id: 'zammad-form-body',
        required: true,
        placeholder: 'Your Message…',
        defaultValue: '',
        rows: 7,
      },
    ],
    translations: {
    // ZAMMAD_TRANSLATIONS_START
      'cs': {
        'Attachments': 'Přílohy',
        'Email': 'Email',
        'Message': 'Zpráva',
        'Name': 'Jméno',
        'Your Email': 'Váš e-mail',
        'Your Message…': 'Vaše zpráva…',
        'Your Name': 'Vaše jméno',
      },
      'de': {
        'Attachments': 'Anhänge',
        'Email': 'E-Mail',
        'Message': 'Nachricht',
        'Name': 'Name',
        'Your Email': 'Ihre E-Mail',
        'Your Message…': 'Ihre Nachricht…',
        'Your Name': 'Ihr Name',
      },
      'es': {
        'Attachments': 'Adjuntos',
        'Email': 'Correo electrónico',
        'Message': 'Mensaje',
        'Name': 'Nombre',
        'Your Email': 'Tu correo electrónico',
        'Your Message…': 'Su mensaje…',
        'Your Name': 'tu Nombre',
      },
      'et': {
        'Attachments': 'Manused',
        'Email': 'E-post',
        'Message': 'Teade',
        'Name': 'Nimi',
        'Your Email': 'Sinu Meiliaadress',
        'Your Message…': 'Sinu Teade…',
        'Your Name': 'Sinu Nimi',
      },
      'fa': {
        'Attachments': 'ضمایم',
        'Email': 'رایانامه',
        'Message': 'پیام',
        'Name': 'نام',
        'Your Email': 'ایمیل شما',
        'Your Message…': 'پیام شما…',
        'Your Name': 'نام شما',
      },
      'fr': {
        'Attachments': 'Pièces jointes',
        'Email': 'E-mail',
        'Message': 'Message',
        'Name': 'Nom',
        'Your Email': 'Votre email',
        'Your Message…': 'Votre message…',
        'Your Name': 'Votre nom',
      },
      'hr': {
        'Attachments': 'Privici',
        'Email': 'E-Mail',
        'Message': 'Poruka',
        'Name': 'Ime',
        'Your Email': 'Vaš e-mail',
        'Your Message…': 'Vaša poruka…',
        'Your Name': 'Vaše ime',
      },
      'hu': {
        'Attachments': 'Csatolmányok',
        'Email': 'E-mail',
        'Message': 'Üzenet',
        'Name': 'Név',
        'Your Email': 'Az Ön e-mail címe',
        'Your Message…': 'Az Ön üzenete…',
        'Your Name': 'Az Ön neve',
      },
      'it': {
        'Attachments': 'Allegati',
        'Email': 'Email',
        'Message': 'Messaggio',
        'Name': 'Nome',
        'Your Email': 'Il tuo indirizzo e-mail',
        'Your Message…': 'Il tuo messaggio…',
        'Your Name': 'Il tuo nome',
      },
      'lt': {
        'Attachments': 'Prisegtukai',
        'Email': 'El. paštas',
        'Message': 'Žinutė',
        'Name': 'Vardas',
        'Your Email': 'Jūsų el. paštas',
        'Your Message…': 'Jūsų žinutė…',
        'Your Name': 'Jūsų vardas',
      },
      'nl': {
        'Attachments': 'Bijlagen',
        'Email': 'E-mail',
        'Message': 'Bericht',
        'Name': 'Naam',
        'Your Email': 'Je e-mailadres',
        'Your Message…': 'Je bericht…',
        'Your Name': 'Je naam',
      },
      'pl': {
        'Attachments': 'Załączniki',
        'Email': 'E-mail',
        'Message': 'Wiadomość',
        'Name': 'Nazwa',
        'Your Email': 'Adres e-mail',
        'Your Message…': 'Twoja wiadomość…',
        'Your Name': 'Imię i nazwisko',
      },
      'pt-br': {
        'Attachments': 'Anexos',
        'Email': 'Email',
        'Message': 'Mensagem',
        'Name': 'Nome',
        'Your Email': 'Seu Email',
        'Your Message…': 'Sua Mensagem…',
        'Your Name': 'Seu nome',
      },
      'ro': {
        'Attachments': 'Atașamente',
        'Email': 'E-mail',
        'Message': 'Mesaj',
        'Name': 'Nume',
        'Your Email': 'Adresă de e-mail',
        'Your Message…': 'Mesajul tău…',
        'Your Name': 'Numele tău',
      },
      'ru': {
        'Attachments': 'Вложения',
        'Email': 'Электронная почта',
        'Message': 'Сообщение',
        'Name': 'Имя',
        'Your Email': 'Ваша почта',
        'Your Message…': 'Ваше сообщение…',
        'Your Name': 'Ваше имя',
      },
      'sk': {
        'Attachments': 'Prílohy',
        'Email': 'E-mail',
        'Message': 'Správa',
        'Name': 'Meno',
        'Your Email': 'Váš e-mail',
        'Your Message…': 'Vaša správa…',
        'Your Name': 'Vaše meno',
      },
      'sr': {
        'Attachments': 'Прилози',
        'Email': 'Имејл',
        'Message': 'Порука',
        'Name': 'Назив',
        'Your Email': 'Ваш имејл',
        'Your Message…': 'Ваша порука…',
        'Your Name': 'Ваше име',
      },
      'sr-latn-rs': {
        'Attachments': 'Prilozi',
        'Email': 'Imejl',
        'Message': 'Poruka',
        'Name': 'Naziv',
        'Your Email': 'Vaš imejl',
        'Your Message…': 'Vaša poruka…',
        'Your Name': 'Vaše ime',
      },
      'sv': {
        'Attachments': 'Bilagor',
        'Email': 'E-post',
        'Message': 'Meddelande',
        'Name': 'Namn',
        'Your Email': 'Din mejl',
        'Your Message…': 'Ditt meddelande…',
        'Your Name': 'Ditt namn',
      },
      'uk': {
        'Attachments': 'Вкладення',
        'Email': 'Email',
        'Message': 'Повідомлення',
        'Name': 'Ім\'я',
        'Your Email': 'Ваша електронна пошта',
        'Your Message…': 'Ваше повідомлення…',
        'Your Name': 'Ваше ім\'я',
      },
      'zh-cn': {
        'Attachments': '附件',
        'Email': '邮件地址',
        'Message': '消息',
        'Name': '名称',
        'Your Email': '您的邮件地址',
        'Your Message…': '',
        'Your Name': '您的尊姓大名',
      },
      'zh-tw': {
        'Attachments': '附件',
        'Email': '電子郵件',
        'Message': '訊息',
        'Name': '名稱',
        'Your Email': '請留下您的電子郵件地址',
        'Your Message…': '請寫下您的留言…',
        'Your Name': '您的尊姓大名',
      },
    // ZAMMAD_TRANSLATIONS_END
    }
  };

  function Plugin(element, options) {
    this.element  = element
    this.$element = $(element)

    this._defaults = defaults;
    this._name     = pluginName;

    this._endpoint_config = '/api/v1/form_config'
    this._endpoint_submit = '/api/v1/form_submit'
    this._script_location = '/assets/form/form.js'
    this._css_location    = '/assets/form/form.css'

    this._src = document.getElementById('zammad_form_script').src
    this.css_location = this._src.replace(this._script_location, this._css_location)
    this.endpoint_config = this._src.replace(this._script_location, this._endpoint_config)
    this.endpoint_submit = this._src.replace(this._script_location, this._endpoint_submit)

    this.options = $.extend(true, {}, defaults, options)
    if (!this.options.lang) {
      this.options.lang = $('html').attr('lang')
    }
    if (this.options.lang) {
      this.options.lang = this.options.lang.replace(/-.+?$/, '')
      this.log('debug', "lang: " + this.options.lang)
    }

    this._config = {}
    this._token = ''

    this.init()
  }

  Plugin.prototype.init = function () {
    var _this = this,
      params = {}

    _this.log('debug', 'init', this._src)

    if (!_this.options.noCSS) {
      _this.loadCss(_this.css_location)
    }
    if (_this.options.attachmentSupport === true || _this.options.attachmentSupport === 'true') {
      var attachment = {
        display: 'Attachments',
        name: 'file[]',
        tag: 'input',
        type: 'file',
        repeat: 1,
      }
      _this.options.attributes.push(attachment)
    }
    if (_this.options.agreementMessage) {
      var agreement = {
        display: _this.options.agreementMessage,
        name: 'agreement',
        tag: 'input',
        type: 'checkbox',
        id: 'zammad-form-agreement',
        required: true,
        defaultValue: '',
      }
      _this.options.attributes.push(agreement)
    }

    _this.log('debug', 'endpoint_config: ' + _this.endpoint_config)
    _this.log('debug', 'endpoint_submit: ' + _this.endpoint_submit)

    // load config
    if (this.options.test) {
      params.test = true
    }

    params.fingerprint = this.fingerprint()

    $.ajax({
      method: 'post',
      url: _this.endpoint_config,
      cache: false,
      processData: true,
      data: params
    }).done(function(data) {
      _this.log('debug', 'config:', data)
      _this._config = data
    }).fail(function(jqXHR, textStatus, errorThrown) {
      if (jqXHR.status == 401) {
        _this.log('error', 'Faild to load form config, wrong authentication data!')
      }
      else if (jqXHR.status == 403) {
        _this.log('error', 'Faild to load form config, feature is disabled or request is wrong!')
      }
      else {
        _this.log('error', 'Faild to load form config!')
      }
      _this.noConfig()
    });

    // show form
    if (!this.options.modal) {
      _this.render()
    }

    // bind form on call
    else {
      this.$element.off('click.zammad-form').on('click.zammad-form', function (e) {
        e.preventDefault()
        _this.render()
        return true
      })
    }
  }

  // load css
  Plugin.prototype.loadCss = function(filename) {
    if (document.createStyleSheet) {
      document.createStyleSheet(filename)
    }
    else {
      $('<link rel="stylesheet" type="text/css" href="' + filename + '" />').appendTo('head')
    }
  }

  // send
  Plugin.prototype.submit = function() {
    var _this = this

    // check min modal open time
    if (_this.modalOpenTime) {
      var currentTime = new Date().getTime()
      var diff = currentTime - _this.modalOpenTime.getTime()
      _this.log('debug', 'currentTime', currentTime)
      _this.log('debug', 'modalOpenTime', _this.modalOpenTime.getTime())
      _this.log('debug', 'diffTime', diff)
      if (diff < 1000*10) {
        alert('Sorry, you look like a robot!')
        return
      }
    }

    // disable form
    _this.$form.find('button').prop('disabled', true)

    $.ajax({
      method: 'post',
      url: _this.endpoint_submit,
      data: _this.getParams(),
      cache: false,
      contentType: false,
      processData: false,
    }).done(function(data) {

      // Remove the errors from the form.
      _this.$form.find('.zammad-form-group--has-error').removeClass('zammad-form-group--has-error')
      // Deprecated code, can be removed in future versions:
      _this.$form.find('.has-error').removeClass('has-error')

      // set errors
      if (data.errors) {
        $.each(data.errors, function( key, value ) {
          _this.$form.find('[name=' + key + ']').closest('.'+ _this.options.prefixCSS +'group').addClass('zammad-form-group--has-error')
          // Deprecated code, can be removed in future versions:
          _this.$form.find('[name=' + key + ']').closest('.form-group').addClass('has-error')
        })
        if (data.errors.token) {
          alert(data.errors.token)
        }
        _this.$form.find('button').prop('disabled', false)
        return
      }

      // ticket has been created
      _this.thanks(data)

    }).fail(function() {
      _this.$form.find('button').prop('disabled', false)
      alert('The form could not be submitted!')
    });
  }

  // get params
  Plugin.prototype.getParams = function() {
    var _this = this

    var formData = new FormData(_this.$form[0])

    /* unfortunaly not working in safari and some IEs - https://developer.mozilla.org/en-US/docs/Web/API/FormData
    if (!formData.has('title')) {
      formData.append('title', this.options.messageTitle)
    }
    */
    if (!_this.$form.find('[name=title]').val()) {
      formData.append('title', this.options.messageTitle)
    }

    if (this.options.test) {
      formData.append('test', true)
    }
    formData.append('token', this._config.token)

    formData.append('fingerprint', this.fingerprint())
    _this.log('debug', 'formData', formData)

    return formData
  }

  Plugin.prototype.closeModal = function() {
    if (this.$modal) {
      this.$modal.remove()
    }
  }

  // render form
  Plugin.prototype.render = function(e) {
    var _this = this
    _this.closeModal()
    _this.modalOpenTime = new Date()
    _this.log('debug', 'modalOpenTime:', _this.modalOpenTime)

    var element = "<div class=\"" + _this.options.prefixCSS + "modal\">\
      <div class=\"" + _this.options.prefixCSS + "modal-backdrop js-zammad-form-modal-backdrop\"></div>\
      <div class=\"" + _this.options.prefixCSS + "modal-body js-zammad-form-modal-body\">\
        <form class=\"zammad-form\"></form>\
      </div>\
    </div>"

    if (!this.options.modal) {
      element = '<div><form class="zammad-form"></form></div>'
    }

    var $element = $(element)
    var $form = $element.find('form')
    if (this.options.showTitle && this.options.messageTitle != '') {
      $form.append('<h2>' + this.options.messageTitle + '</h2>')
    }
    $.each(this.options.attributes, function(index, value) {
      var valueId = _this.options.modal ? value.id + '-modal' : value.id + '-inline'
      var item
      if (value.type == 'checkbox'){
        item = $('<div class="form-group '+ _this.options.prefixCSS +'group"></div>');
      } else {
        // Deprecated class "form-group" can be removed in future versions.
        item = $('<div class="form-group '+ _this.options.prefixCSS +'group"><label for="' + valueId +'"> ' + _this.T(value.display) + '</label></div>');
      }
      var defaultValue = (typeof value.defaultValue === 'function') ? value.defaultValue() : value.defaultValue;
      for (var i=0; i < (value.repeat ? value.repeat : 1); i++) {
        if (value.tag === 'input') {
          if (value.type === 'checkbox'){
            var label = $('<label for="' + valueId + '"><input type="' + value.type + '" name="' + value.name + '" id="' + valueId + '" class="' + _this.options.prefixCSS + 'checkbox" ' + (value.required === true ? ' required' : '') + '>' + _this.T(value.display) + '</label>')
            item.append(label)
          } else {
            // Deprecated class "form-control" can be removed in future versions.
            item.append('<input class="form-control '+ _this.options.prefixCSS +'control" id="' + valueId + '" name="' + value.name + '" type="' + value.type + '" placeholder="' + _this.T(value.placeholder) + '" value="' + (defaultValue || '') + '"' + (value.required === true ? ' required' : '') + '>')
          }
        }
        else if (value.tag == 'textarea') {
          // Deprecated class "form-control" can be removed in future versions.
          item.append('<textarea class="form-control '+ _this.options.prefixCSS +'control" id="' + valueId + '" name="' + value.name + '" placeholder="' + _this.T(value.placeholder) + '" rows="' + value.rows + '"' + (value.required === true ? ' required' : '') + '>' + (defaultValue || '') + '</textarea>')
        }
      }
      $form.append(item)
    })
    $form.append('<button type="submit" class="btn">' + this.options.messageSubmit + '</button')

    this.$modal = $element
    this.$form  = $form

    // bind on close
    $element.find('.js-zammad-form-modal-backdrop').off('click.zammad-form').on('click.zammad-form', function (e) {
      e.preventDefault()
      _this.closeModal()
      return true
    })

    // bind form submit
    $element.off('submit.zammad-form').on('submit.zammad-form', function (e) {
      e.preventDefault()
      _this.submit()
      return true
    })

    // show form
    if (!this.options.modal) {
      _this.$element.html($element)
    }

    // append modal to body
    else {
      $('body').append($element)
    }

  }

  // thanks
  Plugin.prototype.thanks = function(data) {
    var thankYou = this.options.messageThankYou
    if (data.ticket && data.ticket.number) {
      thankYou = thankYou.replace('%s', data.ticket.number)
    }
    var message = $('<div class="js-thankyou zammad-form-thankyou">' + thankYou + '</div>')
    this.$form.html(message)
  }

  // unable to load config
  Plugin.prototype.noConfig = function(e) {
    var message = $('<div class="js-noConfig">' + this.options.messageNoConfig + '</div>')
    if (this.$form) {
      this.$form.html(message)
    }
    this.$element.html(message)
  }

  // log method
  Plugin.prototype.log = function() {
    var args = Array.prototype.slice.call(arguments)
    var level = args.shift()
    if (!this.options.debug && level == 'debug') {
      return
    }
    args.unshift(this._name + '||' + level)
    console.log.apply(console, args)

    var logString = ''
    $.each( args, function(index, item) {
      logString = logString + ' '
      if (typeof item == 'object') {
        logString = logString + JSON.stringify(item)
      }
      else if (item && item.toString) {
        logString = logString + item.toString()
      }
      else {
        logString = logString + item
      }
    })
    $('.js-logDisplay').prepend('<div>' + logString + '</div>')
  }

  // translation method
  Plugin.prototype.T = function() {
    var string = arguments[0]
    var items = 2 <= arguments.length ? slice.call(arguments, 1) : []
    if (this.options.lang && this.options.lang !== 'en') {
      if (!this.options.translations[this.options.lang]) {
        this.log('debug', "Translation '" + this.options.lang + "' needed!")
      }
      else {
        translations = this.options.translations[this.options.lang]
        if (!translations[string]) {
          this.log('debug', "Translation needed for '" + this.options.lang + "' " + string + "'")
        }
        string = translations[string] || string
      }
    }
    if (items) {
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i]
        string = string.replace(/%s/, item)
      }
    }
    return string
  }

  Plugin.prototype.fingerprint = function () {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    var txt = 'https://zammad.com'
    ctx.textBaseline = 'top'
    ctx.font = '12px \'Arial\''
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125,1,62,20)
    ctx.fillStyle = '#069'
    ctx.fillText(txt, 2, 15)
    ctx.fillStyle = 'rgba(100, 200, 0, 0.7)'
    ctx.fillText(txt, 4, 17)
    return canvas.toDataURL()
  }

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      var instance = $.data(this, 'plugin_' + pluginName)
      if (instance) {
        instance.$element.empty()
        $.data(this, 'plugin_' + pluginName, undefined)
      }
      $.data(
        this, 'plugin_' + pluginName,
        new Plugin(this, options)
      );
    });
  }

}(jQuery));
