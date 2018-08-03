#!/bin/sh

docker exec -ti unicornmanager_database_1 sh -c "mysql -u root -h localhost -pexample unicorn_manager"
