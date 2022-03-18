# Coding assessment
Coding assessment - Multi-channel chatroom - Submitted by Brian Lai

### Features

- Registered user is able to create / manage / delete their channel
- Support guest join-in
- Loose search for past history
- You can select your deployment solution depending on using AWS service or not :
| Solution | Description |
| ------ | ------ |
| AWS | Kinesis + ApiGateway + Lambda |
| non-AWS solution | Apache Kafka (or other message broker that is supported by Apache Flink) + Message application |

### Framework 

[AWS solution]
- Serverless

[non-AWS solution]
- Apache Flink

### Folder

- AWS : Chat message distribution and storage using AWS
- Message : Chat message distribution and storage using non-AWS (Containerized application for custom distribution solution)
- Client : Client application for UI, message validation, and send message to message broker
- Documentation : Documentation
- Setup : Setup script for database initialization
- Deploy : Deployment script for Message application
- Tools : Tools for encryption, encoding and local server script for testing

### Prerequsite

- MongoDB

[Client Application]
- AngularJs
- NodeJs

[AWS solution]
- AWS-cli
- AWS IAM setup with AWS Lambda deployment capability
- AWS VPC setup that AWS Lambda is able to connect to public and to MongoDB 
- Serverless framework
- Nodejs

[non-AWS solution]
- Java 8 or above
- npm
- Docker
- Maven

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
- Linkedin : https://www.linkedin.com/in/brianlaihkhk/
- Github : https://github.com/brianlaihkhk/
