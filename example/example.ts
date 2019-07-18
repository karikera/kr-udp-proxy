
import udpproxy = require('..');

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

udpproxy.open(Client, {
    fromPort: 19134, 
    toAddress: '127.0.0.1', 
    toPort: 19132,
    // keepPortTimeout: 10000, // default
});
