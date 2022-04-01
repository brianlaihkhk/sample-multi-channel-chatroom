conn = new Mongo();
db = conn.getDB("Chat");

db.createCollection( "User", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [ "username", "guest", "hash", "salt", "channel", "createdAt" ],
            properties: {
                username: {
                    bsonType: "string",
                    description: "must be a string and is required"
                },
                guest: {
                    bsonType: "bool",
                    description: "Check if guest or not"
                },
                hash: {
                    bsonType: "string",
                    description: "Hash of password"
                },
                salt: {
                    bsonType: "string",
                    description: "Salt of password"
                },
                channel: {
                    bsonType: "array",
                    description: "Joined channel",
                    minItems: 0,
                    uniqueItems: true,
                    additionalProperties: false,
                    items: {
                        bsonType: "string",
                        description: "Channel Ids"
                    }
                },
                createdAt: {
                    bsonType: "date",
                    description: "Date"
                }
            }
        }
        }
});


db.createCollection( "Channel", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [ "creator", "title", "description", "private", "visible", "key", "members", "createdAt" ],
            properties: {
                creator: {
                    bsonType: "string",
                    description: "creator id"
                },
                title: {
                    bsonType: "string",
                    description: "Channel title"
                },
                description: {
                    bsonType: "string",
                    description: "Channel description"
                },
                private: {
                    bsonType: "bool",
                    description: "is private group"
                },
                visible: {
                    bsonType: "bool",
                    description: "is visible group (For deletion)"
                },
                key: {
                    bsonType: "string",
                    description: "Websocket key"
                },
                members: {
                    bsonType: "array",
                    description: "Members who join channel",
                    minItems: 0,
                    uniqueItems: true,
                    additionalProperties: false,
                    items: {
                        bsonType: "string",
                        description: "Member Ids"
                    }
                },
                createdAt: {
                    bsonType: "date",
                    description: "Date"
                }
            }
        }
        }
});



db.createCollection( "Message", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [ "creator", "message", "channel", "createdAt" ],
            properties: {
                creator: {
                    bsonType: "string",
                    description: "creator id"
                },
                message: {
                    bsonType: "string",
                    description: "Message"
                },
                channel: {
                    bsonType: "string",
                    description: "Channel id"
                },
                createdAt: {
                    bsonType: "date",
                    description: "Date"
                }
            }
        }
        }
});

db.getCollectionNames();