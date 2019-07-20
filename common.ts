
export enum Origin
{
    Server,
    Client
}

export interface Options
{
    fromAddress?:string;
    fromPort:number;
    toAddress:string;
    toPort:number;
    keepPortTimeout?:number;
    onError?:(error:Error)=>void;
}

export interface Client
{
    clientId?:number;
    address?:string;
    port?:number;
    connected():void;
    message(origin:Origin, msg:Buffer):void;
    disconnected():void;
}
