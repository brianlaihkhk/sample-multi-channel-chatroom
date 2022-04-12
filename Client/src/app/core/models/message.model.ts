export interface Message {
    event : string;
    data : {
        messageId : string;
        creator: string;
        message: string;
        channel: string;
        createdAt : Date;
    }
}
