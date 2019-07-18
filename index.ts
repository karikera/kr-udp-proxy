
import { Worker } from 'worker_threads';
import common = require('./common');

export type Origin = common.Origin;
export const Origin = common.Origin;

export interface Client
{
    new(address:string, port:number):Client;
    message(origin:Origin, msg:Buffer):void;
    close():void;
    finallize():void;
}

export function bind(
    newClient:{new(address:string, port:number):Client},
    opts:common.Options):void
{
    const receiveClients:(Client|undefined)[] = [];
    const receiver = new Worker('./worker.js', {
        workerData:opts
    });
    receiver.on('message', (buffer:Uint8Array)=>{
        const message = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        const first = message.readInt32LE(0);
        const clientId = first & 0x7fffffff;
        let client = receiveClients[clientId];
        if (!client)
        {
            const address = `${message[4]}.${message[5]}.${message[6]}.${message[7]}`;
            const port = message.readUInt16LE(8);
            client = new newClient(address, port);
            receiveClients[clientId] = client;
            return;
        }
        if (message.length <= 4)
        {
            client.close();
            receiveClients[clientId] = undefined;
            return;
        }

        const origin:Origin = (first >>> 31);
        client.message(origin, message.subarray(4));
    });
}
