#!/bin/sh

docker exec -ti unicorn-manager_database_1 sh -c "mysql -u root -h localhost -pexample unicorn_manager"
