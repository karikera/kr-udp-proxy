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
    clientId:number; // undefined in constructor
    address:string; // undefined in constructor
    port:number; // undefined in constructor

    connected()
    {
    }

    message(origin:udpproxy.Origin, msg:Buffer)
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

    disconnected()
    {
    }
}

udpproxy.bind(()=>new Client, {
    // fromAddress: '0.0.0.0', 
    fromPort: 19134, 
    toAddress: '127.0.0.1', 
    toPort: 19132,
    // keepPortTimeout: 10000,
    // sync: false,
    // onError: err=>{ console.error(err); }
});

```