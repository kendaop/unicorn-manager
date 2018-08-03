# Unicorn Manager
Favoring a message queuing system over a traditional REST API, this unicorn 
manager is built with RabbitMQ in Node.js. The application runs on a set of 
Docker containers that act as separate actors in private network.

## Prerequisites
[Docker](https://docs.docker.com/install/#supported-platforms) must be 
installed on your host machine.
> If you are using a Windows 10 machine, 
[Hyper-V must be enabled](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v).

## Quickstart
The most common actions necessary to interact with this app are included in 
helper scripts, to help you get started quickly.

Pull and build the Docker images: `./scripts/build.sh`

Launch the containers: `./scripts/run.sh`

The app is now up and running!