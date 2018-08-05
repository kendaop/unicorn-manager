#!/bin/sh

if [ -z $1 ]
then
    echo "Please provide publisher arguments."
else
    docker exec unicorn-manager_rabbitmq_publisher_1 ./publisher.js $1 $2 $3
fi