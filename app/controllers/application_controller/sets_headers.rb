# Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

module ApplicationController::SetsHeaders
  extend ActiveSupport::Concern

  included do
    before_action :cors_preflight_check
    after_action :set_access_control_headers, :set_cache_control_headers
  end

  private

  # For all responses in this controller, return the CORS access control headers.
  def set_access_control_headers
    return if @_auth_type != 'token_auth' && @_auth_type != 'basic_auth'

    set_access_control_headers_execute
  end

  def set_access_control_headers_execute
    headers['Access-Control-Allow-Origin']      = '*'
    headers['Access-Control-Allow-Methods']     = 'POST, GET, PUT, DELETE, PATCH, OPTIONS'
    headers['Access-Control-Max-Age']           = '1728000'
    headers['Access-Control-Allow-Headers']     = 'Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control, Accept-Language' # rubocop:disable Zammad/DetectTranslatableString
  end

  def set_cache_control_headers
    # Prevent caches from being even written to disk.
    # The default Rails header of `max-age=0, private, must-revalidate` does not achieve this.
    headers['Cache-Control'] = 'no-store'
  end

  # If this is a preflight OPTIONS request, then short-circuit the
  # request, return only the necessary headers and return an empty
  # text/plain.
  def cors_preflight_check
    return if request.method != 'OPTIONS'

    headers['Access-Control-Allow-Origin']      = '*'
    headers['Access-Control-Allow-Methods']     = 'POST, GET, PUT, DELETE, PATCH, OPTIONS'
    headers['Access-Control-Allow-Headers']     = 'Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control, Accept-Language' # rubocop:disable Zammad/DetectTranslatableString
    headers['Access-Control-Max-Age']           = '1728000'
    render plain: ''
  end
end
