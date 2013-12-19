require 'securerandom'

Sequel.sqlite(settings.db)

class Sequel::Model
	def before_create
		self.created_at ||= Time.now.getutc
		super
	end
	def before_save
		self.updated_at ||= Time.now.getutc
		super
	end
end