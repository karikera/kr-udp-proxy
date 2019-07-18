### What is This?
UDP proxy server library with Worker-Thread  
Worker-Thread opens server and dupplicates message to Main Thread  
So..  It cannot modifies data but Asynchronous!  
It ONLY supports IPv4  
It will keeps same port during 10secs  

```ts
// TypeScript

const udpproxy = require('kr-udp-proxy');

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
        case udpbind.Origin.Server:
            console.log(`Server to ${this.address}:${this.port}> ${msg.toString('utf-8')}`);
            break;
        case udpbind.Origin.Client:
            console.log(`${this.address}:${this.port} to Server> ${msg.toString('utf-8')}`);
            break;
        }
    }
}

udpproxy.open(Client, {
    fromPort: 19134, 
    toAddress: '127.0.0.1', 
    toPort: 19132,
    // keepPortTimeout: 10000, // default
});

```