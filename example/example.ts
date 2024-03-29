
import udpproxy = require('..');

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
        /*
        // if sync option is true
        return null; // remove packet
        return Buffer.alloc(1); // modify packet
        */
    
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

    /*
    // if sync option is true
    message(origin:udpproxy.Origin, msg:Buffer):Buffer|null
    {
        if (msg[0] === 0xfe) return null; // cancel packet sending
        return msg;
    }
    */

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
