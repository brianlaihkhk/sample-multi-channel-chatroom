# Coding sample
Coding sample - Multi-channel chatroom - Submitted by Brian Lai

### Features

- Registered user is able to create / manage / delete their channel
- Support guest join-in
- Logout all session supported
- Old chat data will be persisted, user is able to load pervious conversions when scrolling
- Secure communication between client and server using channel key
- Message queue design for scale out capability
- Cloud ready and Docker ready solution

### Framework 

- [Client]
    - angular

- [Control (Handle user registeration, guest / user login, and archive message retrieve)]
    - nodeJs
    - express
    - express-jwt
    - passportJs
    - cryptoJs
    - jsonwebtoken (JWT for session + auth token)
    - Mongoose
    - Docker

- [Chat (Receive and broadcast client chat message)]
    - nodeJs
    - express
    - express-ws
    - cryptoJs
    - amqplib
    - Mongoose
    - Docker

- [Message (Store message to MongoDB from message broker)]
    - nodeJs
    - cryptoJs
    - amqplib
    - Mongoose
    - Docker

### Flow

- [AWS solution]
    - (Registration) Client <-> Control
    - (Send message) Client <-> Control <-> Amq / RabbitMq
    - (Receive message) Amq / RabbitMq <-> **AWS ApiGateway** <-> Client
    - (Store archive) Amq / RabbitMq <-> Message <-> MongoDB
    - (Load archive) Client <-> Control <-> MongoDB

- [non-AWS solution]
    - (Registration) Client <-> Control
    - (Send message) Client <-> Control <-> RabbitMq
    - (Receive message) RabbitMq <-> **Chat** <-> Client
    - (Store archive) RabbitMq <-> Message <-> MongoDB
    - (Load archive) Client <-> Control <-> MongoDB

### Folder

- Client : Frontend-UI
- Control : Handler for client request (Registration / Login / Channel management / Send message to Amq / RabbitMq)
- Chat : Receive and broadcast message to client using websocket and Amq / RabbitMq
- Message : Store message from Amq / RabbitMq to MongoDB as archive
- Deploy : Deployment script
- Tools : Tools for encryption, encoding and local server script for testing
- Setup : Setup script for database initialization
- Documentation : Documentation
- Screenshot : Application screenshots

### Prerequsite

- MongoDB

- [Client Application]
    - angularJs
    - npm

- [AWS solution]
    - AWS-cli
    - AWS IAM setup with AWS Lambda deployment capability
    - AWS VPC setup that AWS Lambda is able to connect to public and to MongoDB 
    - Amq / RabbitMq server
    - AWS ApiGateway
    - AWS ECS / EKS / Kubernetes
    - nodejs
    - npm

- [non-AWS solution]
    - nodeJs
    - npm
    - Docker / Kubernetes

- For more details please refer to Documentation folder


### URL request structure

- For further information please refer to Documentation folder

- Control

| Endpoint        | Request type           |
| ------------- | ----- |
| /login     |   POST |
| /guest      |  POST |
| /user      |  GET, POST, PUT |
| /user/`user_id`      |  GET |
| /channel/?title=`title`&limit=`limit`&start=`start`      |  GET |
| /channel/`channel_id`      |  GET, POST, DELETE |
| /channel/`channel_id`/`user_id`      |  POST, DELETE |
| /key/`channel_id`      |  GET |
| /archive/`channel_id`/?before=`time`&limit=`limit`&start=`start`      |  GET |


- Chat

| Endpoint        | Request type           |
| ------------- | ----- |
| /chat/`channel_id`  | WS |

### Technical Assessment Requirement

- Require to use websocket to receive chatroom conversations
- User is able to create their channels, support private or public channel settings
- User is able to retrieve old conversion data
- Support distributed design for scale out feasbility
- Calls and creditals should be secured
- Logging / documentation and testing are expected as part of the solution.

### Time limit

- 72 hours

### Q&A

- Why RabbitMQ / Amazon MQ?
    - Using MQ for internal distribution through exchange, distribute message internal to message queue
    - Able to create / update / delete anonymous topic and queue
    - MQ are decouple design from producer, suitable for multiple consumer but consumes offset differently
    - Kafka or AWS Kinesis are unable to create consumer group dynamically
    - Kafka or AWS Kinesis are couple design from producer, suitable for distributed consumer but consumes without offset adjustment frequently

### Contact
- Linkedin : https://linkedin.com/in/brianlaihkhk/
- Github : https://github.com/brianlaihkhk/
