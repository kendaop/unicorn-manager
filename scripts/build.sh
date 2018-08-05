#!/bin/sh

if [ $1 ]
then
    case "$1" in
    'server' | 'rabbitmq_server')
        docker-compose build --force-rm --pull rabbitmq_server
    ;;
    'publisher' | 'rabbitmq_publisher')
        docker-compose build --force-rm --pull rabbitmq_publisher
    ;;
    'consumer' | 'rabbitmq_consumer')
        docker-compose build --force-rm --pull rabbitmq_consumer
    ;;
    'database')
        docker-compose build --force-rm --pull database
    ;;
    'tester')
        docker-compose build --force-rm --pull tester
    ;;
    esac
else
    docker-compose build --force-rm --pull
fi
