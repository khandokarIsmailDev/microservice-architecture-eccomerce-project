import amqp from "amqplib";
import redis from "./redis";

const receieveFormQueue = async (queue:string,callback:(message:string) => void) =>{
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = 'order';
    await channel.assertExchange(exchange,'direct',{durable:true});

    const q = await channel.assertQueue(queue,{durable:true});
    await channel.bindQueue(q.queue,exchange,queue);

    channel.consume(q.queue,(msg) =>{
        if(msg){
            callback(msg.content.toString());
        }
    },{noAck:true})
}

receieveFormQueue("clear-cart",(message) =>{
    console.log(`Received ${message} from clear-cart queue`);
    const parsedMsg = JSON.parse(message);

    const cartSessionId = parsedMsg.cartSessionId;
    redis.del(`session:${cartSessionId}`)
    redis.del(`cart:${cartSessionId}`)

    console.log(`Cart Cleard!`)
})