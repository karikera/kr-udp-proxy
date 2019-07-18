import { parentPort, workerData } from "worker_threads";
import dgram = require('dgram');
import { Origin, Options } from './common';

const opts:Options = workerData;

if (!parentPort)
{
    console.error('This script is for Worker!!');
    process.exit(-1);
} 

const parent = parentPort!;

const idmap = new Map<string, number>();
const clients:dgram.Socket[] = [];
const empties:number[] = [];
const socket = dgram.createSocket('udp4');
const keepPortTimeout = opts.keepPortTimeout || 10000;

function getClientId(address:string, port:number):number
{
    const name = address+':'+port;
    const idout = idmap.get(name);
    if (idout !== undefined) return idout;

    let clientId:number;
    if (empties.length !== 0)
    {
        clientId = empties.pop()!;
    }
    else
    {
        clientId = clients.length;
    }

    const out = Buffer.alloc(10);
    out.writeInt32LE(clientId, 0);
    const bytes = address.split('.');
    out[4] = +bytes[0];
    out[5] = +bytes[1];
    out[6] = +bytes[2];
    out[7] = +bytes[3];
    out.writeUInt16LE(port, 8);
    parent.postMessage(out);

    const client = dgram.createSocket('udp4');
    clients[clientId] = client;
    idmap.set(name, clientId);
    
    const close = ()=>{
        console.log(name+ ' closed');
        clients[clientId] = <any>undefined;
        empties.push(clientId);
        client.removeListener('message', message);
        client.close();

        const out = Buffer.alloc(4);
        out.writeUInt32LE(clientId, 0);
        parent.postMessage(out);
    };
    let aliveTimeout:NodeJS.Timeout = setTimeout(close, keepPortTimeout);
    const message = (msg:Buffer, remote:dgram.RemoteInfo)=>{
        socket.send(msg, port, address, err=>{
            if (err) console.error(err);
        });
        clearTimeout(aliveTimeout);
        aliveTimeout = setTimeout(close, keepPortTimeout);

        send(clientId, msg, remote, Origin.Server);
    };
    client.on('message', message);
    return clientId;
}

function send(clientId:number, msg:Buffer, remote:dgram.RemoteInfo, origin:Origin):void
{
    const out = Buffer.alloc(msg.length + 12);
    out.writeInt32LE(clientId | (origin << 31), 0);
    out.set(msg, 4);
    parent.postMessage(out);
}


socket.on('message', (msg, remote)=>{
    const clientId = getClientId(remote.address, remote.port);
    clients[clientId].send(msg, opts.toPort, opts.toAddress, err=>{
        if (err) console.error(err);
    });
    if (msg.byteLength === 0) return;
    send(clientId, msg, remote, Origin.Client);
});
socket.bind(opts.fromPort, opts.fromAddress);

