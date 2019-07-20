
import { Worker } from 'worker_threads';
import path = require('path');
import sync = require('./sync');
import common = require('./common');

export type Client = common.Client;
export type Options = common.Options;
export const Origin = common.Origin;
export type Origin = common.Origin;

export function bind(
    newClient:()=>sync.Client,
    opts:Options):void
{
    const onError = opts.onError;
    delete opts.onError;

    const receiveClients:(sync.Client|undefined)[] = [];
    const receiver = new Worker(path.resolve(__dirname, 'worker.js'), {
        workerData:opts
    });

    receiver.on('message', (buffer:Uint8Array)=>{
        const message = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        const first = message.readInt32LE(0);
        if (first === -1)
        {
            if (onError)
            {
                const stack = message.subarray(4).toString('utf-8');
                const errmsg = stack.substring(8, stack.indexOf('\n'));
                const err = Error(errmsg);
                err.stack = stack;
                onError(err);
            }
            return;
        }
        const clientId = first & 0x7fffffff;
        let client = receiveClients[clientId];
        if (!client)
        {
            const address = `${message[4]}.${message[5]}.${message[6]}.${message[7]}`;
            const port = message.readUInt16LE(8);
            client = newClient();
            client.clientId = clientId;
            client.address = address;
            client.port = port;
            receiveClients[clientId] = client;
            client.connected();
            return;
        }
        if (message.length <= 4)
        {
            client.disconnected();
            receiveClients[clientId] = undefined;
            return;
        }

        const origin:Origin = (first >>> 31);
        client.message(origin, message.subarray(4));
    });
    if (onError)
    {
        receiver.on('error', onError);
    }
}    
