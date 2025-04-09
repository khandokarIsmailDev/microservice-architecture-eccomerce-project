import amqp from "amqplib";
import { defaultSender, transporter } from "./config";
import prisma from "./prisma";

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

receieveFormQueue("send-email",async(message) =>{
    console.log(`Received from send-email queue `);

    const parsedBody = JSON.parse(message);
    const {userEmail,grandTotal,id} = parsedBody;
    const from = defaultSender;
    const subject = 'Order Confirmation';
    const body = `Thank you for your order. Your order id is ${id}. Your total is ${grandTotal}.`;

    const emailOption = {
        from,
        to:userEmail,
        subject,
        text:body
    }

    //send the email
    const {rejected} = await transporter.sendMail(emailOption)
    if(rejected.length){
        console.log('Email rejected: ', rejected);
        return;
    }

    await prisma.email.create({
        data:{
            sender:from,
            recipient:userEmail,
            subject:'Order Confirmation',
            body,
            source:'Orderconfirmation'
        }
    })

    console.log('Email sent!')

})