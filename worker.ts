import { parentPort, workerData } from "worker_threads";
import sync = require('./sync');

if (!parentPort)
{
    console.error('This script is for Worker!!');
    process.exit(-1);
} 

const opts:sync.Options = workerData;
const parent = parentPort!;

const ONERROR = Buffer.from([0xff, 0xff, 0xff, 0xff]);

class WorkerClient implements sync.Client
{
    address:string;
    clientId:number;
    port:number;

    connected():void
    {
        const out = Buffer.alloc(10);
        out.writeInt32LE(this.clientId, 0);
        const bytes = this.address.split('.');
        out[4] = +bytes[0];
        out[5] = +bytes[1];
        out[6] = +bytes[2];
        out[7] = +bytes[3];
        out.writeUInt16LE(this.port, 8);
        
        parent.postMessage(out);
    }
    message(origin:sync.Origin, msg:Buffer)
    {
        const out = Buffer.alloc(msg.length + 12);
        out.writeInt32LE(this.clientId | (origin << 31), 0);
        out.set(msg, 4);
        parent.postMessage(out);
    }
    disconnected():void
    {
        const out = Buffer.alloc(4);
        out.writeUInt32LE(this.clientId, 0);
        parent.postMessage(out);
    }
}
opts.onError = err=>{
    const stack = Buffer.from(err.stack!, 'utf-8');
    parent.postMessage(Buffer.concat([ONERROR, stack]));
};
sync.bind(()=>new WorkerClient, opts);