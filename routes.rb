get "/" do
	@view = '.home'
	erb :index
end

get "/.*" do
	@view = request.path
	@view[0] = ''
	erb :index
end

post "/stringer" do
  content_type :json
  {
	:id => 34,
	:firstName => params[:first_name],
	:lastName => params[:last_name]
  }.to_json
end