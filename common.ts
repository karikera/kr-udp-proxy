
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
}
