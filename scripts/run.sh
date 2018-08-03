#!/bin/sh

docker-compose up -d 

# Dirty hack to ensure mariadb is ready before trying to connect to it.
sleep 5

docker exec -ti unicorn-manager_database_1 sh -c 'mysql -h localhost -u root -pexample unicorn_manager < /usr/local/unicorn/init.mysql'