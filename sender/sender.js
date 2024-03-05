const amqp = require('amqplib');

const queue = 'hello';
let counter = 0;

const connectAndSend = async () => {
  try {
    const connection = await amqp.connect('amqp://user:password@rabbitmqservice');
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: false });

    setInterval(() => {
      const message = `Message ${++counter}`;
      channel.sendToQueue(queue, Buffer.from(message));
      console.log(`Sent: ${message}`);
    }, 3000); // Verstuur elke 3 seconden

  } catch (error) {
    console.error('Error:', error);
  }
};

connectAndSend();
