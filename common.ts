
import { Socket } from 'dgram';

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
    socket?:Socket; // for sync is true
    
    // if sync is true
    //  return undefined - do nothing
    //  return null - remove packet
    //  return Buffer - modify packet
    message(origin:Origin, msg:Buffer):void|Buffer|null; 
    
    connected():void;
    disconnected():void;
}
