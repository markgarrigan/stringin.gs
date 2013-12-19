helpers do
	include Rack::Utils
	alias_method :h, :escape_html

	def delete_request
		'<div style="margin:0;padding:0"><input name="_method" type="hidden" value="delete" /></div>'
	end

	def put_request
		'<div style="margin:0;padding:0"><input name="_method" type="hidden" value="put" /></div>'
	end

	def stripify(input)
		if input && !(input.to_s.empty?) && input.to_f
			(input * 100).to_int
		end
	end

	# Loads partial view into template. Required vriables into locals
	def partial(template, locals = {})
		erb(template, :layout => false, :locals => locals)
	end

end

class Object
	def blank?
		respond_to?(:empty?) ? empty? : !self
	end

	# An object is present if it's not <tt>blank?</tt>.
	def present?
		!blank?
	end
end

class Time
  def add_minutes(m)
    self + (60 * m)
  end
  def add_hours(h)
    self + (60 * 60 * h)
  end
  def add_days(d)
    self + (60 * 60 * 24 * d)
  end
end