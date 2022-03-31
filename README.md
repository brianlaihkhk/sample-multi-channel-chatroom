# Coding sample
Coding sample - Multi-channel chatroom - Submitted by Brian Lai

### Features

- Registered user is able to create / manage / delete their channel
- Support guest join-in
- Old chat data will be persisted, user is able to load pervious conversions when scrolling
- Secure communication between client and server using encrypted e2e message
- Use message broker instead of CURD operation in controller service for mass scale out capability
- Cloud ready and Docker ready solution
- Written in typescript to provide capability for DI / IoC

### Framework 

- [Client]
    - angularJs

- [Control (Handle user registeration, client chat message, archive message retrieve)]
    - nodeJs
    - expressJs
    - passportJs
    - crypto (Password encryption using salt + hash)
    - jsonwebtoken (JWT for session + auth token)
    - Mongoose
    - kafkaJs (if using Apache Kafka / AWS MSK)
    - AWS.kinesis (if using AWS Kinesis)
    - Docker

- [Broadcast (Broadcast client chat message)] - non-AWS solution only
    - nodeJs
    - expressJs
    - kafkaJs (if using Apache Kafka)
    - AWS.kinesis (if using AWS Kinesis)
    - Websocket
    - Docker

- [Message (Store message to MongoDB from message broker)]
    - kafkaJs (if using Apache Kafka / AWS MSK)
    - AWS.kinesis (if using AWS Kinesis)
    - Docker

### Flow

- [AWS solution]
    - (Registration) Client <-> Control
    - (Send message) Client <-> Control <-> AWS Kinesis / AWS MSK / Apache Kafka
    - (Receive message) AWS Kinesis / AWS MSK / Apache Kafka <-> **AWS ApiGateway** <-> Client
    - (Store archive) AWS Kinesis / AWS MSK / Apache Kafka <-> Message <-> MongoDB
    - (Load archive) Client <-> Control <-> MongoDB

- [non-AWS solution]
    - (Registration) Client <-> Control
    - (Send message) Client <-> Control <-> Apache Kafka
    - (Receive message) Apache Kafka <-> **Broadcast** <-> Client
    - (Store archive) Apache Kafka <-> Message <-> MongoDB
    - (Load archive) Client <-> Control <-> MongoDB

### Folder

- Client : Frontend-UI
- Control : Handler for client request (Registration / Login / Channel management / Send message to Kafka / Kinesis)
- Broadcast : Require if using Kafka. Broadcast message to client using websocket
- Message : Store message from Kinesis or Kafka to MongoDB
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

| Endpoint        | Request type           |
| ------------- | ----- |
| /register  | POST |
| /login     |   POST |
| /guest      |  POST |
| /user      |  GET, POST, PUT |
| /user/`user_id`      |  GET |
| /channel/?title=`title`&limit=`limit`&start=`start`      |  GET |
| channel/`channel_id`      |  POST, DELETE |
| channel/`channel_id`/`user_id`      |  POST, DELETE |
| /message/`channel_id`/?before=`time`&limit=`limit`&start=`start`      |  GET |


- Broadcast

| Endpoint        | Request type           |
| ------------- | ----- |
| /listen/`channel_id`  | WS |

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

- Kafka or Kinesis?
    - Kafka
        - Pre-front setup cost (hardware)
        - Initial cost on setup, additional cost only if you want to setup clusters
        - No cost on adding partition
        - TTL can change depends on retention policy

    - Kinesis 
        - No pre-front setup cost
        - Initial cost is low, but additional cost will rapily increase compare to Kafka
        - Each shard throughput is 1MB / Fan-out 2MB (~1000 messages/sec for 1KB message each)
        - Adding shard (Partition) costs more when your topics need replica / fault tolerance
        - Black-box design. No documentation on Kinesis architecture
        - TTL is fixed on 7 days. Cannot change

- AWS or no-AWS?
    - AWS
        - Boardcast server can be skipped if using AWS ApiGateway
        - Message server can be skipped if using AWS Firehose + MongoDB cloud
        - Save deployment and maintenance effort using ECS / Kubernetes / Terraform
        - Not suggest to use AWS Lambda as
            - (1) Lambda only supports single endpoint per script, 
            - (2) Costly if using as Boardcast and Message server

    - non-AWS
        - Need to build your Kubnernetes for container orchestration
        - Need to setup Boardcast and Message server
        - Fit for on-prem design
        - More deployment and maintenance effort like server troubleshooting


### Contact
- Linkedin : https://linkedin.com/in/brianlaihkhk/
- Github : https://github.com/brianlaihkhk/
