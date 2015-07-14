require 'rubygems'
require 'bundler'

Bundler.require

set :root, File.expand_path(File.dirname(__FILE__))

configure :development do

end

configure :production do

end

configure do
  enable :sessions
  set :session_secret, '^&ythey!!!#eee$4857)(OIKJ&U77ejjeuu^^^tyeh!#zzUIU%Il'
  use Rack::MethodOverride
end
