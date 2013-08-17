#config/deploy.rb

set :application, "applicable-poisoned-integer"

# see https://help.github.com/articles/deploying-with-capistrano
# on how to deploy with github and capistrano

set :repository, "git@github.com:tbossert/applicable-poisoned-integer.git"
ssh_options[:forward_agent] = true                          
set :scm, :git                                      #capper default

set :use_sudo, false                                #capper default
set :keep_releases, 5                               #capper default
set :deploy_via, :remote_cache                      #capper default
set :main_js, "app.js"                   

# We use two different stages here production / staging
desc "development"
task :development do
# skip using nave on production server
  set :use_nave, false
  set :branch, 'master'                                     #default
  set :user, 'applicable'

  set :deploy_to, , "/var/node/#{application}"   #capper defaults to "/var/app/#{application}"
  set :node_env, 'development'
  server 'dev.fitstew.com', :app                        #add more / different roles
  set :forever_cmd, "./node_modules/.bin/forever"           #use the forever that is installed along with the app
end

#desc "tail the application logfile"
#task :log do
#  log = "#{application_dir}/current/log/#{node_env}.log"
#  run "tail -f #{log}"
#end
