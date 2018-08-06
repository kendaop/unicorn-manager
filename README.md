# Unicorn Manager
Favoring a message queuing system over a traditional REST API, this unicorn 
manager is built with RabbitMQ and the amqplib client in Node.js. 
The application runs on a set of Docker containers that act as separate actors 
in a private network.

## Contents
[Prerequisites](#prerequisites)  
[Quickstart](#quickstart)  
[Advanced Usage](#advanced-usage)  
[Helper Scripts](#helper-scripts)
* [build.sh](#build.sh)
* [run.sh](#run.sh)
* [kill.sh](#kill.sh)
* [enter.sh](#enter.sh)
* [consumer.sh](#consumer.sh)
* [publisher.sh](#publisher.sh)
* [mocha.sh](#mocha.sh)

## <a name="prerequisites"></a>Prerequisites
[Docker](https://docs.docker.com/install/#supported-platforms) must be 
installed on your host machine.
> If you are using a Windows 10 machine, 
[Hyper-V must be enabled](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v).

## <a name="quickstart"></a>Quickstart
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

**7) Kill Bill (and the whole application):**
`./scripts/kill.sh`

## <a name="advanced-usage"></a>Advanced Usage
### <a name="helper-scripts"></a>Helper Scripts
There are several bash scripts which help simplify execution of the most common tasks.
#### <a name="build.sh"></a>build.sh
Uses the docker-compose file to build the Docker images from their corresponding dockerfiles.

Accepts one argument, designating which service's image to build. Builds all of them if no arguments are passed.
> Also accepts service names with the "rabbitmq_" prefix removed.
  
*Example:*  
`./scripts/build.sh rabbitmq_publisher`

#### <a name="run.sh"></a>run.sh
Creates (if necessary) and runs the Docker containers for the services specified in the docker-compose.yml file.

Accepts one argument, designating which service's container to run. Runs them all except for the testing container, if no arguments are passed.
> Also accepts service names with the "rabbitmq_" prefix removed.

*Example:*  
`./scripts/run.sh rabbitmq_publisher`

#### <a name="kill.sh"></a>kill.sh
Destroys all of the Docker containers.

Does not accept any arguments

*Example:*  
`./scripts/kill.sh

#### <a name="enter.sh"></a>enter.sh
Launches a shell inside the designated container. The container must already be up and running.

Accepts one **required** argument, designating which service's container to launch the shell inside of.
> Also accepts service names with the "rabbitmq_" prefix removed.

*Example:*  
`./scripts/enter.sh rabbitmq_consumer`

#### <a name="consumer.sh"></a>consumer.sh
Manually starts the consumer container's watch process to monitor the message queues. This process is automatically started anytime the helper scripts are used to start the container. Therefore, this script is mainly used when the consumer process dies.

Accepts one argument which, if any truthy value, will run the consumer process in a detached state. By default, runs the process in the foreground.

*Example:*  
`./scripts/consumer.sh -d`

#### <a name="publisher.sh"></a>publisher.sh
Sends messages to the RabbitMQ server queues, which will eventually get processed by the consumer.

Accepts one **required** argument and up to two **optional** arguments.  

* **First argument** (required): 
  * Specifies which action is to be performed. Must be one of: _*SEE*_, _*ADD*_, or _*MOVE*_ (case-insensitive).
* **Second argument**: 
  * If the action is _*ADD*_, this is the name of the unicorn to be added. 
  * If the action is _*MOVE*_, this is the ID number of the unicorn to be moved.
* **Third argument**:
  * This is the location to _*ADD*_ or _*MOVE*_ the unicorn to (case-insensitive).

*Examples*:  
`./scripts/publisher.sh add Bill pasture`  
`./scripts/publisher.sh move 13 corral`  
`./scripts/publisher.sh see`

#### <a name="mocha.sh"></a>mocha.sh
Mocha.js is the name of the testing framework used for this project. This helper script executes all of the tests by launching a temporary container which the testing framework is already configured to run in. If you'd like to keep the container alive to interact with it, use the run.sh helper script, like so: `./scripts/run.sh tester`.  

Does not accept any arguments.

*Example:*  
`./scripts/mocha.sh`