#!/bin/sh

if [ -z $1 ]
then
    echo "You must provide a service to enter."
    exit 1
fi

case "$1" in
'server' | 'rabbitmq_server')
    docker exec -ti unicorn-manager_rabbitmq_server_1 ash
;;
'publisher' | 'rabbitmq_publisher')
    docker exec -ti unicorn-manager_rabbitmq_publisher_1 ash
;;
'consumer' | 'rabbitmq_consumer')
    docker exec -ti unicorn-manager_rabbitmq_consumer_1 ash
;;
'database')
    docker exec -ti unicorn-manager_database_1 bash
;;
'tester')
    docker exec -ti unicorn-manager_tester_1 ash
;;
esac