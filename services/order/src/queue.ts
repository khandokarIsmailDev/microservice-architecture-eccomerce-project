import amqp from "amqplib";
import { QUEUE_URL } from "./config";


const sendToQueue = async(queue:string,message:string) =>{
    const connection = await amqp.connect(QUEUE_URL);
    const channle = await connection.createChannel()

    const exchange = "order";
    await channle.assertExchange(exchange,"direct",{durable:true});

    channle.publish(exchange,queue,Buffer.from(message) );
    console.log(`Sent ${message} to ${queue}`);

    setTimeout(()=>{
        connection.close();
        // process.exit(0);
    },500);
}

export default sendToQueue;