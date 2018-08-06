#!/bin/sh

d=""
if [ $1 ]
then
    d="-d"
fi

docker exec $d unicorn-manager_rabbitmq_consumer_1 ./consumer.js