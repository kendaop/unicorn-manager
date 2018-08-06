#!/bin/sh

if [ $1 ]
then
    case "$1" in
    'server' | 'rabbitmq_server')
        docker-compose up -d rabbitmq_server
    ;;
    'publisher' | 'rabbitmq_publisher')
        docker-compose up -d rabbitmq_publisher
    ;;
    'consumer' | 'rabbitmq_consumer')
        docker-compose up -d rabbitmq_consumer

        echo 'Starting consumer process...'
        sleep 3

        # Start the consumer watcher
        docker exec -d unicorn-manager_rabbitmq_consumer_1 ./consumer.js
    ;;
    'database')
        docker-compose up -d database

        echo 'Initializing database...'
        # Dirty hack to ensure mariadb is ready before trying to connect to it.
        sleep 5

        # Initialize database
        docker exec -ti unicorn-manager_database_1 sh -c 'mysql -h localhost -u root -pexample unicorn_manager < /usr/local/unicorn/init.mysql'
    ;;
    'tester')
        docker-compose up -d tester
    ;;
    esac
else
    docker-compose up -d rabbitmq_server rabbitmq_publisher rabbitmq_consumer database

    echo 'Initializing database...'
    # Dirty hack to ensure mariadb is ready before trying to connect to it.
    sleep 6

    # Initialize database
    docker exec -ti unicorn-manager_database_1 sh -c 'mysql -h localhost -u root -pexample unicorn_manager < /usr/local/unicorn/init.mysql'

    echo 'Starting consumer process...'

    sleep 3

    # Start the consumer watcher
    docker exec -d unicorn-manager_rabbitmq_consumer_1 ./consumer.js
fi