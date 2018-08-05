# Unicorn Manager
Favoring a message queuing system over a traditional REST API, this unicorn 
manager is built with RabbitMQ and the amqplib client in Node.js. 
The application runs on a set of Docker containers that act as separate actors 
in private network.

## Prerequisites
[Docker](https://docs.docker.com/install/#supported-platforms) must be 
installed on your host machine.
> If you are using a Windows 10 machine, 
[Hyper-V must be enabled](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v).

## Quickstart
The most common actions necessary to interact with this app are included in 
helper scripts, to help you get started quickly.

**1) Pull and build the Docker images:** 
`./scripts/build.sh`

**2) Launch the containers:** 
`./scripts/run.sh`

The server and consumer process is up and running and the app is now ready to 
receive messages.

**3) Add a Unicorn to the pasture:** 
`./scripts/publisher.sh add Bill pasture`

**4) See Bill in the pasture:** 
`./scripts/publisher.sh see`

**5) Use Bill's ID number to move him to the barn:**
`./scripts/publisher.sh move 1 barn`

**6) Verify Bill is now safely in the barn:**
`./scripts/publisher.js see`