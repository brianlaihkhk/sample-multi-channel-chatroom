conn = new Mongo();
db = conn.getDB("Chat");

db.createUser(
    {
        user: "control",
        pwd: "MusicRocks+",
    
        roles:[{
            role: "readWrite" ,
            db: "Chat"
        }]
    }
);

db.createUser(
    {
        user: "message",
        pwd: "MangoJuice%",
    
        roles:[{
            role: "readWrite" ,
            db: "Chat"
        }]
    }
);

