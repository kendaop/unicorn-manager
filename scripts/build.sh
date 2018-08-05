#!/bin/sh

if [ ! -z $1 ]
then
    docker-compose build --force-rm --pull $1
else
    docker-compose build --force-rm --pull
fi
