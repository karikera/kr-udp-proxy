
import dgram = require('dgram');
import common = require('./common');


export interface Client extends common.Client
{
    socket?:dgram.Socket;
}
export type Options = common.Options;
export const Origin = common.Origin;
export type Origin = common.Origin;


export function bind(newClient:()=>Client, opts:Options):void
{
    const idmap = new Map<string, Client>();
    const clients:Client[] = [];
    const empties:number[] = [];
    const socket = dgram.createSocket('udp4');
    const keepPortTimeout = opts.keepPortTimeout || 10000;
    
    function getClient(address:string, port:number):Client
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
    
        const client = newClient();
        client.socket = dgram.createSocket('udp4');
        client.clientId = clientId;
        client.address = address;
        client.port = port;
    
        clients[clientId] = client;
        idmap.set(name, client);

        client.connected();
        
        const close = ()=>{
            console.log(name+ ' closed');
            clients[clientId] = <any>undefined;
            empties.push(clientId);
            idmap.delete(name);
            client.socket!.removeListener('message', message);
            client.socket!.close();
            client.disconnected();
        };
        let aliveTimeout:NodeJS.Timeout = setTimeout(close, keepPortTimeout);
        const message = (msg:Buffer, remote:dgram.RemoteInfo)=>{
            client.message(Origin.Server, msg);
            socket.send(msg, port, address, err=>{
                if (err) console.error(err);
            });
            clearTimeout(aliveTimeout);
            aliveTimeout = setTimeout(close, keepPortTimeout);
        };
        client.socket.on('message', message);
        return client;
    }
    
    socket.on('message', (msg, remote)=>{
        const client = getClient(remote.address, remote.port);
        if (msg.byteLength !== 0)
        {
            client.message(Origin.Client, msg);
        }
        client.socket!.send(msg, opts.toPort, opts.toAddress, err=>{
            if (err) console.error(err);
        });
    });
    if (opts.onError)
    {
        socket.on('error', opts.onError!);
    }
    socket.bind(opts.fromPort, opts.fromAddress);
}
