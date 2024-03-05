const amqp = require('amqplib');

async function receive() {
  const conn = await amqp.connect('amqp://user:password@rabbitmqservice');
  const channel = await conn.createChannel();
  
  const queue = 'hello';

  await channel.assertQueue(queue, { durable: false });
  
  console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
  channel.consume(queue, function(msg) {
    console.log(" [x] Received %s", msg.content.toString());
  }, {
    noAck: true
  });
}

receive();
