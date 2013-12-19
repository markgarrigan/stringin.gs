require 'rubygems'
require 'bundler'

Bundler.require

set :root, File.expand_path(File.dirname(__FILE__))

# Mail.defaults do
#   delivery_method :smtp, {
#     :port      => 587,
#     :address   => "smtp.mandrillapp.com",
#     :user_name => "support@onlyremotework.com",
#     :password  => "tS0yfuXYtIAIa7HYJ9C2ig"
#   }
# end

configure :development do
  # set :stripe_key, "sk_test_7Jw8Alnqt1v1PDTkmSfpr8hq"
  # set :stripe_public_key, "pk_test_RBPaAc9Rkl9TYQRVYf2IARfv"
  set :mail_to, "mark@markgarrigan.com"
  set :db, "#{settings.root}/db/development.db"
  log = File.new("log/development.log", "a+")
  $stdout.reopen(log)
  $stderr.reopen(log)
end

configure :production do
  # set :stripe_key, "sk_live_DsAPIGbvEnfMSRMxEpuQHCf9"
  # set :stripe_public_key, "pk_live_nKbYgCDmIYziv7o056GLcpVw"
  set :mail_to, nil
  set :db, "#{settings.root}/db/production.db"
  log = File.new("log/production.log", "a+")
  $stdout.reopen(log)
  $stderr.reopen(log)
end

configure do
  enable :sessions, :logging
  set :session_secret, '^&ythey!!!#eee$4857)(OIKJ&U77ejjeuu^^^tyeh!#zzUIU%Il'
  use Rack::MethodOverride
end