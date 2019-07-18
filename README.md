### What is This?
UDP proxy server library with Worker-Thread  
Worker-Thread opens server and dupplicates message to Main Thread  
So..  It cannot modifies data but Asynchronous!  
It ONLY supports IPv4  
It will keeps same port during 10secs  

```ts
// TypeScript

import udpproxy = require('kr-udp-proxy');

class Client implements udpproxy.Client
{
    constructor(
        readonly address:string, 
        readonly port:number)
    {
    }

    message(origin, msg)
    {
        switch (origin)
        {
        case udpproxy.Origin.Server:
            console.log(`Server to ${this.address}:${this.port}> ${msg.toString('utf-8')}`);
            break;
        case udpproxy.Origin.Client:
            console.log(`${this.address}:${this.port} to Server> ${msg.toString('utf-8')}`);
            break;
        }
    }

    finallize()
    {
    }
}

udpproxy.bind(Client, {
    fromPort: 19134, 
    toAddress: '127.0.0.1', 
    toPort: 19132,
    // keepPortTimeout: 10000, // default
});

```