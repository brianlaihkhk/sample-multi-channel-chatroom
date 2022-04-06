export interface Channel {
    id : string;
    alias : string;
    title : string;
    description : string;
    private: boolean;
    creator? : string;
    key? : string;
    members? : string[];
}
