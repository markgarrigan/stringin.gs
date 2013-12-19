namespace :bundler do
  task :setup do
    require 'rubygems'
    require 'bundler/setup'
  end
end
 
task :environment, [:env] => 'bundler:setup' do |cmd, args|
  ENV["RACK_ENV"] = args[:env] || "development"
  require "./app"
end
 
namespace :db do
  desc "Run database migrations"
  task :migrate, :env do |cmd, args|
    env = args[:env] || "development"
    Rake::Task['environment'].invoke(env)
 
    require 'sequel/extensions/migration'
    Sequel::Migrator.apply(Sequel.sqlite("db/#{env}.db"), "db/migrations")
  end
 
  desc "Rollback the database"
  task :rollback, :env do |cmd, args|
    env = args[:env] || "development"
    Rake::Task['environment'].invoke(env)
 
    require 'sequel/extensions/migration'
    version = (row = Sequel.sqlite("db/#{env}.db")[:schema_info].first) ? row[:version] : nil
    Sequel::Migrator.apply(Sequel.sqlite("db/#{env}.db"), "db/migrations", version - 1)
  end
 
  desc "Nuke the database (drop all tables)"
  task :nuke, :env do |cmd, args|
    env = args[:env] || "development"
    Rake::Task['environment'].invoke(env)
    Sequel.sqlite("db/#{env}.db").tables.each do |table|
      Sequel.sqlite("db/#{env}.db").run("DROP TABLE #{table}")
    end
  end
 
  desc "Reset the database"
  task :reset, [:env] => [:nuke, :migrate]
end