
import common = require("./common");
import async = require("./async");
import sync = require("./sync");

export type Client = sync.Client;
export interface Options extends common.Options
{
    sync?:boolean;
}
export const Origin = common.Origin;
export type Origin = common.Origin;


export function bind(
    newClient:()=>sync.Client,
    opts:Options):void
{
    const target = opts.sync ? sync : async;
    delete opts.sync;
    target.bind(newClient, opts);
}
