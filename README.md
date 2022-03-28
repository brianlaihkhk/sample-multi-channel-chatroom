# Coding sample
Coding sample - Multi-channel chatroom - Submitted by Brian Lai

### Features

- Registered user is able to create / manage / delete their channel
- Support guest join-in
- Old chat data will be persisted, user is able to load pervious conversions when scrolling
- Secure communication between client and server using encrypted e2e message
- Cloud ready and Docker ready solution

### Framework 

- [Client]
    - angularJs
    - react-script

- [Control (Handle user registeration and client chat message)]
    - nodeJs
    - kafkaJs (if using Apache Kafka / AWS MSK)
    - AWS.kinesis (if using AWS Kinesis)
    - (AWS Solution) Serverless
    - (non-AWS Solution) Docker

- [Broadcast (Broadcast client chat message)] - non-AWS solution only
    - nodeJs
    - kafkaJs (if using Apache Kafka)
    - AWS.kinesis (if using AWS Kinesis)
    - Websocket
    - Docker

- [Message (Message archieve retriever)]
    - nodeJs
    - kafkaJs
    - Mongoose
    - (AWS Solution) Serverless
    - (non-AWS Solution) Docker

### Flow

- [AWS solution]
    - (Registration) Client <-> Control
    - (Send message) Client <-> Control <-> AWS Kinesis / AWS MSK / Apache Kafka
    - (Receive message) AWS Kinesis / AWS MSK / Apache Kafka <-> **AWS ApiGateway** <-> Client
    - (Store archieve) AWS Kinesis / AWS MSK / Apache Kafka <-> Message <-> MongoDB
    - (Load archieve) Client <-> Message <-> MongoDB

- [non-AWS solution]
    - (Registration) Client <-> Control
    - (Send message) Client <-> Control <-> Apache Kafka
    - (Receive message) Apache Kafka <-> **Broadcast** <-> Client
    - (Store archieve) Apache Kafka <-> Message <-> MongoDB
    - (Load archieve) Client <-> Message <-> MongoDB

### Folder

- Client : Frontend-UI
- Control : Handler for client request (Registration / Login / Channel management / Send message to Kafka / Kinesis)
- Broadcast : Require if using Kafka. Broadcast message to client using websocket
- Message : Message archieve retriever. Load previous message
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
    - AWS Kinesis / AWS MSK / Apache Kafka server
    - AWS ApiGateway
    - Serverless framework
    - nodejs
    - npm

- [non-AWS solution]
    - nodeJs
    - npm
    - Docker

- For more details please refer to Documentation folder


### URL request structure

- For further information please refer to Documentation folder

- Control
   - /register
   - /login
   - /session
   - /channel/`uuid`
   - /message/`uuid`

- Broadcast
   - /listen/`uuid`

- Message
   - /archieve/`uuid`/`from_time_in_epoch_format`

### Technical Assessment Requirement

- Require to use websocket to receive chatroom conversations
- User is able to create their channels, support private or public channel settings
- User is able to retrieve old conversion data
- Support distributed design for scale out feasbility
- Calls and creditals should be secured
- Logging / documentation and testing are expected as part of the solution.

### Time limit

- 72 hours

### Contact
- Linkedin : https://linkedin.com/in/brianlaihkhk/
- Github : https://github.com/brianlaihkhk/
